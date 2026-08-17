import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Package, ClipboardList, Clock, CheckCircle, Check, ChevronRight, Filter } from "lucide-react";

import { OrderSearch } from "@/components/OrderSearch";

const STATUS_CONFIG = {
  PENDING:   { label: "Bekliyor",      icon: <ClipboardList className="w-3 h-3" />, color: "text-yellow-500",  bg: "bg-yellow-500/10 border-yellow-500/20",  activeTab: "bg-yellow-500 text-white border-yellow-500" },
  PREPARING: { label: "Hazırlanıyor",  icon: <Clock className="w-3 h-3" />,         color: "text-blue-500",    bg: "bg-blue-500/10 border-blue-500/20",      activeTab: "bg-blue-500 text-white border-blue-500" },
  READY:     { label: "Teslime Hazır", icon: <CheckCircle className="w-3 h-3" />,   color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", activeTab: "bg-emerald-500 text-white border-emerald-500" },
  DELIVERED: { label: "Teslim Edildi", icon: <Check className="w-3 h-3" />,         color: "text-muted-foreground",   bg: "bg-white dark:bg-surface border-border-color",              activeTab: "bg-white dark:bg-surface text-foreground border-border-color" },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status: statusParam, q } = await searchParams;
  const activeStatus = (statusParam?.toUpperCase() as StatusKey) || null;

  // Fetch counts per status for tab badges
  const statusCounts = await prisma.opticOrder.groupBy({ by: ["status"], _count: true });
  const countMap = Object.fromEntries(statusCounts.map(s => [s.status, typeof s._count === 'number' ? s._count : (s._count as any)?._all ?? 0]));

  const whereClause: any = {};
  if (activeStatus) {
    whereClause.status = activeStatus;
  }
  if (q) {
    whereClause.OR = [
      { products: { contains: q, mode: "insensitive" } },
      { productCode: { contains: q, mode: "insensitive" } },
      { customer: { firstName: { contains: q, mode: "insensitive" } } },
      { customer: { lastName: { contains: q, mode: "insensitive" } } },
      { customer: { phone: { contains: q, mode: "insensitive" } } },
    ];
  }

  const orders = await prisma.opticOrder.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    include: { customer: true, prescription: true },
    orderBy: { createdAt: "desc" },
  });

  const totalOrders = await prisma.opticOrder.count();

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">Siparixler</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activeStatus
              ? `${STATUS_CONFIG[activeStatus]?.label} — ${orders.length} siparix`
              : `Toplam ${totalOrders} siparix`
            }
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <OrderSearch />
        </div>
      </div>

      {/* Filter Tabs - scrollable on mobile */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 sm:flex-wrap scrollbar-none w-full">
        <Link
          href="/admin/orders"
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex-shrink-0 ${
            !activeStatus
              ? "bg-primary text-[#1B242A] border-primary"
              : "bg-white dark:bg-surface border-border-color text-muted-foreground"
          }`}
        >
          Tümü
          <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${!activeStatus ? "bg-[#1B242A]/20" : "bg-background"}`}>
            {totalOrders}
          </span>
        </Link>

        {(Object.entries(STATUS_CONFIG) as [StatusKey, typeof STATUS_CONFIG[StatusKey]][]).map(([key, cfg]) => {
          const count = countMap[key] ?? 0;
          const isActive = activeStatus === key;
          return (
            <Link
              key={key}
              href={`/admin/orders?status=${key}`}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all inline-flex items-center gap-1 flex-shrink-0 ${
                isActive
                  ? cfg.activeTab
                  : `bg-white dark:bg-surface border-border-color ${cfg.color}`
              }`}
            >
              {cfg.icon}
              {cfg.label}
              <span className={`ml-0.5 text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 dark:bg-surface-light/20" : "bg-background"}`}>
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white dark:bg-surface shadow-sm rounded-2xl p-16 text-center  flex flex-col items-center">
          <Package className="w-12 h-12 text-amber-600 dark:text-secondary mb-4" />
          <p className="text-foreground font-semibold text-lg mb-2">
            {activeStatus ? `${STATUS_CONFIG[activeStatus]?.label} siparix yok` : "Henüz siparix yok"}
          </p>
          <p className="text-muted-foreground text-sm">
            {activeStatus
              ? "Bu durumda siparix bulunmuyor."
              : "Müxteri sayfasından siparix ekleyebilirsiniz."
            }
          </p>
          {activeStatus && (
            <Link
              href="/admin/orders"
              className="mt-4 gradient-primary text-[#1B242A] px-4 py-2 rounded-xl text-sm font-semibold"
            >
              Tüm Siparixleri Gör
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status as StatusKey] || STATUS_CONFIG.PENDING;
            return (
              <Link
                key={order.id}
                href={`/admin/customers/${order.customerId}`}
                className="bg-white dark:bg-surface rounded-2xl p-4 sm:p-5 flex items-center gap-2 sm:gap-3  hover:border-primary/40 group overflow-hidden"
              >
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-[#1B242A] text-base flex-shrink-0 font-bold">
                  {order.customer ? order.customer.firstName.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-semibold text-sm group-hover:text-primary transition-colors truncate">
                    {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : "Bilinmeyen Müxteri"}
                  </p>
                  <p className="text-muted-foreground text-xs">{order.customer?.phone || "-"}</p>
                  {order.products && (
                    <p className="text-muted-foreground text-xs mt-0.5 truncate">{order.products}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 text-right flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border inline-flex items-center gap-1 ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                  {order.totalPrice != null && (
                    <span className="text-foreground font-semibold text-sm">{order.totalPrice.toLocaleString("tr-TR")}  </span>
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
