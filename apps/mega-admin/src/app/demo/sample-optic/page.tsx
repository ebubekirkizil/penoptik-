import { prisma } from "@/lib/mock-prisma";
import Link from "next/link";
import { Users, Package, CheckCircle, Clock, Plus, ClipboardList, Search, TrendingUp, DollarSign, ArrowRight, Eye, CreditCard, Loader2 } from "lucide-react";
import FinancialChart from "@/components/FinancialChart";
import CustomerChart from "@/components/CustomerChart";
import ClickableRow from "@/components/ClickableRow";
import { Suspense } from "react";

const STATUS_CONFIG = {
  PENDING:   { label: "Bekleyen",      color: "text-amber-500",   bg: "bg-amber-500/10", border: "border-amber-500/20" },
  PREPARING: { label: "HazÄ±rlanÄ±yor",  color: "text-blue-500",    bg: "bg-blue-500/10", border: "border-blue-500/20" },
  READY:     { label: "Teslime HazÄ±r", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  DELIVERED: { label: "Teslim Edildi", color: "text-muted-foreground", bg: "bg-slate-500/10", border: "border-slate-500/20" },
};

function DashboardSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] w-full animate-in fade-in duration-300">
      <div className="w-14 h-14 bg-surface border border-[var(--border-color)] shadow-xl rounded-2xl flex items-center justify-center relative z-10">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
      <p className="mt-4 text-sm font-semibold text-muted-foreground animate-pulse">
        Dashboard yÃ¼kleniyor...
      </p>
    </div>
  );
}

async function DashboardData() {
  const [totalCustomers, totalOrders, recentOrders, statusCounts, chartOrders, chartCustomers] = await Promise.all([
    prisma.customer.count({ where: { deletedAt: null } }),
    prisma.opticOrder.count({ where: { deletedAt: null } }),
    prisma.opticOrder.findMany({
      where: { deletedAt: null },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    prisma.opticOrder.groupBy({ by: ["status"], _count: true, where: { deletedAt: null } }),
    prisma.opticOrder.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: { id: true, totalPrice: true, deposit: true, createdAt: true },
    }),
    prisma.customer.findMany({
      where: { deletedAt: null },
      select: { id: true, createdAt: true },
    }),
  ]);

  const getCount = (status: string) => {
    const item = statusCounts.find((s: any) => s.status === status);
    if (!item) return 0;
    if (typeof item._count === "number") return item._count;
    if (item._count && typeof item._count === "object") return (item._count as any)._all ?? (item._count as any).status ?? 0;
    return 0;
  };

  const readyOrders    = getCount("READY");
  const pendingOrders  = getCount("PENDING");
  const preparingCount = getCount("PREPARING");
  const deliveredOrders = getCount("DELIVERED");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  let todayRevenue = 0;
  let todayOrdersCount = 0;
  let monthlyRevenue = 0;

  chartOrders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    if (orderDate >= firstDayOfMonth) {
      monthlyRevenue += (order.totalPrice || 0);
    }
    if (orderDate >= today) {
      todayRevenue += (order.totalPrice || 0);
      todayOrdersCount++;
    }
  });

  const quickActions = [
    { href: "/demo/sample-optic/customers/new", icon: Plus,          label: "Yeni MÃ¼ÅŸteri Ekle", desc: "Sisteme yeni hasta kaydet" },
    { href: "/demo/sample-optic/orders/new",    icon: Package,       label: "Yeni SipariÅŸ OluÅŸtur", desc: "GÃ¶zlÃ¼k veya lens sipariÅŸi" },
    { href: "/demo/sample-optic/installments",  icon: CreditCard,    label: "Alacak Takibi", desc: "Bekleyen taksitleri izle" },
    { href: "/demo/sample-optic/orders",        icon: ClipboardList, label: "SipariÅŸleri YÃ¶net",   desc: "TÃ¼m sipariÅŸleri listele" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* â”€â”€ Main Stats â”€â”€ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group flex flex-col">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Toplam MÃ¼ÅŸteri</h3>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="relative z-10 text-3xl font-black text-foreground">{totalCustomers}</p>
          <p className="relative z-10 text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12% bu ay</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group flex flex-col">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Toplam SipariÅŸ</h3>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="relative z-10 text-3xl font-black text-foreground">{totalOrders}</p>
          <p className="relative z-10 text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +5% bu ay</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group flex flex-col">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">BugÃ¼nkÃ¼ Ciro</h3>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="relative z-10 text-3xl font-black text-foreground">{todayRevenue.toLocaleString('tr-TR')} â‚º</p>
          <p className="relative z-10 text-xs font-medium text-muted-foreground mt-2">{todayOrdersCount} sipariÅŸ tamamlandÄ±</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group flex flex-col">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">AylÄ±k Ciro</h3>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="relative z-10 text-3xl font-black text-foreground">{monthlyRevenue.toLocaleString('tr-TR')} â‚º</p>
          <p className="relative z-10 text-xs font-medium text-muted-foreground mt-2">Bu ayki hedefe %85 ulaÅŸÄ±ldÄ±</p>
        </div>
      </div>

      {/* â”€â”€ Order Status Overview â”€â”€ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link prefetch={false} href="/demo/sample-optic/orders?status=PENDING" className="p-5 rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 hover:bg-amber-100 dark:hover:bg-amber-500/10 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 transition-colors"></div>
          <div className="relative z-10 flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wider">Bekleyen</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="relative z-10 text-3xl font-black text-amber-900 dark:text-amber-400">{pendingOrders}</p>
        </Link>
        <Link prefetch={false} href="/demo/sample-optic/orders?status=PREPARING" className="p-5 rounded-2xl border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5 hover:bg-blue-100 dark:hover:bg-blue-500/10 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 transition-colors"></div>
          <div className="relative z-10 flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-500 uppercase tracking-wider">HazÄ±rlanÄ±yor</span>
            <Package className="w-5 h-5 text-blue-500" />
          </div>
          <p className="relative z-10 text-3xl font-black text-blue-900 dark:text-blue-400">{preparingCount}</p>
        </Link>
        <Link prefetch={false} href="/demo/sample-optic/orders?status=READY" className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 transition-colors"></div>
          <div className="relative z-10 flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-wider">Teslime HazÄ±r</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="relative z-10 text-3xl font-black text-emerald-900 dark:text-emerald-400">{readyOrders}</p>
        </Link>
        <Link prefetch={false} href="/demo/sample-optic/orders?status=DELIVERED" className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 transition-colors"></div>
          <div className="relative z-10 flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">Teslim Edildi</span>
            <CheckCircle className="w-5 h-5 text-slate-400" />
          </div>
          <p className="relative z-10 text-3xl font-black text-slate-900 dark:text-slate-300">{deliveredOrders}</p>
        </Link>
      </div>

      {/* â”€â”€ Quick Actions â”€â”€ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link prefetch={false} key={action.href}
            href={action.href}
            className="flex flex-col gap-3 p-5 rounded-2xl bg-white dark:bg-surface border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <action.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{action.label}</p>
                <p className="text-xs font-medium text-slate-500">{action.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* â”€â”€ Charts â”€â”€ */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Finansal Ä°statistikler</h2>
          <FinancialChart
            orders={chartOrders.map(o => ({
              ...o,
              createdAt: o.createdAt.toISOString()
            }))}
          />
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">MÃ¼ÅŸteri BÃ¼yÃ¼mesi</h2>
          <CustomerChart
            customers={chartCustomers.map(c => ({
              ...c,
              createdAt: c.createdAt.toISOString()
            }))}
          />
        </div>
      </div>

      {/* â”€â”€ Recent Orders â”€â”€ */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none mt-6">
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">Son Eklenen SipariÅŸler</h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Sisteme girilen en yeni sipariÅŸler</p>
            </div>
          </div>
          <Link prefetch={false} href="/demo/sample-optic/orders" className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
            TÃ¼mÃ¼nÃ¼ GÃ¶r <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="p-0">
          {recentOrders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Package className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium text-sm">HenÃ¼z sistemde sipariÅŸ bulunmuyor.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {recentOrders.map((order) => {
                const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
                const initials = `${order.customer?.firstName?.[0] || '?'}${order.customer?.lastName?.[0] || ''}`.toUpperCase();
                
                return (
                  <Link prefetch={false} 
                    key={order.id} 
                    href={`/demo/sample-optic/customers/${order.customerId}`} 
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0 border border-primary/20">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base group-hover:text-primary transition-colors">
                          {order.customer?.firstName || 'Bilinmeyen'} {order.customer?.lastName || 'MÃ¼ÅŸteri'}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          {order.customer?.phone || '-'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm whitespace-nowrap`}>
                        <span className={`w-1.5 h-1.5 rounded-full bg-current ${order.status === 'DELIVERED' ? '' : 'animate-pulse'}`}></span>
                        {cfg.label}
                      </span>
                      
                      <div className="text-right min-w-[80px]">
                        <span className="font-black text-foreground text-lg">
                          {order.totalPrice !== null ? order.totalPrice.toLocaleString("tr-TR") : "-"}
                        </span>
                        {order.totalPrice !== null && <span className="text-slate-500 font-bold ml-1">â‚º</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* â”€â”€ Header â”€â”€ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Kontrol Paneli</h1>
          <p className="text-muted-foreground text-sm mt-1">Sisteme genel bakÄ±ÅŸ ve hÄ±zlÄ± iÅŸlemler.</p>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardData />
      </Suspense>
    </div>
  );
}

