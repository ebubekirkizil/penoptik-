import { prisma } from '../src/lib/prisma';

async function main() {
  const firm = await prisma.firm.findFirst();
  
  if (!firm) {
    console.log("No firm found in the database. Cannot add wholesaler.");
    return;
  }

  const dummyWholesaler = await prisma.wholesaler.create({
    data: {
      id: crypto.randomUUID(),
      FirmId: firm.id,
      name: "Örnek Optik Tedarik A.Ş.",
      contact: "Ahmet Yılmaz",
      phone: "0555 123 45 67",
      address: "Optikçiler Sitesi No: 42, Göztepe, İstanbul",
      balance: 0,
      updatedAt: new Date(),
    }
  });

  console.log(`Dummy Wholesaler added successfully: ${dummyWholesaler.name}`);
}

main()
  .then(async () => {
    // await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    // await prisma.$disconnect();
    process.exit(1);
  });
