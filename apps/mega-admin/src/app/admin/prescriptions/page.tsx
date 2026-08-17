import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Glasses, Camera, ChevronRight } from "lucide-react";
import { PrescriptionSearch } from "@/components/PrescriptionSearch";

export default async function PrescriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const whereClause: any = {};
  if (q) {
    whereClause.customer = {
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">Göz Bilgileri</h1>
          <p className="text-muted-foreground text-sm mt-1">{prescriptions.length} göz bilgisi kayıtlı</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <PrescriptionSearch />
          <Link
            href="/admin/customers/new"
            className="gradient-primary text-[#1B242A] px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all glow-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Optik Belge Tara & Ekle</span>
            <span className="sm:hidden">Tara</span>
          </Link>
        </div>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white dark:bg-surface shadow-sm rounded-2xl p-16 text-center  flex flex-col items-center">
          <Glasses className="w-12 h-12 text-amber-600 dark:text-secondary mb-4" />
          <p className="text-foreground font-semibold text-lg mb-2">Henüz göz bilgisi yok</p>
          <p className="text-muted-foreground text-sm mb-6">Müxteri eklerken kamera ile belge okutarak anında ekleyin.</p>
          <Link href="/admin/customers/new" className="gradient-primary text-[#1B242A] px-6 py-3 rounded-xl font-medium flex items-center gap-2">
            <Camera className="w-4 h-4" /> İlk Belgeyi Tara
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
                  {rx.customer ? `${rx.customer.firstName} ${rx.customer.lastName}` : "Bilinmeyen Müxteri"}
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
