import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.firmId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const templates = await prisma.messageTemplate.findMany({
      where: { firmId: session.firmId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.firmId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, type, subject, content, isActive } = body;

    const template = await prisma.messageTemplate.create({
      data: {
        firmId: session.firmId,
        name,
        type,
        subject: type === "EMAIL" ? subject : null,
        content,
        isActive: isActive !== undefined ? isActive : true,
      }
    });

    return NextResponse.json(template);
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

    await prisma.messageTemplate.delete({
      where: { id, firmId: session.firmId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.firmId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, name, type, subject, content } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updated = await prisma.messageTemplate.update({
      where: { id, firmId: session.firmId },
      data: {
        name,
        type,
        subject: type === "EMAIL" ? subject : null,
        content,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
