"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createPackageAction(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  
  // Modüller (Checkbox'lardan gelen array)
  // formData.getAll() aynı name'e sahip tüm checkbox değerlerini döndürür
  const selectedModules = formData.getAll("modules") as string[];

  // Özellikleri JSON formatında string'e çeviriyoruz
  const featuresJson = JSON.stringify(selectedModules);

  await prisma.subscriptionPackage.create({
    data: {
      name,
      description,
      price,
      currency: "TRY",
      features: featuresJson,
      isActive: true,
    }
  });

  redirect("/super-admin/packages");
}
