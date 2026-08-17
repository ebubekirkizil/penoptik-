import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serialCode, userId } = body;
    
    if (!serialCode || !userId) {
      return NextResponse.json({ success: false, message: "Eksik bilgi" }, { status: 400 });
    }

    const card = await db.nfcCard.findUnique({ where: { serialCode } });

    if (!card) {
      return NextResponse.json({ success: false, message: "Kart bulunamadı" }, { status: 404 });
    }
    
    if (card.userId) {
      return NextResponse.json({ success: false, message: "Bu kart zaten baxka bir hesaba tanımlı." }, { status: 400 });
    }

    await db.nfcCard.update({
      where: { serialCode },
      data: { userId }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("NFC Setup Error:", error);
    return NextResponse.json({ success: false, message: "Sunucu hatası" }, { status: 500 });
  }
}
