import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptData } from "@/lib/encryption";

export async function POST(req: NextRequest) {
  try {
    const { tcKimlik, islemTarihi, firmId } = await req.json();

    if (!tcKimlik || !firmId) {
      return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
    }

    // Get Firm SGK Credentials
    const integration = await prisma.firmIntegration.findUnique({
      where: { firmId }
    });

    if (!integration || !integration.sgkSifre || !integration.sgkKurumKodu) {
      return NextResponse.json({ error: "SGK Entegrasyon ayarları yapılmamış" }, { status: 400 });
    }

    // Normally here we would decrypt the password and make a SOAP request to SGK Medula Optik
    const rawPassword = decryptData(integration.sgkSifre);
    
    // Simulate SGK SOAP Call
    await new Promise(resolve => setTimeout(resolve, 600));

    // Audit logging
    await prisma.auditLog.create({
      data: {
        firmId,
        userId: "system", // Should be actual user
        action: "UPDATE",
        details: `${tcKimlik} T.C. için SGK Müstehaklık Sorgusu yapıldı`,
        ipAddress: req.ip || "127.0.0.1",
      }
    });

    // Mock successful response
    return NextResponse.json({
      success: true,
      data: {
        hakSahibiAdSoyad: "M******* Y*****",
        uzakGozlukHakkiVarMi: true,
        yakinGozlukHakkiVarMi: true,
        uzakCamHakkiVarMi: true,
        yakinCamHakkiVarMi: true,
        sonAlimTarihi: "2024-01-15"
      }
    });

  } catch (error) {
    console.error("Müstehaklık sorgu hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
