// @ts-nocheck
import { prisma } from "./src/lib/prisma";


async function deleteFakeFirms() {
  const result = await prisma.firm.deleteMany({
    where: {
      name: {
        not: "Pen Optik"
      }
    }
  });
  console.log(`Deleted ${result.count} fake firms.`);
}

deleteFakeFirms()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
