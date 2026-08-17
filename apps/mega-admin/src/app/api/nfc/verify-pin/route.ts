import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, pin } = body;
    
    if (!slug || !pin) {
      return NextResponse.json({ success: false, message: "Eksik bilgi" }, { status: 400 });
    }

    const profile = await db.nfcProfile.findUnique({
      where: { slug }
    });

    if (!profile) {
      return NextResponse.json({ success: false, message: "Profil bulunamadı" }, { status: 404 });
    }

    if (profile.isPinActive && profile.pinCode === pin) {
      // PIN doğru, bypass cookie'si ata (1 saatlik geçerli)
      const cookieStore = await cookies();
      cookieStore.set('nfc_bypass', slug, {
        maxAge: 3600,
        path: '/',
        httpOnly: false, // İstemci bilexeninde okunabilmesi için
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: "Hatalı PIN Kodu" }, { status: 401 });
  } catch (error) {
    console.error("PIN Verify Error:", error);
    return NextResponse.json({ success: false, message: "Sunucu hatası" }, { status: 500 });
  }
}
