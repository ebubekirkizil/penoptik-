import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/mock-prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerId, farRightSph, farRightCyl, farRightAx, farLeftSph, farLeftCyl, farLeftAx,
      nearRightSph, nearRightCyl, nearRightAx, nearLeftSph, nearLeftCyl, nearLeftAx,
      constantRightSph, constantRightCyl, constantRightAx, constantLeftSph, constantLeftCyl, constantLeftAx,
      addRight, addLeft, pdRight, pdLeft, pdTotal, phRight, phLeft, lensType, coating, doctorName, hospitalName, notes, isPending
    } = body;
    if (!customerId) return NextResponse.json({ error: "customerId zorunlu" }, { status: 400 });

    const prescription = await prisma.prescription.create({
      data: {
        customerId, farRightSph, farRightCyl, farRightAx, farLeftSph, farLeftCyl, farLeftAx,
        nearRightSph, nearRightCyl, nearRightAx, nearLeftSph, nearLeftCyl, nearLeftAx,
        constantRightSph, constantRightCyl, constantRightAx, constantLeftSph, constantLeftCyl, constantLeftAx,
        addRight, addLeft, pdRight, pdLeft, pdTotal, phRight, phLeft, lensType, coating, doctorName, hospitalName, notes,
        isPending: isPending === true || isPending === 'true',
      },
    });
    revalidatePath("/admin", "layout");
    return NextResponse.json(prescription, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  const prescriptions = await prisma.prescription.findMany({
    where: {  },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(prescriptions);
}
