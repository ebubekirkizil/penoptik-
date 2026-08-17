import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { customerId, tempPassword, newPassword } = await req.json();

    if (!customerId || !tempPassword || !newPassword) {
      return NextResponse.json({ error: "Eksik bilgi gönderildi." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır." }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return NextResponse.json({ error: "Müxteri bulunamadı." }, { status: 404 });
    }

    // Doğrula (Temporary password doğru mu?)
    if (!customer.password) {
      return NextResponse.json({ error: "Bu hesaba ait xifre yok." }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(tempPassword, customer.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Mevcut geçici xifreniz yanlıx." }, { status: 401 });
    }

    // Şifreyi güncelle ve temp flag'leri kaldır
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        password: hashedPassword,
        isPasswordTemporary: false,
        tempPasswordExpires: null,
        hasLoggedBefore: true,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
