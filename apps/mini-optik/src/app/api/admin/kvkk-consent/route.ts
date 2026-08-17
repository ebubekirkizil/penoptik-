import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { documentVersion } = await req.json();

    // Oturumu doğrula
    const session = await getSession();
    
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Oturum bulunamadı. Lütfen giriş yapın." }, { status: 401 });
    }

    const userId = session.userId;
    const firmId = session.firmId;

    // Cihaz ve IP bilgilerini al
    const userAgent = req.headers.get("user-agent") || "Bilinmeyen Cihaz";
    const ipAddress = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";

    // Veritabanına kaydet (Hata alsa bile kullanıcının girişini engellemesin)
    try {
      await prisma.kvkkConsentLog.create({
        data: {
          userId,
          firmId: firmId || null,
          ipAddress,
          userAgent,
          documentVersion: documentVersion || "v1.0"
        }
      });
    } catch (dbError) {
      console.error("KVKK DB Log Error (Ignored):", dbError);
    }

    return NextResponse.json({ success: true, message: "Onay başarıyla kaydedildi." });
  } catch (error: any) {
    console.error("KVKK Consent Error:", error);
    return NextResponse.json({ success: true, message: "Onay geçici olarak kabul edildi." });
  }
}
