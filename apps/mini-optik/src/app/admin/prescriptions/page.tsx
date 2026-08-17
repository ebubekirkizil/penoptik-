// @ts-nocheck
import { prisma } from "@/lib/prisma";


import Link from "next/link";
import { Glasses, ChevronRight, Plus } from "lucide-react";
import PrescriptionsHeader from "@/components/prescriptions/PrescriptionsHeader";

export default async function PrescriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const whereClause: any = { 
    deletedAt: null,
    customer: { deletedAt: null }
  };
  
  if (q) {
    whereClause.customer = {
      ...whereClause.customer,
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ],
    };
  }

  const prescriptions = await prisma.prescription.findMany({
    where: whereClause,
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <PrescriptionsHeader />

      {prescriptions.length === 0 ? (
        <div className="bg-white dark:bg-surface shadow-sm rounded-2xl p-16 text-center  flex flex-col items-center">
          <Glasses className="w-12 h-12 text-amber-600 dark:text-secondary mb-4" />
          <p className="text-foreground font-semibold text-lg mb-2">Henüz göz bilgisi yok</p>
          <p className="text-muted-foreground text-sm mb-6">Müşteri detayından yeni göz bilgisi (reçete) ekleyebilirsiniz.</p>
          <Link href="/admin/customers" className="btn-primary px-6 py-3 rounded-xl font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Müşterilere Git
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((rx) => (
            <Link
              key={rx.id}
              href={`/admin/customers/${rx.customerId}`}
              className="bg-white dark:bg-surface shadow-sm rounded-2xl p-5 flex items-center gap-4 card-hover  hover:border-primary/40 group block"
            >
              <div className="w-11 h-11 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-secondary">
                <Glasses className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-semibold text-sm group-hover:text-amber-600 dark:text-secondary transition-colors">
                  {rx.customer ? `${rx.customer.firstName} ${rx.customer.lastName}` : "Bilinmeyen Müşteri"}
                </p>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                  {rx.farRightSph && <span>SAĞ SPH: {rx.farRightSph}</span>}
                  {rx.farLeftSph && <span>SOL SPH: {rx.farLeftSph}</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-muted-foreground text-xs">{new Date(rx.createdAt).toLocaleDateString("tr-TR")}</p>
                {rx.lensType && <p className="text-muted-foreground text-[10px] mt-0.5 max-w-[120px] truncate">{rx.lensType}</p>}
              </div>
              <div className="text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors"><ChevronRight className="w-5 h-5" /></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
