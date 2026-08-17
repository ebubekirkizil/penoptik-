import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptData } from "@/lib/encryption";

export async function POST(req: NextRequest) {
  try {
    const { tcKimlik, eReceteNo, firmId } = await req.json();

    if (!tcKimlik || !eReceteNo || !firmId) {
      return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
    }

    // Get Firm SGK Credentials
    const integration = await prisma.firmIntegration.findUnique({
      where: { firmId }
    });

    if (!integration || !integration.sgkSifre || !integration.sgkKurumKodu) {
      return NextResponse.json({ error: "SGK Entegrasyon ayarları yapılmamış" }, { status: 400 });
    }

    // Normally we decrypt and send to Medula
    const rawPassword = decryptData(integration.sgkSifre);
    
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Audit logging
    await prisma.auditLog.create({
      data: {
        firmId,
        userId: "system", 
        action: "UPDATE",
        details: `${eReceteNo} numaralı E-Reçete SGK'dan sorgulandı`,
        ipAddress: req.ip || "127.0.0.1",
      }
    });

    // Save to DB so we can invoice later
    const medulaTakipNo = "M" + Math.floor(Math.random() * 100000000);
    
    await prisma.sgkPrescription.create({
      data: {
        firmId,
        tcKimlik,
        eReceteNo,
        medulaTakipNo,
        patientName: "M******* Y*****",
        prescriptionDate: new Date(),
        status: "APPROVED"
      }
    });

    // Mock successful response
    return NextResponse.json({
      success: true,
      data: {
        doktor: "Dr. Ahmet Yılmaz",
        teshis: "Miyopi",
        gozlukTipi: "Uzak",
        sagSferik: "-1.25",
        solSferik: "-1.50",
        medulaTakipNo
      }
    });

  } catch (error) {
    console.error("Reçete getirme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
