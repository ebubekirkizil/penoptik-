import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptData, decryptData } from "@/lib/encryption";

export async function POST(req: NextRequest) {
  try {
    const { kurumNo, token, firmId } = await req.json();

    if (!firmId) {
      return NextResponse.json({ error: "Firm ID eksik" }, { status: 400 });
    }

    // Encrypt the token if provided
    let encryptedToken = null;
    if (token) {
      encryptedToken = encryptData(token);
    }

    // Upsert the firm integration record
    const integration = await prisma.firmIntegration.upsert({
      where: { firmId },
      update: {
        utsKurumNo: kurumNo || undefined,
        ...(encryptedToken && { utsToken: encryptedToken }),
      },
      create: {
        firmId,
        utsKurumNo: kurumNo,
        utsToken: encryptedToken,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UTS settings save error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const firmId = searchParams.get('firmId');
    
    if (!firmId) return NextResponse.json({ error: "Firm ID eksik" }, { status: 400 });

    const integration = await prisma.firmIntegration.findUnique({
      where: { firmId }
    });

    if (!integration) {
      return NextResponse.json({});
    }

    return NextResponse.json({
      kurumNo: integration.utsKurumNo || "",
      hasToken: !!integration.utsToken,
    });
  } catch (error) {
    console.error("UTS settings fetch error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
