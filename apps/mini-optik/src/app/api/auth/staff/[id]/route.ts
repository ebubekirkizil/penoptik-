import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: targetUserId } = await params;

    // Check if the target user is a STAFF of the same firm
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser || targetUser.firmId !== user.firmId || targetUser.role !== "STAFF") {
      return NextResponse.json({ error: "Personel bulunamadı veya silinemez." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: targetUserId } = await params;

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser || targetUser.firmId !== user.firmId || targetUser.role !== "STAFF") {
      return NextResponse.json({ error: "Personel bulunamadı veya güncellenemez." }, { status: 400 });
    }

    const body = await req.json();
    const { firstName, lastName, email, username } = body;

    if (email && email !== targetUser.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return NextResponse.json({ error: "Bu e-posta adresi zaten kullanılıyor." }, { status: 400 });
      }
    }

    if (username && username !== targetUser.username) {
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUsername) {
        return NextResponse.json({ error: "Bu kullanıcı adı zaten kullanılıyor." }, { status: 400 });
      }
    }

    const updatedStaff = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        firstName: firstName !== undefined ? firstName : targetUser.firstName,
        lastName: lastName !== undefined ? lastName : targetUser.lastName,
        email: email !== undefined ? email : targetUser.email,
        username: username !== undefined ? username : targetUser.username,
      },
      select: { id: true, firstName: true, lastName: true, email: true, username: true, userCode: true, createdAt: true },
    });

    return NextResponse.json(updatedStaff);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
