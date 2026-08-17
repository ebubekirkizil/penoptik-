const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.findUnique({
    where: { id: 'cmsf6edcs000004l424up06q9' }
  });
  console.log("Customer:", customer);
}

main().catch(console.error).finally(() => prisma.$disconnect());
