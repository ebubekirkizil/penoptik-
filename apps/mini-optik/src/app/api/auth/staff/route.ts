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
      select: { firmId: true, role: true },
    });

    if (!user || user.role !== "FIRM_ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const staff = await prisma.user.findMany({
      where: { firmId: user.firmId, role: "STAFF", deletedAt: null },
      select: { id: true, firstName: true, lastName: true, email: true, username: true, userCode: true, createdAt: true },
    });

    return NextResponse.json(staff);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { firmId: true, role: true },
    });

    if (!user || user.role !== "FIRM_ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    // Check staff count
    const staffCount = await prisma.user.count({
      where: { firmId: user.firmId, role: "STAFF", deletedAt: null },
    });

    if (staffCount >= 5) {
      return NextResponse.json({ error: "En fazla 5 personel ekleyebilirsiniz." }, { status: 400 });
    }

    const body = await req.json();
    const { firstName, lastName, email, username, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "E-posta ve şifre zorunludur." }, { status: 400 });
    }

    // Check uniqueness
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kullanılıyor." }, { status: 400 });
    }

    if (username) {
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUsername) {
        return NextResponse.json({ error: "Bu kullanıcı adı zaten kullanılıyor." }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let code = "";
    let isUnique = false;
    while (!isUnique) {
      code = generateUserCode();
      const existing = await prisma.user.findUnique({ where: { userCode: code } });
      if (!existing) isUnique = true;
    }

    const newStaff = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        userCode: code,
        username: username || null,
        password: hashedPassword,
        role: "STAFF",
        firmId: user.firmId,
      },
      select: { id: true, firstName: true, lastName: true, email: true, username: true, userCode: true, createdAt: true },
    });

    return NextResponse.json(newStaff);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
