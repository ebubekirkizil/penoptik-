import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/mock-prisma";
import { logAction } from "@/lib/activity-logger";

export async function GET() {
  const orders = await prisma.opticOrder.findMany({
    where: { deletedAt: null },
    include: { customer: true, prescription: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, prescriptionId, status, products, productCode, totalPrice, deposit, balance, deliveryDate } = body;
    let finalCustomerId = customerId;

    if (customerId === "NEW" && body.customerData) {
      const { firstName, lastName, phone, tcNo } = body.customerData;
      if (!firstName || !lastName || !phone) {
        return NextResponse.json({ error: "Yeni müxteri için ad, soyad ve telefon zorunludur." }, { status: 400 });
      }
      
      const existing = await prisma.customer.findUnique({ where: { phone } });
      if (existing) {
        return NextResponse.json({ error: "Bu telefon numarası zaten kayıtlı. Lütfen listeden seçin." }, { status: 409 });
      }

      // Varsayılan xifre telefon numarası olsun
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(phone, 10);

      const newCustomer = await prisma.customer.create({
        data: {
          firstName,
          lastName,
          phone,
          tcNo: tcNo || null,
          password: hashedPassword,
        }
      });
      finalCustomerId = newCustomer.id;
    } else if (!finalCustomerId) {
      return NextResponse.json({ error: "Müxteri ID zorunludur." }, { status: 400 });
    }

    const parsedBalance = balance ? parseFloat(balance) : null;
    const installmentCount = parseInt(body.installmentCount) || 1;
    const installmentFrequency = body.installmentFrequency || "MONTHLY"; // "MONTHLY", "WEEKLY", "BIWEEKLY"
    
    const installmentMode = body.installmentMode || "AUTO";
    const manualInstallments = body.manualInstallments || [];

    // Taksitleri oluxtur
    const installmentsData: any[] = [];
    if (installmentMode === "MANUAL" && manualInstallments.length > 0) {
      manualInstallments.forEach((inst: any) => {
        installmentsData.push({
          amount: parseFloat(inst.amount),
          dueDate: new Date(inst.dueDate),
          isPaid: false
        });
      });
    } else if (installmentCount > 1 && parsedBalance && parsedBalance > 0) {
      const installmentAmount = parsedBalance / installmentCount;
      for (let i = 1; i <= installmentCount; i++) {
        const dueDate = new Date();
        if (installmentFrequency === "WEEKLY") {
          dueDate.setDate(dueDate.getDate() + (i * 7));
        } else if (installmentFrequency === "BIWEEKLY") {
          dueDate.setDate(dueDate.getDate() + (i * 15));
        } else {
          // MONTHLY
          dueDate.setMonth(dueDate.getMonth() + i);
        }
        
        installmentsData.push({
          amount: parseFloat(installmentAmount.toFixed(2)),
          dueDate: dueDate,
          isPaid: false
        });
      }
    }

    const order = await prisma.opticOrder.create({
      data: {
        customerId: finalCustomerId,
        prescriptionId: prescriptionId || null,
        status: status || "PENDING",
        products: products || null,
        productCode: productCode || null,
        totalPrice: totalPrice ? parseFloat(totalPrice) : null,
        deposit: deposit ? parseFloat(deposit) : null,
        balance: parsedBalance,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        installments: installmentsData.length > 0 ? {
          create: installmentsData
        } : undefined
      },
      include: { customer: true, prescription: true },
    });
    
    // --- STOK VE FİNANS ENTEGRASYONU ---
    if (productCode && totalPrice) {
      const product = await prisma.product.findUnique({ where: { barcode: productCode } });
      let costPrice = 0;
      if (product) {
        costPrice = product.costPrice || 0;
        await prisma.product.update({
          where: { id: product.id },
          data: { stockQuantity: Math.max(0, (product.stockQuantity || 0) - 1) }
        });
      }
      
      const salesPrice = parseFloat(totalPrice);
      const tax = salesPrice * 0.20; // %20 KDV varsayımı
      const netProfit = salesPrice - costPrice - tax;

      await prisma.financeRecord.create({
        data: {
          type: "INCOME",
          amount: salesPrice,
          cost: costPrice,
          tax: tax,
          netProfit: netProfit,
          description: `Satıx: ${products || productCode} (Siparix: ${order.id})`,
          date: new Date()
        }
      });
    }
    // ------------------------------------

    await logAction(`Yeni siparix oluxturuldu: ${order.customer?.firstName} ${order.customer?.lastName} - Ürün: ${products || '-'}`, {
      orderId: order.id,
      products: products,
      totalPrice: totalPrice,
      deposit: deposit,
      balance: parsedBalance,
      installments: installmentsData.length > 0 ? `${installmentsData.length} Taksit` : null,
      customer: `${order.customer?.firstName} ${order.customer?.lastName}`
    });
    
    revalidatePath("/admin", "layout");

    return NextResponse.json(order, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
