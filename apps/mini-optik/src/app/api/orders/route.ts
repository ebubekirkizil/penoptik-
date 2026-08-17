import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/activity-logger";
import { getStatusConfig } from "@/lib/statusConfig";
import { getSession } from "@/lib/auth";
import { getDefaultWarehouse } from "@/lib/services/warehouse";

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
    const session = await getSession();
    const firmId = session?.firmId;

    const body = await req.json();
    const { customerId, prescriptionId, status, products, productCode, totalPrice, totalCost, deposit, balance, deliveryDate, variantId } = body;
    let finalCustomerId = customerId;

    const statuses = await getStatusConfig();
    const defaultStatus = statuses.length > 0 ? statuses[0].id : "PENDING";

    if (customerId === "NEW" && body.customerData) {
      const { firstName, lastName, phone, tcNo } = body.customerData;
      if (!firstName || !lastName || !phone) {
        return NextResponse.json({ error: "Yeni müşteri için ad, soyad ve telefon zorunludur." }, { status: 400 });
      }
      
      const existing = await prisma.customer.findFirst({ where: { phone } });
      if (existing) {
        return NextResponse.json({ error: "Bu telefon numarası zaten kayıtlı. Lütfen listeden seçin." }, { status: 409 });
      }

      // Varsayılan şifre telefon numarası olsun
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
      return NextResponse.json({ error: "Müşteri ID zorunludur." }, { status: 400 });
    }

    const parsedBalance = balance ? parseFloat(balance) : null;
    const installmentCount = parseInt(body.installmentCount) || 1;
    const installmentFrequency = body.installmentFrequency || "MONTHLY"; // "MONTHLY", "WEEKLY", "BIWEEKLY"
    
    const installmentMode = body.installmentMode || "AUTO";
    const manualInstallments = body.manualInstallments || [];

    // Taksitleri oluştur
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
        status: status || defaultStatus,
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
    
    // Stok düşümü işlemleri (Eğer variantId geldiyse ve oturum/firma belliyse)
    if (variantId && firmId) {
      try {
        const defaultWarehouse = await getDefaultWarehouse();
        if (defaultWarehouse) {
          await prisma.$transaction([
            prisma.stockLedger.create({
              data: {
                FirmId: firmId,
                variantId: variantId,
                warehouseId: defaultWarehouse.id,
                movementType: "SALE",
                quantity: -1, // Varsayılan olarak 1 adet düşüyoruz
                unitCost: totalCost ? parseFloat(totalCost) : null,
                reference: `order_${order.id}`,
                notes: `Optik Sipariş - Sipariş No: ${order.id}`,
                performedBy: session?.userId || "Sistem"
              }
            }),
            prisma.warehouseStock.updateMany({
              where: {
                FirmId: firmId,
                warehouseId: defaultWarehouse.id,
                variantId: variantId
              },
              data: {
                quantity: { decrement: 1 }
              }
            })
          ]);
        }
      } catch (stockError) {
        console.error("Stok düşüm hatası (Optik Sipariş):", stockError);
      }
    }

    await logAction(`Yeni sipariş oluşturuldu: ${order.customer?.firstName} ${order.customer?.lastName} - Ürün: ${products || '-'}`, {
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
