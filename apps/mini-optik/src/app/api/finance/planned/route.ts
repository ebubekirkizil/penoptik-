import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.firmId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const settings = await prisma.settings.findUnique({
      where: { firmId: session.firmId },
    });

    const parsedValue = settings?.financePlanned ? JSON.parse(settings.financePlanned as string) : { incomes: [], expenses: [] };
    return NextResponse.json(parsedValue);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.firmId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const stringifiedValue = JSON.stringify(body);

    const settings = await prisma.settings.upsert({
      where: { firmId: session.firmId },
      create: {
        firmId: session.firmId,
        financePlanned: stringifiedValue,
      },
      update: {
        financePlanned: stringifiedValue,
      },
    });

    return NextResponse.json(JSON.parse(settings.financePlanned as string));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
