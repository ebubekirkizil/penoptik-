const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.customer.count();
  console.log("Customers:", c);
}
main().catch(console.error).finally(() => prisma.$disconnect());
