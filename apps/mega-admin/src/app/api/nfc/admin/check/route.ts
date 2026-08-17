import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Force rebuild 2
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const scannedId = url.searchParams.get("scannedId");

    if (!scannedId) {
      return NextResponse.json({ error: "No scanned ID provided" }, { status: 400 });
    }

    const card = await db.nfcCard.findUnique({
      where: { serialCode: scannedId },
      include: {
        user: {
          include: { nfcProfile: true }
        }
      }
    });

    if (!card) {
      return NextResponse.json({ 
        id: scannedId, 
        type: "BİLİNMİYOR", 
        status: "Kayıtsız (Sistemde Bulunamadı)", 
        isActive: false 
      });
    }

    const isStock = !card.user;
    
    return NextResponse.json({
      id: card.serialCode,
      type: isStock ? "STOK (Kurumsal)" : "MÜŞTERİ (B2C)",
      status: isStock ? "BOŞTA (Kullanılmıyor)" : `DOLU (${card.user?.nfcProfile?.name || card.user?.email})`,
      isActive: card.isActive,
      pass: card.activationCode
    });

  } catch (error) {
    console.error("Card Check Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
