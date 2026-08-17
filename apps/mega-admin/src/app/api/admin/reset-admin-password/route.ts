import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function GET() {
  try {
    const superAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (!superAdmin) {
      return NextResponse.json({ error: "Super admin not found" });
    }

    const newPassword = "AdminPassword2026!";
    const hashedPassword = await hash(newPassword, 10);

    await prisma.user.update({
      where: { id: superAdmin.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ 
      success: true, 
      email: superAdmin.email, 
      newPassword: newPassword 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
