const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateUserCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function run() {
  const users = await prisma.user.findMany({ where: { userCode: null } });
  console.log(`Found ${users.length} users without userCode.`);
  
  for (const user of users) {
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateUserCode();
      const existing = await prisma.user.findUnique({ where: { userCode: code } });
      if (!existing) isUnique = true;
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: { userCode: code }
    });
    console.log(`Assigned code ${code} to user ${user.email}`);
  }
  
  console.log('Done.');
  process.exit(0);
}

run().catch(console.error);
