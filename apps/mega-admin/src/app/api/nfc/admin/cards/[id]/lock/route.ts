import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ success: false, message: "Eksik bilgi" }, { status: 400 });
    }

    const session = await getSession();
    // Yalnızca adminlerin yapabileceğini kontrol et
    if (!session || !session.id || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN" && session.role !== "FIRM_ADMIN")) {
      return NextResponse.json({ success: false, message: "Yetkisiz erixim" }, { status: 401 });
    }

    const card = await db.nfcCard.findUnique({
      where: { id }
    });

    if (!card) {
      return NextResponse.json({ success: false, message: "Kart bulunamadı" }, { status: 404 });
    }

    if (card.isLocked) {
      return NextResponse.json({ success: false, message: "Kart zaten kilitli" }, { status: 400 });
    }

    const updatedCard = await db.nfcCard.update({
      where: { id },
      data: { isLocked: true }
    });

    return NextResponse.json({ success: true, card: updatedCard }, { status: 200 });
  } catch (error) {
    console.error("Card Lock Error:", error);
    return NextResponse.json({ success: false, message: "Sunucu hatası" }, { status: 500 });
  }
}
