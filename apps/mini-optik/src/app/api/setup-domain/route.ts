import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const firm = await prisma.firm.findFirst({
      where: { name: { contains: "Pen Optik" } }
    });

    if (firm) {
      await prisma.firm.update({
        where: { id: firm.id },
        data: { domain: "penoptik.store" }
      });
      return NextResponse.json({ success: true, message: "Pen Optik domain updated to penoptik.store" });
    } else {
      const newFirm = await prisma.firm.create({
        data: {
          name: "Pen Optik",
          email: "info@penoptik.store",
          phone: "05555555555",
          address: "Türkiye",
          sector: "OPTICS",
          domain: "penoptik.store",
          isActive: true,
          subscriptionPlan: "ENTERPRISE",
          subscriptionStatus: "ACTIVE",
          activeModules: JSON.stringify(["OPTICS_PRESCRIPTIONS"]),
          settings: {
            create: {
              customerCanViewMeasurements: true
            }
          }
        }
      });
      return NextResponse.json({ success: true, message: "Pen Optik firm CREATED successfully with domain penoptik.store" });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
