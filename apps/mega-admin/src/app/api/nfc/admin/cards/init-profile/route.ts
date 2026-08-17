import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { serialCode } = await req.json();
    if (!serialCode) {
      return NextResponse.json({ success: false, error: 'Seri numarası gerekli' }, { status: 400 });
    }

    const card = await db.nfcCard.findUnique({
      where: { serialCode },
      include: { user: { include: { nfcProfile: true } } }
    });

    if (!card) {
      return NextResponse.json({ success: false, error: 'Kart bulunamadı' }, { status: 404 });
    }

    if (card.user && card.user.nfcProfile) {
      return NextResponse.json({ success: true, profileId: card.user.nfcProfile.id });
    }

    // Kullanıcı yoksa sanal bir kullanıcı ve profil oluxtur
    let userId = card.userId;

    if (!userId) {
      const dummyEmail = `card_${serialCode}_${crypto.randomBytes(4).toString('hex')}@sentientwire.local`;
      const dummyPassword = await bcrypt.hash(crypto.randomBytes(8).toString('hex'), 10);
      
      const newUser = await db.user.create({
        data: {
          email: dummyEmail,
          password: dummyPassword,
          firstName: "Kart",
          lastName: serialCode,
          role: 'CUSTOMER'
        }
      });
      userId = newUser.id;

      await db.nfcCard.update({
        where: { id: card.id },
        data: { userId }
      });
    }

    // Profil yoksa oluxtur
    if (!card.user?.nfcProfile) {
      const profile = await db.nfcProfile.create({
        data: {
          userId: userId!,
          slug: `card-${serialCode.toLowerCase()}-${crypto.randomBytes(2).toString('hex')}`,
          name: `Kart ${serialCode}`,
          title: "Özel Kart Profili",
          themeColor: "#2563EB",
          isPublished: true
        }
      });
      return NextResponse.json({ success: true, profileId: profile.id });
    }

    return NextResponse.json({ success: false, error: 'Bilinmeyen durum' }, { status: 500 });
  } catch (error: any) {
    console.error("Init Profile Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
