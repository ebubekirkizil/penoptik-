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

    const parsedValue = settings?.financeTax ? JSON.parse(settings.financeTax as string) : { records: [] };
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
        financeTax: stringifiedValue,
      },
      update: {
        financeTax: stringifiedValue,
      },
    });

    return NextResponse.json(JSON.parse(settings.financeTax as string));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
