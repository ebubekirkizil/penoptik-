import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Force rebuild 2
export const revalidate = 0;

export async function GET() {
  try {
    // Tüm kartları al, sadece sayılardan oluxan serialCode'ları bul ve en büyüğünü tespit et
    const cards = await db.nfcCard.findMany({
      select: { serialCode: true }
    });

    let maxNum = 0;
    for (const card of cards) {
      if (!card.serialCode || typeof card.serialCode !== 'string') continue;
      if (card.serialCode.match(/^\d+$/)) {
        const num = parseInt(card.serialCode, 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    }

    const nextNum = maxNum + 1;
    // 3 haneli formatta (örn: 001, 002, 105)
    const nextSerial = nextNum.toString().padStart(3, '0');

    return NextResponse.json({ success: true, nextSerial });
  } catch (error: any) {
    console.error("Next Serial Error:", error);
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}
