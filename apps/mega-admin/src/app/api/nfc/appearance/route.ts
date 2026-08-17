import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profileId, themeMode, themeColor } = body;
    
    if (!profileId) {
      return NextResponse.json({ success: false, message: "Eksik bilgi" }, { status: 400 });
    }

    await db.nfcProfile.update({
      where: { id: profileId },
      data: {
        themeColor,
        // designConfig içine json formatında ekleyebiliriz
        designConfig: JSON.stringify({ themeMode })
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Save Appearance Error:", error);
    return NextResponse.json({ success: false, message: "Sunucu hatası" }, { status: 500 });
  }
}
