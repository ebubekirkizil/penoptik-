import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, password } = body;

    const dataToUpdate: any = {
      firstName,
      lastName,
    };

    if (password && password.trim() !== "") {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: dataToUpdate,
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    return NextResponse.json(updatedUser);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
