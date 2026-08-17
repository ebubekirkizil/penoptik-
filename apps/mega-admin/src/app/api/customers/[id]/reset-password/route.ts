import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/mock-prisma";
import bcrypt from "bcryptjs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return NextResponse.json({ error: "Müxteri bulunamadı." }, { status: 404 });
    }

    // 6 haneli rastgele PIN
    const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(generatedPin, 10);

    const d = new Date();
    d.setDate(d.getDate() + 7);

    await prisma.customer.update({
      where: { id },
      data: {
        password: hashedPassword,
        isPasswordTemporary: true,
        tempPasswordExpires: d,
        tempPasswordPlain: generatedPin,
        hasLoggedBefore: false, // Force them to login with new pin and change it
      },
    });

    return NextResponse.json({ message: "Şifre sıfırlandı.", generatedPassword: generatedPin }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
