process.env.DATABASE_URL = "postgresql://postgres.nlpjrjdxwtinvnjqlqgt:2849Ebu%2A59%2B-ws@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
process.env.DIRECT_URL = "postgresql://postgres.nlpjrjdxwtinvnjqlqgt:2849Ebu%2A59%2B-ws@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";

import { prisma } from "./src/lib/prisma";

async function check() {
  try {
    const customers = await prisma.customer.count();
    const orders = await prisma.opticOrder.count();
    const settings = await prisma.settings.findMany();

    console.log("=== DB STATS ===");
    console.log("Total Customers:", customers);
    console.log("Total Orders:", orders);
    console.log("Settings count:", settings.length);

    const sampleCustomers = await prisma.customer.findMany({ take: 5 });
    console.log("Sample Customers:", sampleCustomers.map(c => ({ id: c.id, name: `${c.firstName} ${c.lastName}`, phone: c.phone })));
  } catch (err) {
    console.error("DB Query error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
