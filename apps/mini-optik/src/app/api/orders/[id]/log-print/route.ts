import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: orderId } = await params;
    const body = await req.json();
    let { paperSize } = body;
    if (!paperSize) paperSize = "A4";

    const order = await prisma.opticOrder.findUnique({
      where: { id: orderId },
      include: { customer: true }
    });

    if (!order) return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });

    let orderNo = order.printSerialNo;

    // Eğer siparişe henüz bir çıktı numarası atanmamışsa
    if (!orderNo) {
      // Transaction kullanarak atomik olarak artırıyoruz
      const updatedSettings = await prisma.settings.update({
        where: { id: "global" },
        data: {
          lastPrintSequence: { increment: 1 }
        }
      });

      // Ön ekli sıralı numara (Örn: A000001, A000002)
      orderNo = `A${updatedSettings.lastPrintSequence.toString().padStart(6, '0')}`;

      // Siparişe kaydediyoruz
      await prisma.opticOrder.update({
        where: { id: orderId },
        data: { printSerialNo: orderNo }
      });
    }

    await prisma.activityLog.create({
      data: {
        action: `${order.customer.firstName} ${order.customer.lastName} müşterisinin sipariş formu yazdırıldı (Seri No: ${orderNo}, Boyut: ${paperSize})`,
        userId: session.userId,
        details: { type: "PRINTOUT", orderId, serialNo: orderNo, paperSize }
      }
    });

    return NextResponse.json({ success: true, orderNo });
  } catch (error: any) {
    console.error("Print log error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
