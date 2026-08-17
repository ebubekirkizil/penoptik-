import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.firmId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const suppliers = await prisma.supplier.findMany({
      where: { FirmId: session.firmId },
      orderBy: { createdAt: "desc" },
    });

    // Map Prisma models to frontend format
    const mapped = suppliers.map((s: any) => ({
      id: s.id,
      name: s.name,
      contact: s.contactName || "",
      phone: s.phone || "",
      category: s.categories || [],
      balance: s.balance || 0,
      email: s.email || "",
      taxNumber: s.taxNumber || "",
      address: s.address || "",
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.firmId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, contact, phone, category, balance, email, taxNumber, address } = body;

    const supplier = await prisma.supplier.create({
      data: {
        FirmId: session.firmId,
        name,
        contactName: contact,
        phone,
        categories: category || [],
        balance: balance || 0,
        email,
        taxNumber,
        address,
      },
    });

    return NextResponse.json({
      id: supplier.id,
      name: supplier.name,
      contact: supplier.contactName || "",
      phone: supplier.phone || "",
      category: supplier.categories || [],
      balance: supplier.balance || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.firmId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, name, contact, phone, category, balance, email, taxNumber, address } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const supplier = await prisma.supplier.update({
      where: { id, FirmId: session.firmId },
      data: {
        name,
        contactName: contact,
        phone,
        categories: category || [],
        balance: balance || 0,
        email,
        taxNumber,
        address,
      },
    });

    return NextResponse.json({
      id: supplier.id,
      name: supplier.name,
      contact: supplier.contactName || "",
      phone: supplier.phone || "",
      category: supplier.categories || [],
      balance: supplier.balance || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.firmId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.supplier.delete({
      where: { id, FirmId: session.firmId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
