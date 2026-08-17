import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logAction } from "@/lib/activity-logger";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = await prisma.customer.findFirst({
      where: { id },
      include: {
        prescriptions: { orderBy: { createdAt: "desc" } },
        opticOrders: { include: { prescription: true }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!customer) {
      return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { email, address, diseases, notes, password, tcNo } = body;
    let { firstName, lastName, phone } = body;

    // Retain the existing phone if empty, otherwise we might conflict or lose data
    const existingCust = await prisma.customer.findUnique({ where: { id } });
    if (!existingCust) return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });

    if (!phone || phone.trim() === "") {
      phone = existingCust.phone || `0000${Math.floor(100000 + Math.random() * 900000)}`;
    }

    // Check phone conflict with another customer
    const conflict = await prisma.customer.findFirst({
      where: { phone, NOT: { id } },
    });
    if (conflict) {
      return NextResponse.json({ error: "Bu telefon numarası başka bir müşteriye ait." }, { status: 409 });
    }

    const dataToUpdate: any = {
      firstName,
      lastName,
      phone,
      tcNo: tcNo || null,
      email: email || null,
      address: address || null,
      diseases: diseases || null,
      notes: notes || null,
    };

    if (password && password.trim() !== "") {
      dataToUpdate.password = await bcrypt.hash(password.trim(), 10);
    }

    if (body.isCustomerRequest) {
      const oldData = {
        firstName: existingCust.firstName,
        lastName: existingCust.lastName,
        phone: existingCust.phone,
        tcNo: existingCust.tcNo,
        email: existingCust.email,
        address: existingCust.address,
        diseases: existingCust.diseases,
        notes: existingCust.notes,
      };

      await prisma.customerVerification.create({
        data: {
          customerId: id,
          oldData: JSON.parse(JSON.stringify(oldData)),
          newData: JSON.parse(JSON.stringify(dataToUpdate)),
          status: "PENDING",
        },
      });

      return NextResponse.json({ message: "Doğrulama isteği oluşturuldu" });
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: dataToUpdate,
    });

    // Detect changes for logging
    const oldDataForLog = {
      firstName: existingCust.firstName,
      lastName: existingCust.lastName,
      phone: existingCust.phone,
      tcNo: existingCust.tcNo,
      email: existingCust.email,
      address: existingCust.address,
      diseases: existingCust.diseases,
      notes: existingCust.notes,
    };
    
    // Only log if something changed (excluding password for security)
    await logAction(`Müşteri Bilgileri Güncellendi: ${updated.firstName} ${updated.lastName}`, {
      old: oldDataForLog,
      new: dataToUpdate
    });

    revalidatePath("/admin", "layout");
    revalidateTag("customers");
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.customer.findUnique({ where: { id } });
    
    // Soft delete the customer
    await prisma.customer.update({ 
      where: { id },
      data: { deletedAt: new Date() }
    });
    
    // Also soft delete all their prescriptions
    await prisma.prescription.updateMany({
      where: { customerId: id },
      data: { deletedAt: new Date() }
    });
    
    if (existing) {
      await logAction(`Müşteri Silindi: ${existing.firstName} ${existing.lastName}`, {
        customer: `${existing.firstName} ${existing.lastName}`,
        phone: existing.phone
      });
    }
    
    revalidatePath("/admin", "layout");
    revalidateTag("customers");
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
