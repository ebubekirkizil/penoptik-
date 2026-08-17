import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

function generateUserCode() {
  const chars = '0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, firstName: true, lastName: true, email: true, username: true, role: true, userCode: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    if (!user.userCode) {
      let code = "";
      let isUnique = false;
      while (!isUnique) {
        code = generateUserCode();
        const existing = await prisma.user.findUnique({ where: { userCode: code } });
        if (!existing) isUnique = true;
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { userCode: code }
      });
      user.userCode = code;
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
    const { firstName, lastName, email, username, password } = body;

    const dataToUpdate: any = {
      firstName,
      lastName,
    };

    if (email && email.trim() !== "") {
      dataToUpdate.email = email.trim();
    }

    if (username !== undefined) {
      dataToUpdate.username = username.trim() === "" ? null : username.trim();
    }
    
    if (password && password.trim() !== "") {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: dataToUpdate,
      select: { id: true, firstName: true, lastName: true, email: true, username: true, role: true, userCode: true },
    });

    return NextResponse.json(updatedUser);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
