import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profileId, isPinActive, pinCode } = body;
    
    if (!profileId) {
      return NextResponse.json({ success: false, message: "Eksik bilgi" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ success: false, message: "Yetkisiz erixim" }, { status: 401 });
    }

    // Kullanıcının kendi profilini güncellediğinden emin olalım
    const existingProfile = await db.nfcProfile.findUnique({
      where: { id: profileId }
    });

    if (!existingProfile || existingProfile.userId !== session.id) {
      return NextResponse.json({ success: false, message: "Yetkisiz erixim" }, { status: 403 });
    }

    const updated = await db.nfcProfile.update({
      where: { id: profileId },
      data: {
        isPinActive: isPinActive,
        pinCode: isPinActive ? pinCode : null, // Pin kapalıysa pinCode'u temizle veya tut
      }
    });

    return NextResponse.json({ success: true, profile: updated }, { status: 200 });
  } catch (error) {
    console.error("PIN Update Error:", error);
    return NextResponse.json({ success: false, message: "Sunucu hatası" }, { status: 500 });
  }
}
