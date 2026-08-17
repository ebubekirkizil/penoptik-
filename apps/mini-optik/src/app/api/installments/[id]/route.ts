import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/activity-logger";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { isPaid, paidAt, amount, dueDate } = body;

    const existing = await prisma.installment.findUnique({
      where: { id },
      include: { order: { include: { customer: true } } }
    });

    if (!existing) {
      return NextResponse.json({ error: "Taksit bulunamadı" }, { status: 404 });
    }

    const updateData: any = {};
    if (isPaid !== undefined) {
      updateData.isPaid = isPaid;
      updateData.paidAt = paidAt ? new Date(paidAt) : null;
    }
    if (amount !== undefined) {
      const parsed = parseFloat(amount);
      if (isNaN(parsed) || parsed < 0) {
         return NextResponse.json({ error: "Geçersiz miktar" }, { status: 400 });
      }
      updateData.amount = parsed;
    }
    if (dueDate !== undefined) {
      updateData.dueDate = new Date(dueDate);
    }

    const installment = await prisma.installment.update({
      where: { id },
      data: updateData,
    });

    if (existing && isPaid !== undefined && existing.isPaid !== isPaid) {
      // Update order balance
      const balanceChange = isPaid ? -existing.amount : existing.amount;
      const depositChange = isPaid ? existing.amount : -existing.amount;
      
      await prisma.opticOrder.update({
        where: { id: existing.orderId },
        data: {
          balance: { increment: balanceChange },
          deposit: { increment: depositChange }
        }
      });
      const customerName = existing.order.customer ? `${existing.order.customer.firstName} ${existing.order.customer.lastName}` : "Bilinmeyen Müşteri";
      await logAction(`Taksit ${isPaid ? 'Ödendi' : 'Ödemesi İptal Edildi'}: ${customerName}`, {
        orderId: existing.orderId,
        installmentId: id,
        amount: existing.amount,
        dueDate: existing.dueDate,
        paidAt: paidAt ? new Date(paidAt) : null,
      });
    }

    revalidatePath("/admin", "layout");
    return NextResponse.json(installment);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.installment.findUnique({
      where: { id },
      include: { order: { include: { customer: true } } }
    });

    await prisma.installment.delete({
      where: { id },
    });

    if (existing) {
      if (existing.isPaid) {
        await prisma.opticOrder.update({
          where: { id: existing.orderId },
          data: {
            balance: { increment: existing.amount },
            deposit: { decrement: existing.amount },
          }
        });
      }
      
      const customerName = existing.order.customer ? `${existing.order.customer.firstName} ${existing.order.customer.lastName}` : "Bilinmeyen Müşteri";
      await logAction(`Taksit Silindi: ${customerName}`, {
        orderId: existing.orderId,
        installmentId: id,
        amount: existing.amount,
        dueDate: existing.dueDate,
      });
    }
    revalidatePath("/admin", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}
