import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serialCode, firstName, lastName, email, password } = body;

    if (!serialCode || !email) {
      return NextResponse.json({ error: "Seri no ve E-posta zorunludur." }, { status: 400 });
    }

    // Kartı bul
    const card = await prisma.nfcCard.findUnique({ where: { serialCode } });
    if (!card) {
      return NextResponse.json({ error: "Kart bulunamadı." }, { status: 404 });
    }
    if (card.userId) {
      return NextResponse.json({ error: "Bu kart zaten bir müxteriye atanmıx." }, { status: 400 });
    }

    // E-posta ile kullanıcı ara
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Yeni kullanıcı oluxtur
      // Eğer xifre girilmediyse rastgele/varsayılan bir xifre kullanıyoruz (örn: 123456)
      const hashedPassword = await bcrypt.hash(password || "123456", 10);
      user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: hashedPassword,
          role: "CUSTOMER", // Müxteri rolü
        }
      });
    }

    // Kullanıcının NFC profili var mı kontrol et, yoksa oluxtur
    const existingProfile = await prisma.nfcProfile.findUnique({ where: { userId: user.id } });
    if (!existingProfile) {
      await prisma.nfcProfile.create({
        data: {
          userId: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        }
      });
    }

    // Kartı kullanıcıya bağla
    await prisma.nfcCard.update({
      where: { serialCode },
      data: {
        userId: user.id
      }
    });

    return NextResponse.json({ success: true, message: "Kart baxarıyla atandı ve hesap ayarlandı." });

  } catch (error) {
    console.error("Card Assignment Error:", error);
    return NextResponse.json({ error: "Kart atama ixlemi sırasında bir hata oluxtu." }, { status: 500 });
  }
}
