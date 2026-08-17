import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.firmId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: "Geçersiz istek formatı." }, { status: 400 });
    }

    // Since we are updating multiple products and we need to log it, we can use a transaction.
    // However, for simplicity and safe batching, we will loop and update.
    let updatedCount = 0;

    for (const update of updates) {
      if (!update.id || update.newPrice === undefined) continue;

      const product = await prisma.product.findUnique({
        where: { id: update.id }
      });

      if (!product || product.FirmId !== session.firmId) continue;

      await prisma.product.update({
        where: { id: update.id },
        data: { price: update.newPrice }
      });

      // Update variant prices if any
      await prisma.productVariant.updateMany({
        where: { productId: update.id },
        data: { price: update.newPrice }
      });

      updatedCount++;
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (error: any) {
    console.error("Bulk Update Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
