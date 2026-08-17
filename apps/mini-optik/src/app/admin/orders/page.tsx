import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, ClipboardList, Clock, CheckCircle, Check, Plus, Loader2, CircleDot } from "lucide-react";
import { OrderSearch } from "@/components/OrderSearch";
import { getStatusConfig } from "@/lib/statusConfig";
import { getSession } from "@/lib/auth";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";

function getActiveTabClass(colorClass: string) {
  if (colorClass.includes('amber')) return 'bg-amber-500 text-white border-amber-500 shadow-md';
  if (colorClass.includes('blue')) return 'bg-blue-500 text-white border-blue-500 shadow-md';
  if (colorClass.includes('emerald')) return 'bg-emerald-500 text-white border-emerald-500 shadow-md';
  if (colorClass.includes('slate')) return 'bg-slate-500 text-white border-slate-500 shadow-md';
  if (colorClass.includes('rose')) return 'bg-rose-500 text-white border-rose-500 shadow-md';
  if (colorClass.includes('purple')) return 'bg-purple-500 text-white border-purple-500 shadow-md';
  if (colorClass.includes('cyan')) return 'bg-cyan-500 text-white border-cyan-500 shadow-md';
  return 'bg-primary text-white border-primary shadow-md';
}

function OrdersSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] w-full ">
      <div className="w-14 h-14 bg-surface border border-[var(--border-color)] shadow-xl rounded-2xl flex items-center justify-center relative z-10">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
      <p className="mt-4 text-sm font-semibold text-muted-foreground animate-pulse">
        Siparişler yükleniyor...
      </p>
    </div>
  );
}

const getCachedOrdersStatus = unstable_cache(
  async () => {
    const statusCounts = await prisma.opticOrder.groupBy({ by: ["status"], _count: true, where: { deletedAt: null } });
    return Object.fromEntries(statusCounts.map((s) => [s.status, typeof s._count === 'number' ? s._count : (s._count as any)?._all ?? 0]));
  },
  ['orders-status-counts'],
  { revalidate: 15, tags: ['orders'] }
);

const getCachedOrdersList = unstable_cache(
  async (activeStatus: string | null, q: string) => {
    const whereClause: any = { deletedAt: null };
    if (activeStatus) whereClause.status = activeStatus;
    if (q) {
      whereClause.OR = [
        { products: { contains: q, mode: "insensitive" } },
        { productCode: { contains: q, mode: "insensitive" } },
        { customer: { firstName: { contains: q, mode: "insensitive" } } },
        { customer: { lastName: { contains: q, mode: "insensitive" } } },
        { customer: { phone: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [orders, totalOrders] = await Promise.all([
      prisma.opticOrder.findMany({
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        include: { customer: true, prescription: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.opticOrder.count({ where: { deletedAt: null } })
    ]);

    return { orders, totalOrders };
  },
  ['orders-list-data'],
  { revalidate: 15, tags: ['orders'] }
);

async function OrdersData({ statusParam, q }: { statusParam: string | null, q: string }) {
  const activeStatus = statusParam || null;
  const session = await getSession();
  const statuses = await getStatusConfig(session?.firmId);
  const statusMap = Object.fromEntries(statuses.map(s => [s.id, s]));

  const countMap = await getCachedOrdersStatus();
  const { orders, totalOrders } = await getCachedOrdersList(activeStatus, q);

  return (
    <div className=" space-y-5">
      {/* ── Filter Tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        <Link
          href="/admin/orders"
          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all flex-shrink-0 ${
            !activeStatus
              ? "bg-primary text-white border-primary"
              : "bg-surface border-[var(--border-color)] text-muted-foreground hover:text-foreground"
          }`}
        >
          Tümü
          <span className={`ml-2 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${!activeStatus ? "bg-white/20" : "bg-background"}`}>
            {totalOrders}
          </span>
        </Link>

        {statuses.map((cfg) => {
          const count = countMap[cfg.id] ?? 0;
          const isActive = activeStatus === cfg.id;
          const activeTabClass = getActiveTabClass(cfg.color);
          return (
            <Link
              key={cfg.id}
              href={`/admin/orders?status=${cfg.id}`}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all inline-flex items-center gap-1.5 flex-shrink-0 ${
                isActive ? activeTabClass : `bg-surface border-[var(--border-color)] ${cfg.color} hover:opacity-80`
              }`}
            >
              {cfg.label}
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20" : "bg-background text-muted-foreground"}`}>
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* ── Empty State ── */}
      {orders.length === 0 && (
        <div className="card p-16 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center">
            <Package className="w-8 h-8 text-secondary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-lg">
              {activeStatus ? `${statusMap[activeStatus]?.label || activeStatus} sipariş yok` : "Henüz sipariş yok"}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {activeStatus ? "Bu durumda sipariş bulunmuyor." : "Müşteri sayfasından sipariş ekleyebilirsiniz."}
            </p>
          </div>
          {activeStatus && (
            <Link href="/admin/orders" className="btn-primary text-sm">
              Tüm Siparişleri Gör
            </Link>
          )}
        </div>
      )}

      {/* ── Orders List ── */}
      {orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = statusMap[order.status] || { label: order.status, bg: "bg-surface", color: "text-muted-foreground" };
            return (
              <Link
                key={order.id}
                href={`/admin/customers/${order.customerId}`}
                className="card flex items-center gap-4 p-4 sm:p-5 hover:border-primary/30 group transition-all active:scale-[0.99]"
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center text-white font-black text-base flex-shrink-0">
                  {order.customer ? order.customer.firstName.charAt(0).toUpperCase() : "?"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-semibold text-sm group-hover:text-primary transition-colors truncate">
                    {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : "Bilinmeyen Müşteri"}
                  </p>
                  <p className="text-muted-foreground text-xs">{order.customer?.phone || "-"}</p>
                  {order.products && (
                    <p className="text-muted-foreground text-xs mt-0.5 truncate">{order.products}</p>
                  )}
                </div>

                {/* Status + Price */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border inline-flex items-center gap-1 ${cfg.bg} ${cfg.color}`}>
                    <CircleDot className="w-3.5 h-3.5" /> {cfg.label}
                  </span>
                  {order.totalPrice != null && (
                    <span className="text-foreground font-bold text-sm">{order.totalPrice.toLocaleString("tr-TR")} ₺</span>
                  )}
                  <span className="text-muted-foreground text-[10px]">
                    {new Date(order.orderDate).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status: statusParam, q } = await searchParams;

  return (
    <div className="page-container space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Siparişler</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kayıtlı siparişleriniz
          </p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex-1 lg:w-[400px]">
            <OrderSearch />
          </div>
          <Link href="/admin/orders/new" className="btn-primary inline-flex items-center justify-center gap-2 flex-shrink-0 whitespace-nowrap h-[42px] px-5">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Sipariş Oluştur</span>
            <span className="sm:hidden">Ekle</span>
          </Link>
        </div>
      </div>

      <Suspense key={`${statusParam}-${q}`} fallback={<OrdersSkeleton />}>
        <OrdersData statusParam={statusParam || null} q={q || ""} />
      </Suspense>
    </div>
  );
}
