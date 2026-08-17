import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/activity-logger";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      where: { deletedAt: null },
      
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(customers);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import bcrypt from "bcryptjs";
import { createBlindIndex } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, address, diseases, notes, password, tcNo, allowExisting } = body;
    let { firstName, lastName, phone } = body;

    // Optional fields logic
    if (!firstName || firstName.trim() === "") firstName = "İsimsiz";
    if (!lastName || lastName.trim() === "") lastName = "Müşteri";
    if (!phone || phone.trim() === "") {
      // Generate a dummy phone that is highly likely to be unique
      phone = `0000${Math.floor(100000 + Math.random() * 900000)}`;
    }
    
    // Check if phone already exists using the encrypted Blind Index
    const phoneHash = createBlindIndex(phone);
    const existing = phoneHash ? await prisma.customer.findUnique({ where: { phoneHash } }) : null;
    
    if (existing) {
      if (allowExisting) {
        return NextResponse.json(existing, { status: 200 });
      }
      return NextResponse.json({ error: "Bu telefon numarası zaten kayıtlı." }, { status: 409 });
    }

    let hashedPassword = null;
    let generatedPin = null;
    let isTemp = false;
    let expires = null;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      // Rastgele 6 haneli şifre oluştur
      generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
      hashedPassword = await bcrypt.hash(generatedPin, 10);
      isTemp = true;
      const d = new Date();
      d.setDate(d.getDate() + 7);
      expires = d;
    }

    const customer = await prisma.customer.create({
      data: { 
        firstName, 
        lastName, 
        phone, 
        tcNo: tcNo || null,
        email: email || null, 
        password: hashedPassword,
        address: address || null,
        diseases: diseases || null,
        notes: notes || null,
        isPasswordTemporary: isTemp,
        tempPasswordExpires: expires
      },
    });

    await logAction(`Yeni müşteri eklendi: ${firstName} ${lastName}`);
    revalidatePath("/admin", "layout");
    revalidateTag("customers");
    return NextResponse.json({ ...customer, generatedPassword: generatedPin }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
