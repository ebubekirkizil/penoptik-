import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Attempt to get user id from mock headers or cookies if possible, else default
    // We'll just hardcode a generic system id or find the first admin
    const firstAdmin = await prisma.user.findFirst({ where: { role: "FIRM_ADMIN" } });
    if (!firstAdmin) {
      return NextResponse.json({ error: "No admin found" }, { status: 400 });
    }

    const log = await prisma.activityLog.create({
      data: {
        action: data.action,
        details: data.details,
        userId: firstAdmin.id,
      }
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error("Activity Log POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
