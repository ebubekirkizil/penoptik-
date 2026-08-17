const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.customer.findMany().then(res => {
  console.log(res);
}).catch(console.error).finally(() => prisma.$disconnect());
