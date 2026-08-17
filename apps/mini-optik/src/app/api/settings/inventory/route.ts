import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: "global" }
    });

    let themeDataObj: any = {};
    if (settings?.themeData) {
      try { themeDataObj = JSON.parse(settings.themeData); } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      inventorySettings: themeDataObj?.inventory || {}
    });
  } catch (error: any) {
    console.error("GET Inventory Settings Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let settings = await prisma.settings.findUnique({
      where: { id: "global" }
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: "global" }
      });
    }

    let themeDataObj: any = {};
    if (settings.themeData) {
      try { themeDataObj = JSON.parse(settings.themeData); } catch (e) {}
    }
    
    // Update inventory part
    themeDataObj.inventory = body.inventorySettings;

    const updated = await prisma.settings.update({
      where: { id: "global" },
      data: {
        themeData: JSON.stringify(themeDataObj)
      }
    });

    const firstAdmin = await prisma.user.findFirst({ where: { role: "FIRM_ADMIN" } });
    if (firstAdmin) {
      await prisma.activityLog.create({
        data: {
          action: "Etiket Sistemi Ayarları Güncellendi",
          details: {
            width: body.inventorySettings?.labelWidth || 60,
            height: body.inventorySettings?.labelHeight || 30,
            margin: body.inventorySettings?.margin || 2,
            type: "Barkod"
          },
          userId: firstAdmin.id,
        }
      });
    }

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error("POST Inventory Settings Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
