const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.nfcCard.deleteMany({});
  console.log("Deleted all cards");
}

main().catch(console.error).finally(() => prisma.$disconnect());
