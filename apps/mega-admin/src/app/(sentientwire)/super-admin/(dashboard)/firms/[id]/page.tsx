import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import FirmDetailsClient from "./FirmDetailsClient";

export const dynamic = "force-dynamic";

export default async function FirmDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: firmId } = await params;
  
  const firm = await prisma.firm.findUnique({
    where: { id: firmId },
    include: {
      users: true,
      _count: {
        select: { customers: true, tickets: true, transactions: true }
      }
    }
  });

  if (!firm) {
    notFound();
  }

  // Related data
  // TODO: Implement FinanceTransaction relation
  const transactions: any[] = []; 
  /* await prisma.financeTransaction.findMany({
    where: { firmId },
    orderBy: { date: 'desc' }
  }); */

  const settings = await prisma.settings.findUnique({
    where: { firmId }
  });

  const allModules: any[] = [
    { id: "finance", name: "Finans & Muhasebe", description: "Ön muhasebe, gelir-gider takibi ve e-fatura entegrasyonu." },
    { id: "hr", name: "Personel (HR)", description: "Personel takibi, prim hesaplamaları ve mesai yönetimi." },
    { id: "logs", name: "Sistem Logları", description: "Kullanıcı ixlemlerinin ve sistem hatalarının detaylı log kayıtları." },
    { id: "trash", name: "Çöp Kutusu", description: "Silinmix verilerin saklandığı ve geri yüklenebildiği modül." },
  ];

  // Analytics verileri
  const totalEmployees = firm.users.length;
  const totalDataEntries = firm._count.customers + firm._count.transactions + firm._count.tickets;
  const totalUsageHours = firm.users.reduce((acc: any, user: any) => acc + (user.totalActiveHours || 0), 0);
  const activeTickets = firm._count.tickets;

  // Remove firmModules override to avoid breaking the frontend mapping if any

  return (
    <FirmDetailsClient 
      firm={firm}
      totalEmployees={totalEmployees}
      totalDataEntries={totalDataEntries}
      totalUsageHours={totalUsageHours}
      activeTickets={activeTickets}
      transactions={transactions}
      settings={settings}
      allModules={allModules}
    />
  );
}
