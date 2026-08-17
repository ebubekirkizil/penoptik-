const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listFirms() {
  const firms = await prisma.firm.findMany({
    select: { id: true, name: true }
  });
  console.log(JSON.stringify(firms, null, 2));
}

listFirms().catch(console.error).finally(() => prisma.$disconnect());
