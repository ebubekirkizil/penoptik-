import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profileId, modules } = body;
    
    if (!profileId || !Array.isArray(modules)) {
      return NextResponse.json({ success: false, message: "Eksik bilgi" }, { status: 400 });
    }

    // Gerçekte burada session üzerinden yetki kontrolü yapılır.

    // 1. Profilin mevcut tüm modüllerini sil (Senkronizasyon için en temizi)
    await db.nfcModule.deleteMany({
      where: { profileId }
    });

    // 2. Yeni modülleri sırasıyla ekle
    const newModules = modules.map((mod: any, index: number) => ({
      profileId,
      type: mod.type,
      title: mod.title,
      url: mod.url,
      order: index,
      isActive: true
    }));

    if (newModules.length > 0) {
      await db.nfcModule.createMany({
        data: newModules
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Save Modules Error:", error);
    return NextResponse.json({ success: false, message: "Sunucu hatası" }, { status: 500 });
  }
}
