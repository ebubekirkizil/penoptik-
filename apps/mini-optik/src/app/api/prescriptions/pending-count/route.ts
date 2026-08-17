import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const count = await prisma.prescription.count({
      where: {
        isPending: true,
        deletedAt: null,
      },
    });

    return NextResponse.json({ count });
  } catch (error: any) {
    console.error("Error fetching pending count:", error);
    return NextResponse.json({ error: "Failed to fetch pending count" }, { status: 500 });
  }
}
