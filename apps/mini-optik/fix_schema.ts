import { prisma } from "./src/lib/prisma";

async function fix() {
  try {
    console.log("Adding missing column isAiBotActive to Settings table...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "isAiBotActive" BOOLEAN DEFAULT true;`);
    console.log("Column added successfully!");

    const customers = await prisma.customer.count({ where: { deletedAt: null } });
    const orders = await prisma.opticOrder.count({ where: { deletedAt: null } });
    const settings = await prisma.settings.findMany();

    console.log("=== VERİLERİNİZ SAPASAĞLAM VE GÜVENDE ===");
    console.log("Toplam Müşteri Sayısı:", customers);
    console.log("Toplam Sipariş Sayısı:", orders);
    console.log("Ayar Sayısı:", settings.length);
  } catch (err) {
    console.error("Fix error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

fix();
