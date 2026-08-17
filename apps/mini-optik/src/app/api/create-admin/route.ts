import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const firm = await prisma.firm.findFirst({
      where: { domain: { contains: "penoptik" } }
    });

    if (!firm) {
      return NextResponse.json({ error: "Pen Optik firması bulunamadı." });
    }

    const existingAdmin = await prisma.user.findFirst({
      where: { firmId: firm.id, role: "FIRM_ADMIN" }
    });

    if (existingAdmin) {
      return NextResponse.json({ success: true, message: "Admin zaten var", user: existingAdmin });
    }

    const hashedPassword = await bcrypt.hash("penoptik123", 10);

    const newAdmin = await prisma.user.create({
      data: {
        email: "admin@penoptik.store",
        password: hashedPassword,
        firstName: "Pen",
        lastName: "Optik",
        role: "FIRM_ADMIN",
        firmId: firm.id
      }
    });

    return NextResponse.json({ success: true, message: "Admin oluşturuldu", user: newAdmin });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
