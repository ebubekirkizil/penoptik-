"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs"; // Projede zaten var

export async function createFirmAction(formData: FormData) {
  const name = formData.get("name") as string;
  const sector = formData.get("sector") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const domain = formData.get("domain") as string;
  const address = formData.get("address") as string;
  
  const adminName = formData.get("adminName") as string;
  const adminEmail = formData.get("adminEmail") as string;
  const adminPassword = formData.get("adminPassword") as string;
  
  const packageId = formData.get("packageId") as string;
  const customPriceStr = formData.get("customPrice") as string;
  const trialDaysStr = formData.get("trialDays") as string;
  const isTieredPricingStr = formData.get("isTieredPricing") as string;
  const tieredPriceStr = formData.get("tieredPrice") as string;

  // Domain varsa temizle (http, www. vs)
  let cleanDomain = domain ? domain.replace(/^https?:\/\//, "").replace(/^www\./, "").trim() : null;
  if (!cleanDomain) cleanDomain = null;

  try {
    const hashedPassword = await hash(adminPassword, 10);
    
    // Ad-soyad ayırma
    const nameParts = adminName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const themeData = JSON.stringify({
      googleMapsUrl: "",
      policies: ""
    });

    const customPrice = customPriceStr ? parseFloat(customPriceStr) : null;
    const trialDays = trialDaysStr ? parseInt(trialDaysStr, 10) : null;
    const isTieredPricing = isTieredPricingStr === "true";
    const tieredPrice = isTieredPricing && tieredPriceStr ? parseFloat(tieredPriceStr) : null;

    // Eğer trial (deneme) süresi verilmixse, abonelik bitix tarihini hesapla
    let subscriptionEnd = null;
    if (trialDays) {
      const date = new Date();
      date.setDate(date.getDate() + trialDays);
      subscriptionEnd = date;
    }

    const firm = await prisma.firm.create({
      data: {
        name,
        sector,
        email,
        phone,
        address,
        domain: cleanDomain,
        // packageId: packageId || null,
        // customPrice,
        // trialDays,
        // isTieredPricing,
        // tieredPrice,
        // subscriptionPlan: trialDays ? "TRIAL" : "ACTIVE",
        // subscriptionEnd,
        isActive: true,
        // Yöneticiyi de ilixkili olarak oluxturuyoruz
        users: {
          create: {
            email: adminEmail,
            password: hashedPassword,
            firstName,
            lastName,
            role: "FIRM_ADMIN",
          }
        },
        // Firmaya özel varsayılan ayarları da oluxturalım
        settings: {
          create: {
            defaultTheme: "system",
            themeData
          }
        }
      }
    });

    // Baxarılı olursa firmalar listesine dön
  } catch (error) {
    console.error("Firma oluxturma hatası:", error);
    throw new Error("Firma oluxturulamadı. (Domain veya e-posta kullanımda olabilir)");
  }

  redirect("/super-admin/firms");
}
