import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Hard delete items older than 1 week automatically
    await prisma.customer.deleteMany({ where: { deletedAt: { lt: oneWeekAgo } } });
    await prisma.opticOrder.deleteMany({ where: { deletedAt: { lt: oneWeekAgo } } });
    await prisma.prescription.deleteMany({ where: { deletedAt: { lt: oneWeekAgo } } });

    // Fetch soft-deleted items
    const customers = await prisma.customer.findMany({ where: { deletedAt: { not: null } } });
    const orders = await prisma.opticOrder.findMany({ where: { deletedAt: { not: null } } });
    const prescriptions = await prisma.prescription.findMany({ where: { deletedAt: { not: null } } });

    return NextResponse.json({
      customers: customers.map(c => ({ ...c, type: 'CUSTOMER' })),
      orders: orders.map(o => ({ ...o, type: 'ORDER' })),
      prescriptions: prescriptions.map(p => ({ ...p, type: 'PRESCRIPTION' }))
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, id, type } = await req.json();

    if (!id || !type || !action) {
      return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
    }

    if (action === "RESTORE") {
      if (type === "CUSTOMER") await prisma.customer.update({ where: { id }, data: { deletedAt: null } });
      else if (type === "ORDER") await prisma.opticOrder.update({ where: { id }, data: { deletedAt: null } });
      else if (type === "PRESCRIPTION") await prisma.prescription.update({ where: { id }, data: { deletedAt: null } });
    } else if (action === "HARD_DELETE") {
      if (type === "CUSTOMER") await prisma.customer.delete({ where: { id } });
      else if (type === "ORDER") await prisma.opticOrder.delete({ where: { id } });
      else if (type === "PRESCRIPTION") await prisma.prescription.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: "Gecersiz islem" }, { status: 400 });
    }

    revalidatePath("/admin", "layout");
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
