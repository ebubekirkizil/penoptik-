"use server";

import { prisma } from "@/lib/prisma";
import { createSession, getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

// Check SUPER_ADMIN Auth
async function requireSuperAdmin() {
  const currentSession = await getSession();
  if (!currentSession || currentSession.role !== "SUPER_ADMIN") {
    throw new Error("Bu ixlem için yetkiniz yok.");
  }
}

export async function impersonateFirm(firmId: string) {
  await requireSuperAdmin();

  // Firmanın bilgilerini al (Domain için)
  const firm = await prisma.firm.findUnique({
    where: { id: firmId },
  });

  if (!firm) {
    throw new Error("Firma bulunamadı.");
  }

  // Token oluxturmak için secret
  const secretStr = process.env.IMPERSONATE_SECRET;
  
  if (!secretStr) {
    throw new Error("Sistem hatası: IMPERSONATE_SECRET bulunamadı. Lütfen .env dosyanızı kontrol edip sunucuyu (Next.js) yeniden baxlatın.");
  }

  // Jeton (Token) Oluxtur
  const secret = new TextEncoder().encode(secretStr);
  const token = await new SignJWT({ 
    role: "MEGA_ADMIN",
    firmId: firm.id 
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m") // 5 dakika geçerli
    .sign(secret);

  // Yönlendirme (Gerçek müxteri domainine)
  // Eğer domain tanımlanmıxsa (örn: penoptik.shop), o adrese yönlendir.
  // Aksi halde yerel gelixtirme için 3001 portuna (veya ayarlanan diğer porta) yönlendir.
  let targetUrl = "http://localhost:3001"; 
  if (firm.domain) {
    // Domain'in baxında http/https yoksa https ekle
    targetUrl = firm.domain.startsWith("http") ? firm.domain : `https://${firm.domain}`;
  }
  
  return { url: `${targetUrl}/api/auth/impersonate?token=${token}` };
}

export async function updateFirmModules(firmId: string, moduleIds: string[]) {
  await requireSuperAdmin();
  
  // TODO: Implement FirmModule in Prisma
  /*
  // Önce mevcut ilixkileri temizle
  await prisma.firmModule.deleteMany({
    where: { firmId }
  });

  // Yeni modülleri ekle
  if (moduleIds.length > 0) {
    await prisma.firmModule.createMany({
      data: moduleIds.map(moduleId => ({
        firmId,
        moduleId,
        status: "ACTIVE"
      }))
    });
  }
  */

  // Geriye dönük uyumluluk için eski alanı da güncelle
  await prisma.firm.update({
    where: { id: firmId },
    data: { activeModules: JSON.stringify(moduleIds) },
  });

  revalidatePath(`/super-admin/firms/${firmId}`);
  return { success: true };
}

export async function updateFirmTheme(firmId: string, themeData: any) {
  await requireSuperAdmin();
  
  // Upsert settings for the specific firm
  await prisma.settings.upsert({
    where: { firmId },
    update: { themeData: JSON.stringify(themeData) },
    create: { 
      firmId, 
      themeData: JSON.stringify(themeData),
      subscriptionPlan: "Temel Paket",
      subscriptionStatus: "Aktif",
      supportLevel: "Standart"
    }
  });

  // Temporarily also update the global settings because Penoptik currently reads from 'global'
  try {
    await prisma.settings.update({
      where: { id: "global" },
      data: { themeData: JSON.stringify(themeData) }
    });
  } catch (e) {
    console.error("Global settings update failed:", e);
  }

  revalidatePath(`/super-admin/firms/${firmId}`);
  return { success: true };
}

export async function updateFirmAdminCredentials(firmId: string, newEmail: string, newPassword?: string) {
  await requireSuperAdmin();
  
  const firmAdmin = await prisma.user.findFirst({
    where: { firmId: firmId, role: "FIRM_ADMIN" },
    orderBy: { createdAt: 'asc' }
  });

  if (!firmAdmin) {
    throw new Error("Firmanın yönetici kullanıcısı bulunamadı.");
  }

  const dataToUpdate: any = { email: newEmail };

  if (newPassword && newPassword.trim() !== "") {
    dataToUpdate.password = await bcrypt.hash(newPassword, 10);
  }

  await prisma.user.update({
    where: { id: firmAdmin.id },
    data: dataToUpdate,
  });

  return { success: true };
}

export async function extendSubscription(firmId: string, days: number, amount: number, paymentMethod: string) {
  await requireSuperAdmin();

  const firm = await prisma.firm.findUnique({ where: { id: firmId } });
  if (!firm) throw new Error("Firma bulunamadı.");

  const currentEnd = firm.subscriptionEnd && firm.subscriptionEnd > new Date() 
    ? firm.subscriptionEnd 
    : new Date();
    
  const newEnd = new Date(currentEnd);
  newEnd.setDate(newEnd.getDate() + days);

  // TODO: Implement FinanceTransaction relation correctly
  await prisma.$transaction([
    prisma.firm.update({
      where: { id: firmId },
      data: { subscriptionEnd: newEnd },
    }),
    /*
    prisma.financeTransaction.create({
      data: {
        firmId,
        type: "INCOME",
        amount: amount,
        category: "SUBSCRIPTION_PAYMENT",
        description: `${days} günlük abonelik uzatma (${paymentMethod})`,
      }
    })
    */
  ]);

  revalidatePath(`/super-admin/firms/${firmId}`);
  return { success: true };
}
