import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Package, CheckCircle, Clock, Plus, ClipboardList, Search, TrendingUp, DollarSign, ArrowRight, Eye, CreditCard, Loader2, ScanBarcode, ArrowDownToLine, MessageSquareShare, Activity } from "lucide-react";
import FinancialChart from "@/components/FinancialChart";
import CustomerChart from "@/components/CustomerChart";
import ClickableRow from "@/components/ClickableRow";
import AdminNotifications from "@/components/AdminNotifications";
import { Suspense } from "react";

import { getStatusConfig } from "@/lib/statusConfig";
import { cookies } from "next/headers";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] w-full ">
      <div className="w-14 h-14 bg-surface border border-[var(--border-color)] shadow-xl rounded-2xl flex items-center justify-center relative z-10">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
      <p className="mt-4 text-sm font-semibold text-muted-foreground animate-pulse">
        Dashboard yükleniyor...
      </p>
    </div>
  );
}

import { unstable_cache } from "next/cache";

const getCachedDashboardData = unstable_cache(
  async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const res = await Promise.all([
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
        where: { deletedAt: null, createdAt: { gte: firstDayOfLastMonth } },
        orderBy: { createdAt: "desc" },
        select: { id: true, totalPrice: true, deposit: true, createdAt: true },
        take: 500,
      }),
      prisma.customer.findMany({
        where: { deletedAt: null, createdAt: { gte: firstDayOfLastMonth } },
        select: { id: true, createdAt: true },
        take: 500,
      }),
      prisma.settings.findFirst(),
      prisma.productVariant.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          product: { select: { name: true } },
          warehouseStocks: { select: { quantity: true } }
        }
      }),
      prisma.installment.findMany({
        where: { isPaid: false, dueDate: { lt: today } },
        include: { order: { include: { customer: true } } }
      }),
      prisma.customerVerification.count({
        where: { status: "PENDING" }
      })
    ]);

    return {
      totalCustomers: res[0],
      totalOrders: res[1],
      recentOrders: res[2],
      statusCounts: res[3],
      chartOrders: res[4],
      chartCustomers: res[5],
      settings: res[6],
      variants: res[7] || [],
      overdueInstallments: res[8] || [],
      pendingVerificationsCount: res[9] || 0,
    };
  },
  ['dashboard-data-v2'],
  { revalidate: 60, tags: ['dashboard'] }
);

export default async function AdminDashboard() {
  let dashboardData: any = {};
  let notifications: any[] = [];
  
  try {
    dashboardData = await getCachedDashboardData();
    const { variants = [], overdueInstallments = [], pendingVerificationsCount = 0 } = dashboardData;

    variants.forEach((v: any) => {
      const stock = v.warehouseStocks?.reduce((acc: number, s: any) => acc + s.quantity, 0) || 0;
      const criticalLimit = 5; // Hardcoded default as seen in API
      const name = v.name || v.product?.name || "İsimsiz Ürün";
      if (stock === 0) {
        notifications.push({ id: `oos-${v.id}`, type: "OUT_OF_STOCK", title: "Stok Tükendi", description: `${name} ürününün stoğu bitti!`, link: "/admin/inventory?tab=INVENTORY", isRead: false });
      } else if (stock <= criticalLimit) {
        notifications.push({ id: `crit-${v.id}`, type: "CRITICAL_STOCK", title: "Kritik Stok", description: `${name} ürünü kritik seviyeye (${stock}) düştü.`, link: "/admin/inventory?tab=INVENTORY", isRead: false });
      }
    });

    overdueInstallments.forEach((inst: any) => {
      const cFirstName = inst.order?.customer?.firstName || "Bilinmeyen";
      const cLastName = inst.order?.customer?.lastName || "Müşteri";
      notifications.push({ id: `overdue-${inst.id}`, type: "OVERDUE_PAYMENT", title: "Gecikmiş Ödeme", description: `${cFirstName} ${cLastName} için gecikmiş ${inst.amount}₺ ödeme.`, link: "/admin/finance?tab=PLANNED_PAYMENTS", isRead: false });
    });

    if (pendingVerificationsCount > 0) {
      notifications.push({ id: "pending-verifs", type: "PENDING_VERIFICATION", title: "Onay Bekleyen İşlemler", description: `${pendingVerificationsCount} adet müşteri doğrulama işlemi onay bekliyor.`, link: "/admin/system/verifications", isRead: false });
    }
  } catch (err) {
    console.error("AdminDashboard fetch error:", err);
  }

  const {
    totalCustomers = 0,
    totalOrders = 0,
    recentOrders = [],
    statusCounts = [],
    chartOrders = [],
    chartCustomers = [],
    settings = null,
  } = dashboardData;

  const cookieStore = await cookies();
  const firmId = cookieStore.get("firmId")?.value;
  const statusConfig = await getStatusConfig(firmId);

  const getCount = (status: string) => {
    const item = statusCounts.find((s: any) => s.status === status);
    if (!item) return 0;
    if (typeof item._count === "number") return item._count;
    if (item._count && typeof item._count === "object") return (item._count as any)._all ?? (item._count as any).status ?? 0;
    return 0;
  };

  // Sistem saatine göre (Türkiye Saati için +3 vb. ayarlanabilir)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

  let todayRevenue = 0;
  let todayOrdersCount = 0;
  
  let monthlyRevenue = 0;
  let lastMonthRevenue = 0;
  
  let thisMonthOrdersCount = 0;
  let lastMonthOrdersCount = 0;

  chartOrders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    if (orderDate >= firstDayOfMonth) {
      monthlyRevenue += (order.totalPrice || 0);
      thisMonthOrdersCount++;
    } else if (orderDate >= firstDayOfLastMonth && orderDate <= lastDayOfLastMonth) {
      lastMonthRevenue += (order.totalPrice || 0);
      lastMonthOrdersCount++;
    }
    
    if (orderDate >= today) {
      todayRevenue += (order.totalPrice || 0);
      todayOrdersCount++;
    }
  });

  let thisMonthCustomersCount = 0;
  let lastMonthCustomersCount = 0;
  
  chartCustomers.forEach(customer => {
    const customerDate = new Date(customer.createdAt);
    if (customerDate >= firstDayOfMonth) {
      thisMonthCustomersCount++;
    } else if (customerDate >= firstDayOfLastMonth && customerDate <= lastDayOfLastMonth) {
      lastMonthCustomersCount++;
    }
  });

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const customerGrowth = calculateGrowth(thisMonthCustomersCount, lastMonthCustomersCount);
  const orderGrowth = calculateGrowth(thisMonthOrdersCount, lastMonthOrdersCount);
  const revenueGrowth = calculateGrowth(monthlyRevenue, lastMonthRevenue);

  const quickActions = [
    { href: "/admin/customers/new", icon: Plus,          label: "Yeni Müşteri Ekle", desc: "Sisteme yeni hasta kaydet" },
    { href: "/admin/orders/new",    icon: Package,       label: "Yeni Sipariş Oluştur", desc: "Gözlük veya lens siparişi" },
    { href: "/admin/finance?tab=PLANNED_PAYMENTS",  icon: CreditCard,    label: "Alacak Takibi", desc: "Bekleyen taksitleri izle" },
    { href: "/admin/orders",        icon: ClipboardList, label: "Siparişleri Yönet",   desc: "Tüm siparişleri listele" },
    { href: "/admin/inventory?tab=RAPID_SCAN", icon: ScanBarcode,   label: "Hızlı Stok Sayımı",   desc: "Barkod okutarak sayım yap" },
    { href: "/admin/inventory?action=new", icon: Plus, label: "Yeni Stok Ekle", desc: "Yeni depo ürünü tanımla" },
    { href: "/admin/inventory?tab=SUPPLIERS", icon: ArrowDownToLine, label: "Tedarikçi Siparişi", desc: "Tedarikçiden stok iste" },
    { href: "/admin/system/communications", icon: MessageSquareShare, label: "İletişim & Mesaj", desc: "Müşterilere mesaj gönder" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 ">
      {/*    Header    */}
      <div className="flex flex-row items-center justify-between gap-4 mb-4 sm:mb-2">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Kontrol Paneli</h1>
          <p className="text-muted-foreground text-sm mt-1 hidden sm:block">Sisteme genel bakış ve hızlı işlemler.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <AdminNotifications initialNotifications={notifications} />
        </div>
      </div>

      {/*    Main Stats    */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group flex flex-col">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Toplam Müşteri</h3>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="relative z-10 text-3xl font-black text-foreground">{totalCustomers}</p>
          <p className={`relative z-10 text-xs font-medium mt-2 flex items-center gap-1 ${customerGrowth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            <TrendingUp className={`w-3 h-3 ${customerGrowth < 0 ? 'rotate-180' : ''}`}/> 
            {customerGrowth > 0 ? '+' : ''}{customerGrowth}% geçen aya göre
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group flex flex-col">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Toplam Sipariş</h3>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="relative z-10 text-3xl font-black text-foreground">{totalOrders}</p>
          <p className={`relative z-10 text-xs font-medium mt-2 flex items-center gap-1 ${orderGrowth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            <TrendingUp className={`w-3 h-3 ${orderGrowth < 0 ? 'rotate-180' : ''}`}/> 
            {orderGrowth > 0 ? '+' : ''}{orderGrowth}% geçen aya göre
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group flex flex-col">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Bugünkü Ciro</h3>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="relative z-10 text-3xl font-black text-foreground">{todayRevenue.toLocaleString('tr-TR')} ₺</p>
          <p className="relative z-10 text-xs font-medium text-muted-foreground mt-2">{todayOrdersCount} sipariş tamamlandı</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group flex flex-col">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Aylık Ciro</h3>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="relative z-10 text-3xl font-black text-foreground">{monthlyRevenue.toLocaleString('tr-TR')} ₺</p>
          <p className={`relative z-10 text-xs font-medium mt-2 flex items-center gap-1 ${revenueGrowth >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
            <TrendingUp className={`w-3 h-3 ${revenueGrowth < 0 ? 'rotate-180' : ''}`}/> 
            {revenueGrowth > 0 ? '+' : ''}{revenueGrowth}% geçen aya göre
          </p>
        </div>
      </div>

      {/*    Order Status Overview    */}
      <div 
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`
        }}
      >
        {statusConfig.map((status) => (
          <Link key={status.id} href={`/admin/orders?status=${status.id}`} className={`p-5 rounded-2xl border ${status.border} bg-white dark:bg-surface hover:shadow-lg dark:shadow-none transition-all relative overflow-hidden group`}>
            {/* Subtle coürünüer blur matching the upper cards aesthetic */}
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-colors ${status.bg.replace('/50', '').replace('/10', '')}`}></div>
            
            <div className="relative z-10 flex items-center justify-between mb-3">
              <span className={`text-xs font-bold ${status.color} uppercase tracking-wider`}>{status.label}</span>
              <CheckCircle className={`w-5 h-5 ${status.color}`} />
            </div>
            <p className="relative z-10 text-3xl font-black text-foreground">{getCount(status.id)}</p>
          </Link>
        ))}
      </div>

      {/*    Quick Actions    */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.href}
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

      {/*    Charts    */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-surface border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Finansal İstatistikler</h2>
          <FinancialChart
            orders={chartOrders.map((o: any) => ({
              ...o,
              createdAt: new Date(o.createdAt).toISOString()
            }))}
          />
        </div>
        <div className="bg-white dark:bg-surface border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Müşteri Büyümesi</h2>
          <CustomerChart
            customers={chartCustomers.map((c: any) => ({
              ...c,
              createdAt: new Date(c.createdAt).toISOString()
            }))}
          />
        </div>
      </div>

      {/*    Recent Orders    */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none mt-6">
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">Son Eklenen Siparişler</h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Sisteme girilen en yeni siparişler</p>
            </div>
          </div>
          <Link href="/admin/orders" className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
            Tümünü Gör <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="p-0">
          {recentOrders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Package className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium text-sm">Henüz sistemde sipariş bulunmuyor.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {recentOrders.map((order: any) => {
                const cfg = statusConfig.find((s) => s.id === order.status) || statusConfig.find((s) => s.id === "PENDING") || statusConfig[0];
                const cFirstName = order.customer?.firstName || "?";
                const cLastName = order.customer?.lastName || "?";
                const cPhone = order.customer?.phone || "Telefon Yok";
                const initials = `${cFirstName[0] || ""}${cLastName[0] || ""}`.toUpperCase() || "M";
                
                return (
                  <Link 
                    key={order.id} 
                    href={`/admin/customers/${order.customerId}`} 
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0 border border-primary/20">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base group-hover:text-primary transition-colors">
                          {cFirstName} {cLastName}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          {cPhone}
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
                        {order.totalPrice !== null && <span className="text-slate-500 font-bold ml-1">₺</span>}
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
