import { PrismaClient, CargoStatus, PurchaseStatus, TxType, TxStatus, TxSource } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const firm = await prisma.firm.findFirst();
  if (!firm) {
    console.log("No firm found.");
    return;
  }

  // Find a wholesaler, or just get the first one
  const wholesaler = await prisma.wholesaler.findFirst({
    where: { FirmId: firm.id }
  });

  if (!wholesaler) {
    console.log("No wholesaler found. Run createWholesaler script first.");
    return;
  }

  // Get a product for the purchase
  const product = await prisma.product.findFirst({
    where: { FirmId: firm.id }
  });

  if (!product) {
    console.log("No product found to create dummy purchases.");
    return;
  }

  // Get first variant if exists
  const variant = await prisma.productVariant.findFirst({
    where: { productId: product.id }
  });

  console.log(`Seeding data for wholesaler: ${wholesaler.name}`);

  // Create Dummy Purchases
  const purchase1 = await prisma.wholesalerPurchase.create({
    data: {
      FirmId: firm.id,
      wholesalerId: wholesaler.id,
      totalAmount: 15000,
      notes: "Sezon başı optik çerçeve alımı",
      status: PurchaseStatus.DELIVERED,
      cargoStatus: CargoStatus.DELIVERED,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      items: {
        create: [
          {
            productId: product.id,
            variantId: variant?.id,
            quantity: 50,
            unitPrice: 300
          }
        ]
      }
    }
  });

  const purchase2 = await prisma.wholesalerPurchase.create({
    data: {
      FirmId: firm.id,
      wholesalerId: wholesaler.id,
      totalAmount: 4500,
      notes: "Acil lens tedariki",
      status: PurchaseStatus.PENDING,
      cargoStatus: CargoStatus.AT_CARGO,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      items: {
        create: [
          {
            productId: product.id,
            variantId: variant?.id,
            quantity: 15,
            unitPrice: 300
          }
        ]
      }
    }
  });

  // Create Dummy Payments
  const payment1 = await prisma.wholesalerPayment.create({
    data: {
      FirmId: firm.id,
      wholesalerId: wholesaler.id,
      amount: 10000,
      method: TxSource.TRANSFER,
      notes: "İlk taksit ödemesi",
      paymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
    }
  });

  const payment2 = await prisma.wholesalerPayment.create({
    data: {
      FirmId: firm.id,
      wholesalerId: wholesaler.id,
      amount: 2500,
      method: TxSource.CARD,
      notes: "Kalan bakiye ara ödemesi",
      paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    }
  });

  // Calculate new balance: Payments - Purchases
  // Purchase total: 19500
  // Payment total: 12500
  // Balance should be -7000 (Debt)
  await prisma.wholesaler.update({
    where: { id: wholesaler.id },
    data: { balance: 12500 - 19500 }
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
