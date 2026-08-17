import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/mock-prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    const {
      farRightSph, farRightCyl, farRightAx, farLeftSph, farLeftCyl, farLeftAx,
      nearRightSph, nearRightCyl, nearRightAx, nearLeftSph, nearLeftCyl, nearLeftAx,
      constantRightSph, constantRightCyl, constantRightAx, constantLeftSph, constantLeftCyl, constantLeftAx,
      addRight, addLeft, pdRight, pdLeft, pdTotal, phRight, phLeft, lensType, coating, doctorName, hospitalName, notes, isPending
    } = body;

    const dataToUpdate: any = {};
    if (farRightSph !== undefined) dataToUpdate.farRightSph = farRightSph;
    if (farRightCyl !== undefined) dataToUpdate.farRightCyl = farRightCyl;
    if (farRightAx !== undefined) dataToUpdate.farRightAx = farRightAx;
    if (farLeftSph !== undefined) dataToUpdate.farLeftSph = farLeftSph;
    if (farLeftCyl !== undefined) dataToUpdate.farLeftCyl = farLeftCyl;
    if (farLeftAx !== undefined) dataToUpdate.farLeftAx = farLeftAx;
    if (nearRightSph !== undefined) dataToUpdate.nearRightSph = nearRightSph;
    if (nearRightCyl !== undefined) dataToUpdate.nearRightCyl = nearRightCyl;
    if (nearRightAx !== undefined) dataToUpdate.nearRightAx = nearRightAx;
    if (nearLeftSph !== undefined) dataToUpdate.nearLeftSph = nearLeftSph;
    if (nearLeftCyl !== undefined) dataToUpdate.nearLeftCyl = nearLeftCyl;
    if (nearLeftAx !== undefined) dataToUpdate.nearLeftAx = nearLeftAx;
    if (constantRightSph !== undefined) dataToUpdate.constantRightSph = constantRightSph;
    if (constantRightCyl !== undefined) dataToUpdate.constantRightCyl = constantRightCyl;
    if (constantRightAx !== undefined) dataToUpdate.constantRightAx = constantRightAx;
    if (constantLeftSph !== undefined) dataToUpdate.constantLeftSph = constantLeftSph;
    if (constantLeftCyl !== undefined) dataToUpdate.constantLeftCyl = constantLeftCyl;
    if (constantLeftAx !== undefined) dataToUpdate.constantLeftAx = constantLeftAx;
    if (addRight !== undefined) dataToUpdate.addRight = addRight;
    if (addLeft !== undefined) dataToUpdate.addLeft = addLeft;
    if (pdRight !== undefined) dataToUpdate.pdRight = pdRight;
    if (pdLeft !== undefined) dataToUpdate.pdLeft = pdLeft;
    if (pdTotal !== undefined) dataToUpdate.pdTotal = pdTotal;
    if (phRight !== undefined) dataToUpdate.phRight = phRight;
    if (phLeft !== undefined) dataToUpdate.phLeft = phLeft;
    if (lensType !== undefined) dataToUpdate.lensType = lensType;
    if (coating !== undefined) dataToUpdate.coating = coating;
    if (doctorName !== undefined) dataToUpdate.doctorName = doctorName;
    if (hospitalName !== undefined) dataToUpdate.hospitalName = hospitalName;
    if (notes !== undefined) dataToUpdate.notes = notes;
    if (isPending !== undefined) dataToUpdate.isPending = isPending;

    const updatedPrescription = await prisma.prescription.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/admin", "layout");
    return NextResponse.json(updatedPrescription);
  } catch (error: any) {
    console.error("Error updating prescription:", error);
    return NextResponse.json({ error: error.message || "Failed to update prescription" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    await prisma.prescription.delete({
      where: { id }
    });

    revalidatePath("/admin", "layout");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting prescription:", error);
    return NextResponse.json({ error: error.message || "Failed to delete prescription" }, { status: 500 });
  }
}
