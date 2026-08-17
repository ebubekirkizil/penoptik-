import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "global" } });
    return NextResponse.json({ sequence: settings?.lastPrintSequence || 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newSeq = body.sequence;

    if (typeof newSeq === "number") {
      await prisma.settings.upsert({
        where: { id: "global" },
        update: { lastPrintSequence: newSeq },
        create: {
          id: "global",
          lastPrintSequence: newSeq,
        }
      });
      return NextResponse.json({ sequence: newSeq });
    }
    
    return NextResponse.json({ error: "Invalid sequence" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
