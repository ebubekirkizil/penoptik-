import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await req.json();

    const verification = await prisma.customerVerification.findUnique({
      where: { id },
    });

    if (!verification) {
      return NextResponse.json({ error: "İstek bulunamadı." }, { status: 404 });
    }

    if (action === "approve") {
      // Update the customer
      await prisma.customer.update({
        where: { id: verification.customerId },
        data: verification.newData as any,
      });

      // Update verification status
      await prisma.customerVerification.update({
        where: { id },
        data: { status: "APPROVED" },
      });

      return NextResponse.json({ success: true, message: "Onaylandı" });
    } else if (action === "reject") {
      await prisma.customerVerification.update({
        where: { id },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({ success: true, message: "Reddedildi" });
    } else {
      return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
