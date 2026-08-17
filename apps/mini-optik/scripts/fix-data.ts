import { prisma } from "../src/lib/prisma";

async function fix() {
  const orders = await prisma.opticOrder.findMany({ include: { installments: true } });
  
  for (const order of orders) {
    if (order.installments.length > 0) {
      const paidInstallments = order.installments.filter(i => i.isPaid).reduce((s, i) => s + i.amount, 0);
      const unpaidInstallments = order.installments.filter(i => !i.isPaid).reduce((s, i) => s + i.amount, 0);
      const totalInstallments = paidInstallments + unpaidInstallments;
      
      // Calculate initial deposit assuming all installments cover the exact remaining balance
      const initialDeposit = (order.totalPrice || 0) - totalInstallments;
      const correctDeposit = initialDeposit + paidInstallments;
      const correctBalance = (order.totalPrice || 0) - correctDeposit;
      
      // We only fix if the balance is out of sync with unpaid installments
      if (Math.abs((order.balance || 0) - unpaidInstallments) > 1) {
        console.log(`Order ${order.id}: balance ${order.balance} != unpaid ${unpaidInstallments}. Updating...`);
        console.log(`New deposit: ${correctDeposit}, New balance: ${correctBalance}`);
        await prisma.opticOrder.update({
          where: { id: order.id },
          data: { deposit: correctDeposit, balance: correctBalance }
        });
      }
    }
  }
  console.log("Done");
}

fix().catch(console.error);
