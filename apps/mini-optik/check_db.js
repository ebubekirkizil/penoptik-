const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const customers = await prisma.customer.count();
    const orders = await prisma.opticOrder.count();
    const settings = await prisma.settings.findMany();
    const deletedCustomers = await prisma.customer.count({ where: { NOT: { deletedAt: null } } });
    const deletedOrders = await prisma.opticOrder.count({ where: { NOT: { deletedAt: null } } });

    console.log("=== DB STATS ===");
    console.log("Total Customers:", customers);
    console.log("Total Orders:", orders);
    console.log("Deleted Customers:", deletedCustomers);
    console.log("Deleted Orders:", deletedOrders);
    console.log("Settings count:", settings.length);
    console.log("Settings details:", JSON.stringify(settings, null, 2));
  } catch (err) {
    console.error("DB Query error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
