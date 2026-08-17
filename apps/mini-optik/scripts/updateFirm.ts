import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const firm = await prisma.firm.findFirst();
  if (firm) {
    await prisma.firm.update({
      where: { id: firm.id },
      data: {
        name: "Pen Optik",
        address: "https://maps.app.goo.gl/r6vQc1X2TjQfQ2mX8", // Example maps link or general search
        phone: "0216 390 04 44"
      }
    });
    console.log("Firm database record updated successfully.");
  } else {
    console.log("No firm found in the database.");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
