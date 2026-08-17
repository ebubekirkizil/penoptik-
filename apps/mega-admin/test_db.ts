import { prisma } from '@impecta/database';
async function test() {
  try {
    const logs = await prisma.aiUsageLog.findMany({ take: 1 });
    console.log("DB SUCCESS:", logs);
  } catch (e) {
    console.error("DB ERROR:", e);
  }
}
test();
