import { Suspense } from "react";
import FinanceClient from "./FinanceClient";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Finans Yönetimi - Penoptik",
};

import { unstable_cache } from "next/cache";

const getCachedFinanceData = unstable_cache(
  async () => {
    const [ordersWithBalance, unpaidInstallments, fixedTxs, pendingTxs] = await Promise.all([
      prisma.opticOrder.findMany({
        where: { balance: { gt: 0 }, deletedAt: null },
        include: { customer: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.installment.findMany({
        where: { isPaid: false },
        include: { order: { include: { customer: true } } },
        orderBy: { dueDate: 'asc' }
      }),
      prisma.fixedTransaction.findMany({ where: { isActive: true } }),
      prisma.financialTransaction.findMany({ where: { status: 'PENDING' } })
    ]);

    const realDebts: any[] = [];
    
    ordersWithBalance.forEach((order: any) => {
      realDebts.push({
        id: order.id,
        customer: order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : "Bilinmeyen Müşteri",
        customerId: order.customerId,
        desc: order.products || "Sipariş Kalan Bakiye",
        amount: order.balance,
        date: order.deliveryDate ? order.deliveryDate.toLocaleDateString('tr-TR') : order.createdAt.toLocaleDateString('tr-TR'),
        status: "Bekliyor",
        rawDate: order.deliveryDate || order.createdAt,
        type: "ORDER_BALANCE"
      });
    });

    unpaidInstallments.forEach((inst: any) => {
      const orderIndex = realDebts.findIndex(d => d.id === inst.orderId && d.type === "ORDER_BALANCE");
      if (orderIndex !== -1) realDebts.splice(orderIndex, 1);
    });

    unpaidInstallments.forEach((inst: any) => {
      const isOverdue = new Date(inst.dueDate).getTime() < Date.now();
      realDebts.push({
        id: inst.id,
        orderId: inst.orderId,
        customer: inst.order?.customer ? `${inst.order.customer.firstName} ${inst.order.customer.lastName}` : "Bilinmeyen Müşteri",
        customerId: inst.order?.customerId,
        desc: "Taksit Ödemesi",
        amount: inst.amount,
        date: inst.dueDate.toLocaleDateString('tr-TR'),
        status: isOverdue ? "Gecikti" : "Bekliyor",
        rawDate: inst.dueDate,
        type: "INSTALLMENT"
      });
    });

    realDebts.sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const plannedPaymentsData: any[] = [];

    fixedTxs.forEach((tx: any) => {
      let nextDate = new Date(today.getFullYear(), today.getMonth(), tx.dayOfMonth || 1);
      if (nextDate < today) nextDate.setMonth(nextDate.getMonth() + 1);
      const diffTime = nextDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      plannedPaymentsData.push({
        title: tx.category || tx.description || "Düzenli Ödeme",
        amount: tx.amount,
        daysLeft: diffDays,
        isUrgent: diffDays <= 3,
        type: tx.type === "EXPENSE" ? "Gider" : "Gelir",
        isFixed: true,
        rawDate: nextDate
      });
    });

    pendingTxs.forEach((tx: any) => {
      const txDate = tx.transactionDate ? new Date(tx.transactionDate) : new Date();
      const diffTime = txDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      plannedPaymentsData.push({
        title: tx.description || "Planlı İşlem",
        amount: tx.amount,
        daysLeft: diffDays,
        isUrgent: diffDays <= 3,
        type: tx.type === "EXPENSE" ? "Gider" : "Gelir",
        isFixed: false,
        rawDate: txDate
      });
    });

    plannedPaymentsData.sort((a, b) => a.daysLeft - b.daysLeft);

    return { realDebts, plannedPaymentsData };
  },
  ['finance-page-data'],
  { revalidate: 30, tags: ['finance'] }
);

export default async function FinancePage({ searchParams }: { searchParams: { tab?: string } }) {
  const { realDebts, plannedPaymentsData } = await getCachedFinanceData();

  return (
    <Suspense fallback={<div className="p-8">Yükleniyor...</div>}>
      <FinanceClient 
        initialRecords={[]} 
        initialDebts={realDebts}
        initialPlannedPayments={plannedPaymentsData}
        initialTab={searchParams?.tab || "OVERVIEW"} 
      />
    </Suspense>
  );
}
