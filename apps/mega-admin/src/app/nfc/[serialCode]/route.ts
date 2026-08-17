import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function GET(request: Request, { params }: { params: Promise<{ serialCode: string }> | { serialCode: string } }) {
  const { serialCode } = await params;
  const url = new URL(request.url);

  try {
    // 1. MEGA ADMIN CARD CHECKER MODU KONTROLÜ
    const cookieStore = await cookies();
    const isCheckerMode = cookieStore.get('card_checker_mode')?.value === 'true';

    if (isCheckerMode) {
      return NextResponse.redirect(new URL(`/super-admin/nfc/checker?scanned=${serialCode}`, url));
    }

    // 2. KART ARAMA
    let card = await db.nfcCard.findUnique({
      where: { serialCode },
      include: { 
        user: { 
          include: { 
            nfcProfile: true 
          } 
        } 
      }
    });

    // 3. KART DİREKT HİÇ YOKSA OTOMATİK OLUŞTUR (SUPER ADMIN DANIŞMANLIĞI İÇİN)
    if (!card) {
      const actCode = Math.floor(1000 + Math.random() * 9000).toString();
      card = await db.nfcCard.create({
        data: {
          serialCode,
          activationCode: actCode,
          isActive: true
        },
        include: { user: { include: { nfcProfile: true } } }
      });
    }

    if (!card.isActive) {
      return NextResponse.redirect(new URL('/nfc-error/inactive', url));
    }

    // 4. KARTIN KULLANICI VEYA PROFİLİ YOKSA OTOMATİK İNİTİALİZE ET
    let profileSlug = card.user?.nfcProfile?.slug;

    if (!card.userId || !card.user?.nfcProfile || !profileSlug) {
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

      const newSlug = `card-${serialCode.toLowerCase()}-${crypto.randomBytes(2).toString('hex')}`;
      const newProfile = await db.nfcProfile.create({
        data: {
          userId: userId,
          slug: newSlug,
          name: `Kart ${serialCode}`,
          title: "Özel Kart Profili",
          themeColor: "#2563EB",
          isPublished: true
        }
      });

      profileSlug = newProfile.slug;
    }

    // 5. YÖNLENDİRME
    const passParam = url.searchParams.get('pass');
    const redirectUrl = new URL(`/p/${profileSlug}`, url);
    redirectUrl.searchParams.set('ref', serialCode);
    
    const response = NextResponse.redirect(redirectUrl);

    if (passParam && card.activationCode && passParam === card.activationCode) {
      response.cookies.set('nfc_bypass', profileSlug, {
        maxAge: 3600,
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

    return response;
  } catch (error) {
    console.error("NFC Redirect Error:", error);
    return NextResponse.redirect(new URL('/nfc-error/system', url));
  }
}
