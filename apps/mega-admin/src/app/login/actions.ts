"use server";

import { createSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function superAdminLoginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  // Kullanıcının özel olarak istediği Mega Admin girix bilgileri
  if (username === "0551" && password === "1453") {
    // Sadece xifre kontrolü ile SUPER_ADMIN rolü veriliyor. İleride DB'den de kontrol edilebilir.
    await createSession({
      userId: "super-admin-root",
      role: "SUPER_ADMIN",
    });
    
    redirect("/super-admin");
  } else {
    throw new Error("Geçersiz yetkili xifresi veya kullanıcı adı.");
  }
}
