import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const SEED_TEMPLATES = [
  {
    name: "Sipariş Alındı - SMS",
    type: "SMS" as const,
    content: "Sayın {MusteriAdi}, siparişiniz alınmıştır. Hazır olduğunda sizi bilgilendireceğiz. Teşekkürler.",
    subject: null,
  },
  {
    name: "Sipariş Hazır - SMS",
    type: "SMS" as const,
    content: "Sayın {MusteriAdi}, siparişiniz hazır! Mağazamızdan teslim alabilirsiniz. Bilgi: {Telefon}",
    subject: null,
  },
  {
    name: "Sipariş Hazır - WhatsApp",
    type: "WHATSAPP" as const,
    content: "Merhaba {MusteriAdi} 👋 Siparişiniz hazır ve teslim için bekliyor. Görüşmek üzere! 🎉",
    subject: null,
  },
  {
    name: "Randevu Hatırlatma - Email",
    type: "EMAIL" as const,
    subject: "Randevu Hatırlatması - Penoptik",
    content: "Sayın {MusteriAdi},\n\nYarınki randevunuzu hatırlatmak istedik. Sizi görmekten memnuniyet duyacağız.\n\nSaygılarımızla,\nPenoptik Ekibi",
  },
  {
    name: "Doğum Günü Kutlaması - SMS",
    type: "SMS" as const,
    content: "Sayın {MusteriAdi}, doğum gününüzü kutlar, sağlıklı ve mutlu yıllar dileriz! 🎂 - Penoptik",
    subject: null,
  },
];

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.firmId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.messageTemplate.count({ where: { firmId: session.firmId } });
    if (existing > 0) {
      return NextResponse.json({ error: "Zaten şablonlarınız mevcut. Örnek şablonlar sadece boş hesaplara eklenir." }, { status: 409 });
    }

    const created = await prisma.messageTemplate.createMany({
      data: SEED_TEMPLATES.map((t) => ({
        firmId: session.firmId as string,
        name: t.name,
        type: t.type,
        subject: t.subject,
        content: t.content,
        isActive: true,
      })),
    });

    return NextResponse.json({ success: true, count: created.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
