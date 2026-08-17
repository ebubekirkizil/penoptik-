import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/activity-logger";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    // Status
    if (body.status !== undefined) updateData.status = body.status;

    // Products / item code
    if (body.products !== undefined) updateData.products = body.products || null;
    if (body.productCode !== undefined) updateData.productCode = body.productCode || null;

    // Financial
    if (body.totalPrice !== undefined)
      updateData.totalPrice = body.totalPrice !== null ? parseFloat(body.totalPrice) : null;
    if (body.totalCost !== undefined)
      updateData.totalCost = body.totalCost !== null ? parseFloat(body.totalCost) : null;
    if (body.deposit !== undefined)
      updateData.deposit = body.deposit !== null ? parseFloat(body.deposit) : null;
    if (body.balance !== undefined)
      updateData.balance = body.balance !== null ? parseFloat(body.balance) : null;

    // Delivery date
    if (body.deliveryDate !== undefined)
      updateData.deliveryDate = body.deliveryDate ? new Date(body.deliveryDate) : null;

    const existingOrder = await prisma.opticOrder.findUnique({
      where: { id },
      include: { customer: true }
    });

    const order = await prisma.opticOrder.update({ where: { id }, data: updateData });

    if (existingOrder) {
      if (body.status !== undefined && body.status !== existingOrder.status) {
        await logAction(`Sipariş Durumu Değişti: ${existingOrder.customer.firstName} ${existingOrder.customer.lastName}`, {
          old: { status: existingOrder.status },
          new: { status: body.status }
        });

        // Trigger Automations
        try {
          const trigger = `ORDER_${body.status}`; // e.g. ORDER_READY
          const rules = await prisma.automationRule.findMany({
            where: { firmId: existingOrder.customer.firmId, trigger, isActive: true },
            include: { template: true }
          });

          if (rules.length > 0 && existingOrder.customer.phone) {
            const logs = rules.map((rule: any) => {
              const messageContent = rule.template.content
                .replace(/{MusteriAdi}/g, `${existingOrder.customer.firstName} ${existingOrder.customer.lastName}`)
                .replace(/{Telefon}/g, existingOrder.customer.phone);
              return {
                firmId: existingOrder.customer.firmId!,
                customerId: existingOrder.customer.id,
                to: existingOrder.customer.phone,
                type: rule.template.type,
                content: messageContent,
                status: "SENT" // Simulated sending
              };
            });
            if (logs.length > 0) {
              await prisma.messageLog.createMany({ data: logs });
            }
          }
        } catch (autoErr) {
          console.error("Automation error:", autoErr);
        }
      } else {
        await logAction(`Sipariş Güncellendi: ${existingOrder.customer.firstName} ${existingOrder.customer.lastName}`, {
          old: {
            products: existingOrder.products,
            totalPrice: existingOrder.totalPrice,
            deposit: existingOrder.deposit,
            balance: existingOrder.balance,
          },
          new: updateData
        });
      }
    }
    revalidatePath("/admin", "layout");
    return NextResponse.json(order);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const existingOrder = await prisma.opticOrder.findUnique({
      where: { id },
      include: { customer: true }
    });
    await prisma.opticOrder.update({ 
      where: { id },
      data: { deletedAt: new Date() }
    });
    
    if (existingOrder) {
      await logAction(`Sipariş Silindi: ${existingOrder.customer.firstName} ${existingOrder.customer.lastName}`, {
        orderId: existingOrder.id,
        products: existingOrder.products
      });
    }
    revalidatePath("/admin", "layout");
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
