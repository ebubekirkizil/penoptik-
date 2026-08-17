"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addSystemTransaction(formData: FormData) {
  try {
    const type = formData.get("type") as string;
    const amountStr = formData.get("amount") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const dateStr = formData.get("date") as string;

    if (!type || !amountStr || !category) {
      return;
    }

    const amount = parseFloat(amountStr);
    const date = dateStr ? new Date(dateStr) : new Date();

    // TODO: Implement SystemFinanceTransaction model
    // await prisma.systemFinanceTransaction.create({ ... })

    revalidatePath("/super-admin/finance");
  } catch (error) {
    console.error("Finance add error:", error);
  }
}

export async function deleteSystemTransaction(id: string) {
  try {
    // TODO: Implement SystemFinanceTransaction model
    // await prisma.systemFinanceTransaction.delete({ where: { id } });
    
    revalidatePath("/super-admin/finance");
  } catch (error) {
    console.error("Finance delete error:", error);
  }
}
