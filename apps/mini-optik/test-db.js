const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.firm.findFirst({ where: { name: { contains: 'Pen Optik', mode: 'insensitive' } } })
  .then(f => console.log(f))
  .finally(() => prisma.$disconnect());
