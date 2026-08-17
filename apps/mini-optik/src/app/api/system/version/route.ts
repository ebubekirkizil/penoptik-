import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [customer, order, prescription, settings, installment, log] = await Promise.all([
      prisma.customer.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      prisma.order.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      prisma.prescription.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      prisma.settings.findUnique({ where: { id: "global" }, select: { updatedAt: true } }),
      prisma.installment.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      prisma.activityLog.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } })
    ]);

    const timestamps = [
      customer?.updatedAt?.getTime() || 0,
      order?.updatedAt?.getTime() || 0,
      prescription?.updatedAt?.getTime() || 0,
      settings?.updatedAt?.getTime() || 0,
      installment?.updatedAt?.getTime() || 0,
      log?.createdAt?.getTime() || 0
    ];

    const maxTimestamp = Math.max(...timestamps);

    return NextResponse.json({ version: maxTimestamp });
  } catch (error) {
    console.error("Failed to fetch system version:", error);
    return NextResponse.json({ version: 0 }, { status: 500 });
  }
}
