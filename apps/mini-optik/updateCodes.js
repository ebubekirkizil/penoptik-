const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const users = await prisma.user.findMany({
      where: { userCode: { not: null } }
    });
    for (const user of users) {
      if (!/^\d{4}$/.test(user.userCode)) {
        let code = "";
        let isUnique = false;
        while (!isUnique) {
          code = Math.floor(1000 + Math.random() * 9000).toString();
          const existing = await prisma.user.findUnique({ where: { userCode: code } });
          if (!existing) isUnique = true;
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { userCode: code }
        });
        console.log(`Updated user ${user.id} to code ${code}`);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
