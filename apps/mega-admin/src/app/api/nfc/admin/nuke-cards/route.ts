import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const revalidate = 0;

export async function GET() {
  try {
    await db.nfcCard.deleteMany({});
    return NextResponse.json({ success: true, message: "Bütün kartlar baxarıyla silindi." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
