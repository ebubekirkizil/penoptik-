import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// Force rebuild 2
export async function POST(req: Request) {
  try {
    const { serialCode } = await req.json();
    if (!serialCode) {
      return NextResponse.json({ success: false, error: 'Serial code is required' }, { status: 400 });
    }

    // Check if already exists
    const existing = await db.nfcCard.findUnique({ where: { serialCode } });
    if (existing) {
      return NextResponse.json({ success: true, card: existing });
    }

    // Generate random 4-char bypass token (activation code)
    const bypassToken = crypto.randomBytes(2).toString('hex').toUpperCase();

    const newCard = await db.nfcCard.create({
      data: {
        serialCode,
        isActive: true,
        activationCode: bypassToken
      }
    });

    return NextResponse.json({ success: true, card: newCard });
  } catch (error) {
    console.error("Card Create Error:", error);
    return NextResponse.json({ success: false, error: "Sunucu hatası" }, { status: 500 });
  }
}
