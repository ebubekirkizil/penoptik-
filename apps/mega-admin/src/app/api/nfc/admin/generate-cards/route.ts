import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { count = 50, type = "STOCK" } = body;

    const newCards = [];
    
    // Veritabanındaki en son kart numarasını bulup oradan devam edelim (001, 002 mantığı)
    const lastCard = await db.nfcCard.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    let startNumber = 1;
    if (lastCard && !isNaN(parseInt(lastCard.serialCode, 10))) {
      startNumber = parseInt(lastCard.serialCode, 10) + 1;
    }
    
    for (let i = 0; i < count; i++) {
      // 3 haneli seri no (001, 002, 050 vs.)
      const serial = String(startNumber + i).padStart(3, '0');
      
      // Rastgele 4 haneli bypass kilit xifresi
      const bypassToken = crypto.randomBytes(2).toString('hex').toUpperCase();

      newCards.push({
        serialCode: serial,
        isActive: true,
        activationCode: bypassToken, // bypass_token in UI, but activationCode in schema
      });
    }

    const created = await db.nfcCard.createMany({
      data: newCards,
    });

    return NextResponse.json({ success: true, count: created.count, cards: newCards }, { status: 201 });
  } catch (error) {
    console.error("Card Generate Error:", error);
    return NextResponse.json({ success: false, message: "Sunucu hatası" }, { status: 500 });
  }
}
