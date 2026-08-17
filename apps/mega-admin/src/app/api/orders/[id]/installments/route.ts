import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/mock-prisma";
import { logAction } from "@/lib/activity-logger";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    const installments = await prisma.installment.findMany({
      where: { orderId },
      orderBy: { dueDate: "asc" },
    });
    return NextResponse.json(installments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "İxlem baxarısız" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    const { amount, dueDate, autoCount, balance, autoFrequency, isPaid } = await req.json();

    const order = await prisma.opticOrder.findUnique({
      where: { id: orderId },
      include: { customer: true }
    });
    const customerName = order?.customer ? `${order.customer.firstName} ${order.customer.lastName}` : "Bilinmeyen Müxteri";

    if (autoCount && autoCount > 1 && balance) {
      const count = parseInt(autoCount);
      const parsedBalance = parseFloat(balance);
      const baseAmount = parseFloat((parsedBalance / count).toFixed(2));
      const remainder = parsedBalance - (baseAmount * count);
      const freq = autoFrequency || "MONTHLY";
      
      const installmentsData = [];
      for (let i = 1; i <= count; i++) {
        const dDate = new Date();
        if (freq === "WEEKLY") {
          dDate.setDate(dDate.getDate() + (i * 7));
        } else if (freq === "BIWEEKLY") {
          dDate.setDate(dDate.getDate() + (i * 15));
        } else {
          dDate.setMonth(dDate.getMonth() + i);
        }
        
        let finalAmount = baseAmount;
        if (i === 1) {
          finalAmount = parseFloat((baseAmount + remainder).toFixed(2));
        }
        
        installmentsData.push({
          orderId,
          amount: finalAmount,
          dueDate: dDate,
          isPaid: false
        });
      }

      await prisma.installment.createMany({
        data: installmentsData
      });

      await logAction(`Otomatik Taksit Planı Oluxturuldu: ${customerName}`, {
        orderId,
        count,
        totalBalance: parsedBalance,
        frequency: freq,
        installmentAmount: parseFloat(baseAmount.toFixed(2))
      });

      return NextResponse.json({ success: true, count });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !dueDate) {
      return NextResponse.json({ error: "Geçersiz veriler" }, { status: 400 });
    }

    const installment = await prisma.installment.create({
      data: {
        orderId,
        amount: parsedAmount,
        dueDate: new Date(dueDate),
        isPaid: isPaid === true, // Check for explicit true
      },
    });

    if (isPaid === true) {
      await prisma.opticOrder.update({
        where: { id: orderId },
        data: {
          balance: { decrement: parsedAmount },
          deposit: { increment: parsedAmount },
        }
      });
    }

    await logAction(`Manuel Taksit Eklendi: ${customerName}`, {
      orderId,
      installmentId: installment.id,
      amount: parsedAmount,
      dueDate: new Date(dueDate)
    });

    if (isPaid === true) {
      await logAction(`Taksit Ödendi: ${customerName}`, {
        orderId,
        installmentId: installment.id,
        amount: parsedAmount,
        dueDate: new Date(dueDate),
        paidAt: new Date(),
      });
    }

    return NextResponse.json(installment);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "İxlem baxarısız" }, { status: 500 });
  }
}
