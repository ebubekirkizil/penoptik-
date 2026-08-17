import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const firm = await prisma.firm.findFirst();
    if (firm) {
      await prisma.firm.update({
        where: { id: firm.id },
        data: {
          name: "Pen Optik",
          address: "https://maps.app.goo.gl/y6bH3s6rZ7XmCqUo6",
          phone: "0216 390 04 44"
        }
      });
      return NextResponse.json({ success: true, message: "Firm updated to Pen Optik defaults" });
    }
    return NextResponse.json({ success: false, message: "No firm found" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
