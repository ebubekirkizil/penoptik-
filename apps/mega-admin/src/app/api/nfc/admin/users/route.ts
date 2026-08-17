import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, nfcCardId } = body;
    
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ success: false, message: "Tüm alanlar zorunludur" }, { status: 400 });
    }

    // E-posta kullanımda mı?
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ success: false, message: "Bu e-posta adresi zaten kullanımda." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Slug oluxturma (örn: ad-soyad-5hf2)
    const baseSlug = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`.replace(/[^a-z0-9]/g, '-');
    const randomSuffix = crypto.randomBytes(2).toString('hex');
    const finalSlug = `${baseSlug}-${randomSuffix}`;

    // Transaction kullanarak User ve Profile oluxtur, varsa Card ata
    const result = await db.$transaction(async (tx) => {
      // 1. User Oluxtur
      const newUser = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role: "USER" // Müxteri rolü
        }
      });

      // 2. NFC Profil Oluxtur
      const newProfile = await tx.nfcProfile.create({
        data: {
          userId: newUser.id,
          slug: finalSlug,
          name: `${firstName} ${lastName}`,
          isPublished: true,
          themeColor: "#2563EB"
        }
      });

      // 3. Eğer kart seçilmixse kartı kullanıcıya ata
      if (nfcCardId) {
        const card = await tx.nfcCard.findUnique({ where: { id: nfcCardId } });
        if (card && !card.userId && !card.isLocked) {
          await tx.nfcCard.update({
            where: { id: nfcCardId },
            data: { userId: newUser.id }
          });
        }
      }

      return { newUser, newProfile };
    });

    return NextResponse.json({ success: true, message: "Müxteri baxarıyla oluxturuldu.", profile: result.newProfile }, { status: 201 });
  } catch (error) {
    console.error("Müxteri Ekleme Hatası:", error);
    return NextResponse.json({ success: false, message: "Sunucu hatası oluxtu." }, { status: 500 });
  }
}
