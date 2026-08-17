import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptData, decryptData } from "@/lib/encryption";
import { getAuthUser } from "@/lib/auth"; // Assume there's some getAuthUser/getSession logic

export async function POST(req: NextRequest) {
  try {
    const { kurumKodu, sifre, tesisKodu, firmId } = await req.json();

    if (!firmId) {
      return NextResponse.json({ error: "Firm ID eksik" }, { status: 400 });
    }

    // Encrypt the password if provided
    let encryptedSifre = null;
    if (sifre) {
      encryptedSifre = encryptData(sifre);
    }

    // Upsert the firm integration record
    const integration = await prisma.firmIntegration.upsert({
      where: { firmId },
      update: {
        sgkKurumKodu: kurumKodu || undefined,
        sgkTesisKodu: tesisKodu || undefined,
        ...(encryptedSifre && { sgkSifre: encryptedSifre }),
      },
      create: {
        firmId,
        sgkKurumKodu: kurumKodu,
        sgkSifre: encryptedSifre,
        sgkTesisKodu: tesisKodu,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SGK settings save error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Ideally we get firmId from the session/query
    const { searchParams } = new URL(req.url);
    const firmId = searchParams.get('firmId');
    
    if (!firmId) return NextResponse.json({ error: "Firm ID eksik" }, { status: 400 });

    const integration = await prisma.firmIntegration.findUnique({
      where: { firmId }
    });

    if (!integration) {
      return NextResponse.json({});
    }

    // We never return the decrypted password. We just return whether it exists or not.
    return NextResponse.json({
      kurumKodu: integration.sgkKurumKodu || "",
      tesisKodu: integration.sgkTesisKodu || "",
      hasSifre: !!integration.sgkSifre,
    });
  } catch (error) {
    console.error("SGK settings fetch error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
