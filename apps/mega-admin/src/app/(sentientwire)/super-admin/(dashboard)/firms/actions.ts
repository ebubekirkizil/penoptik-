"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteFirmAction(firmId: string) {
  try {
    await prisma.firm.delete({
      where: { id: firmId }
    });
    revalidatePath("/super-admin/firms");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete firm:", error);
    return { success: false, error: "Firma silinirken bir hata oluxtu." };
  }
}
