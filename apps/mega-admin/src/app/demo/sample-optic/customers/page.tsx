import { prisma } from "@/lib/mock-prisma";
import Link from "next/link";
import { Plus, Users, Package, Glasses, Calendar, Phone, Mail, ChevronRight, Loader2 } from "lucide-react";
import { CustomerSearch } from "@/components/CustomerSearch";
import ClickableRow from "@/components/ClickableRow";
import { Suspense } from "react";

const STATUS_CONFIG = {
  PENDING:   { label: "Bekliyor",      color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  PREPARING: { label: "Hazırlanıyor",  color: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-500/10 border-blue-500/20" },
  READY:     { label: "Teslime Hazır", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  DELIVERED: { label: "Teslim Edildi", color: "text-muted-foreground",                bg: "bg-surface border-[var(--border-color)]" },
};

function CustomersSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] w-full animate-in fade-in duration-300">
      <div className="w-14 h-14 bg-surface border border-[var(--border-color)] shadow-xl rounded-2xl flex items-center justify-center relative z-10">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
      <p className="mt-4 text-sm font-semibold text-muted-foreground animate-pulse">
        Müxteriler yükleniyor...
      </p>
    </div>
  );
}

async function CustomersData({ q, filter }: { q: string, filter: string }) {
  const whereClause: any = { deletedAt: null };
  if (q) {
    whereClause.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }
  if (filter === "active")   whereClause.hasLoggedBefore = true;
  else if (filter === "inactive") whereClause.hasLoggedBefore = false;

  const customers = await prisma.customer.findMany({
    where: whereClause,
    include: {
      _count: { select: { opticOrders: true, prescriptions: true } },
      opticOrders: { take: 1, orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-in fade-in duration-500">
      {/* ── Empty State ── */}
      {customers.length === 0 && (
        <div className="card p-16 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted-foreground/10 flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <div>
            <p className="font-black text-foreground text-xl">Henüz Müxteri Yok</p>
            <p className="text-muted-foreground text-sm mt-1">Yeni müxteri ekleyerek baxlayın.</p>
          </div>
          <Link href="/demo/sample-optic/customers/new" className="btn-primary mt-2">
            <Plus className="w-4 h-4" /> İlk Müxteriyi Ekle
          </Link>
        </div>
      )}

      {/* ── Desktop Table ── */}
      {customers.length > 0 && (
        <>
          {/* Desktop: tablo */}
          <div className="card overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-background border-b border-[var(--border-color)]">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Müxteri</th>
                    <th className="px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">İletixim</th>
                    <th className="px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Son Siparix</th>
                    <th className="px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Kayıt</th>
                    <th className="px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider text-right">İxlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {customers.map((customer) => {
                    const lastOrder = customer.opticOrders[0];
                    const cfg = lastOrder ? STATUS_CONFIG[lastOrder.status as keyof typeof STATUS_CONFIG] : null;
                    return (
                      <ClickableRow
                        key={customer.id}
                        href={`/demo/sample-optic/customers/${customer.id}`}
                        className="hover:bg-background/60 transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                              {(customer.firstName || "").charAt(0)}{(customer.lastName || "").charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">
                                {customer.firstName} {customer.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">Bireysel</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <p className="text-sm text-foreground flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                              {customer.phone}
                            </p>
                            {customer.email && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                {customer.email}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {cfg && lastOrder ? (
                            <div className="space-y-1">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.color}`}>
                                {cfg.label}
                              </span>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(lastOrder.createdAt).toLocaleDateString("tr-TR")}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Siparix yok</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-background border border-[var(--border-color)] px-2 py-1 rounded-lg">
                              <Package className="w-3 h-3" /> {customer._count.opticOrders}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-background border border-[var(--border-color)] px-2 py-1 rounded-lg">
                              <Glasses className="w-3 h-3" /> {customer._count.prescriptions}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/demo/sample-optic/customers/${customer.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark"
                          >
                            Detay <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </ClickableRow>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: kart listesi */}
          <div className="md:hidden space-y-3">
            {customers.map((customer) => {
              const lastOrder = customer.opticOrders[0];
              const cfg = lastOrder ? STATUS_CONFIG[lastOrder.status as keyof typeof STATUS_CONFIG] : null;
              return (
                <Link
                  key={customer.id}
                  href={`/demo/sample-optic/customers/${customer.id}`}
                  className="card flex items-center gap-4 p-4 active:scale-[0.99] transition-transform"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-base flex-shrink-0">
                    {(customer.firstName || "").charAt(0)}{(customer.lastName || "").charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm truncate">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {customer.phone}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-muted-foreground bg-background px-1.5 py-0.5 rounded-md border border-[var(--border-color)]">
                        {customer._count.opticOrders} siparix
                      </span>
                      {cfg && lastOrder && (
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string }> }) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const filter = resolvedParams.filter || "all";

  return (
    <div className="page-container space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Müxteriler</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kayıtlı müxterileriniz
          </p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex-1 lg:w-[400px]">
            <CustomerSearch />
          </div>
          <Link
            href="/demo/sample-optic/customers/new"
            className="btn-primary flex-shrink-0 flex items-center justify-center whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yeni Müxteri</span>
            <span className="sm:hidden">Ekle</span>
          </Link>
        </div>
      </div>

      <Suspense key={`${q}-${filter}`} fallback={<CustomersSkeleton />}>
        <CustomersData q={q} filter={filter} />
      </Suspense>
    </div>
  );
}
