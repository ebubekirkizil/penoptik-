import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { 
  Users, Package, CheckCircle, Clock, Plus, ClipboardList, Search, Box, 
  TrendingUp, ShieldAlert, ArrowUp, ArrowDown, Zap, Activity, DollarSign,
  AlertCircle, Calendar, Eye, ArrowRight, Sparkles, BarChart3, ShoppingBag
} from "lucide-react";
import FinancialChart from "@/components/FinancialChart";
import CustomerChart from "@/components/CustomerChart";
import PendingVerificationsList from "@/components/PendingVerificationsList";

const STATUS_CONFIG = {
  PENDING:   { label: "Bekliyor",      color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  PREPARING: { label: "HazÄ±rlanÄ±yor",  color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
  READY:     { label: "Teslime HazÄ±r", color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/20" },
  DELIVERED: { label: "Teslim Edildi", color: "text-muted-foreground",   bg: "bg-white dark:bg-surface border-border-color" },
};

export default async function AdminDashboard() {
  const [
    totalCustomers, 
    totalOrders, 
    recentOrders, 
    statusCounts, 
    chartOrders, 
    chartCustomers, 
    pendingVerifications,
    todayOrders,
    thisWeekOrders,
    thisMonthRevenue,
    todayRevenue
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.opticOrder.count(),
    prisma.opticOrder.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    prisma.opticOrder.groupBy({ by: ["status"], _count: true }),
    prisma.opticOrder.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, totalPrice: true, deposit: true, createdAt: true },
    }),
    prisma.customer.findMany({
      select: { id: true, createdAt: true },
    }),
    prisma.prescription.findMany({
      where: { isPending: true },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    }),
    // Today's orders
    prisma.opticOrder.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    // This week's orders
    prisma.opticOrder.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    // This month's revenue
    prisma.opticOrder.aggregate({
      _sum: { totalPrice: true },
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    }),
    // Today's revenue
    prisma.opticOrder.aggregate({
      _sum: { totalPrice: true },
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })
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
  const deliveredCount = getCount("DELIVERED");
  
  const monthRevenue = thisMonthRevenue._sum.totalPrice || 0;
  const todayRevenueAmount = todayRevenue._sum.totalPrice || 0;

  const stats = [
    {
      label: "Toplam MÃ¼ÅŸteri",
      value: totalCustomers,
      icon: <Users className="w-6 h-6" />,
      gradient: "from-purple-500 via-purple-400 to-pink-500",
      glowColor: "purple",
      href: "/admin/customers",
      desc: "TÃ¼m mÃ¼ÅŸterileri gÃ¶r",
      change: "+12",
      changeLabel: "bu hafta"
    },
    {
      label: "Toplam SipariÅŸ",
      value: totalOrders,
      icon: <Package className="w-6 h-6" />,
      gradient: "from-cyan-500 via-blue-500 to-indigo-500",
      glowColor: "cyan",
      href: "/admin/orders",
      desc: "TÃ¼m sipariÅŸleri gÃ¶r",
      change: `+${thisWeekOrders}`,
      changeLabel: "bu hafta"
    },
    {
      label: "BugÃ¼nkÃ¼ Ciro",
      value: `${todayRevenueAmount.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}â‚º`,
      icon: <DollarSign className="w-6 h-6" />,
      gradient: "from-emerald-500 via-green-400 to-teal-500",
      glowColor: "emerald",
      href: "/admin/orders",
      desc: "Finansal raporu gÃ¶r",
      change: `${todayOrders}`,
      changeLabel: "sipariÅŸ bugÃ¼n"
    },
    {
      label: "AylÄ±k Ciro",
      value: `${monthRevenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}â‚º`,
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: "from-orange-500 via-amber-400 to-yellow-500",
      glowColor: "orange",
      href: "/admin/orders",
      desc: "DetaylÄ± analiz",
      change: "+18.2%",
      changeLabel: "geÃ§en aya gÃ¶re"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8">
        
        {/* ============================================
            HEADER SECTION - Ultra Modern
        ============================================ */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-4">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-purple-500/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-purple-900 dark:text-purple-100 uppercase tracking-wider">
                  Premium Dashboard
                </span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter">
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
                  Kontrol Merkezi
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                HoÅŸ geldiniz â€” Sistemde{' '}
                <span className="font-bold text-cyan-600 dark:text-cyan-400">{preparingCount}</span> sipariÅŸ hazÄ±rlanÄ±yor,{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{readyOrders}</span> teslime hazÄ±r,{' '}
                <span className="font-bold text-orange-600 dark:text-orange-400">{pendingOrders}</span> beklemede.
              </p>
            </div>

            {/* System Status */}
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-900/5">
              <div className="relative">
                <Activity className="w-5 h-5 text-emerald-500" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sistem Durumu</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Online & Aktif</p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================
            QUICK ACTIONS - Enhanced Cards
        ============================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { 
              href: "/admin/customers/new", 
              icon: <Plus className="w-5 h-5" />, 
              label: "Yeni MÃ¼ÅŸteri", 
              gradient: "from-purple-600 via-pink-600 to-rose-600",
              description: "MÃ¼ÅŸteri ekle"
            },
            { 
              href: "/admin/orders/new", 
              icon: <ShoppingBag className="w-5 h-5" />, 
              label: "Yeni SipariÅŸ", 
              gradient: "from-cyan-600 via-blue-600 to-indigo-600",
              description: "SipariÅŸ oluÅŸtur"
            },
            { 
              href: "/admin/orders", 
              icon: <ClipboardList className="w-5 h-5" />, 
              label: "SipariÅŸler", 
              gradient: "from-emerald-600 via-teal-600 to-green-600",
              description: "Listele"
            },
            { 
              href: "/admin/customers", 
              icon: <Search className="w-5 h-5" />, 
              label: "MÃ¼ÅŸteri Ara", 
              gradient: "from-orange-600 via-amber-600 to-yellow-600",
              description: "HÄ±zlÄ± arama"
            },
          ].map((action, idx) => (
            <Link prefetch={false} key={action.label}
              href={action.href}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 hover:shadow-2xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${action.gradient}`}></div>
              
              {/* Content */}
              <div className="relative flex flex-col items-center gap-3 text-center">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 text-white shadow-lg`}>
                  {action.icon}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white group-hover:text-white transition-colors text-sm sm:text-base">
                    {action.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-white/80 transition-colors mt-1">
                    {action.description}
                  </p>
                </div>
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          ))}
        </div>

        {/* ============================================
            STATS GRID - Premium Glass Cards
        ============================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <Link prefetch={false} key={stat.label}
              href={stat.href}
              className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${stat.gradient}`}></div>
              
              {/* Glow effect */}
              <div className={`absolute -inset-1 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br ${stat.gradient} blur-xl -z-10`}></div>

              {/* Content */}
              <div className="relative space-y-4">
                {/* Icon & Label */}
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${stat.gradient} text-white opacity-0 group-hover:opacity-100 transition-opacity`}>
                    GÃ¶rÃ¼ntÃ¼le â†’
                  </div>
                </div>

                {/* Value */}
                <div>
                  <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white group-hover:text-white transition-colors leading-none">
                    {stat.value}
                  </p>
                </div>

                {/* Label */}
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-white/90 transition-colors">
                    {stat.label}
                  </p>
                </div>

                {/* Change indicator */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 group-hover:border-white/20">
                  <div className="flex items-center gap-1">
                    {stat.change.includes('+') ? (
                      <ArrowUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
                    ) : stat.change.includes('-') ? (
                      <ArrowDown className="w-3 h-3 text-red-600 dark:text-red-400 group-hover:text-white" />
                    ) : (
                      <Activity className="w-3 h-3 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                    )}
                    <span className={`text-xs font-bold ${
                      stat.change.includes('+') 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : stat.change.includes('-')
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-blue-600 dark:text-blue-400'
                    } group-hover:text-white`}>
                      {stat.change}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-white/70">
                    {stat.changeLabel}
                  </span>
                </div>
              </div>

              {/* Corner decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          ))}
        </div>

        {/* ============================================
            ORDER STATUS OVERVIEW - New Section
        ============================================ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Bekleyen",
              value: pendingOrders,
              icon: <Clock className="w-5 h-5" />,
              gradient: "from-orange-500 to-amber-500",
              href: "/admin/orders?status=PENDING"
            },
            {
              label: "HazÄ±rlanÄ±yor",
              value: preparingCount,
              icon: <Package className="w-5 h-5" />,
              gradient: "from-blue-500 to-cyan-500",
              href: "/admin/orders?status=PREPARING"
            },
            {
              label: "Teslime HazÄ±r",
              value: readyOrders,
              icon: <CheckCircle className="w-5 h-5" />,
              gradient: "from-emerald-500 to-teal-500",
              href: "/admin/orders?status=READY"
            },
            {
              label: "Teslim Edildi",
              value: deliveredCount,
              icon: <Box className="w-5 h-5" />,
              gradient: "from-slate-500 to-slate-600",
              href: "/admin/orders?status=DELIVERED"
            },
          ].map((status, idx) => (
            <Link prefetch={false} key={status.label}
              href={status.href}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${status.gradient}`}></div>
              <div className="relative flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {status.label}
                  </p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">
                    {status.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${status.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  {status.icon}
                </div>
              </div>
            </Link>
          ))}
        </div>

      {/* ============================================
          PENDING VERIFICATIONS - Alert Style
      ============================================ */}
      {pendingVerifications.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20 border-2 border-orange-200 dark:border-orange-800 p-6 sm:p-8">
          {/* Alert icon */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-2xl"></div>
          
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Bekleyen DoÄŸrulamalar
                  </h2>
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-semibold">
                    {pendingVerifications.length} reÃ§ete onay bekliyor
                  </p>
                </div>
              </div>
              <Link prefetch={false} href="/admin/verifications"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
              >
                <Eye className="w-4 h-4" />
                TÃ¼mÃ¼nÃ¼ GÃ¶r ({pendingVerifications.length})
              </Link>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-orange-200 dark:border-orange-800 overflow-hidden shadow-lg">
              <PendingVerificationsList 
                initialPrescriptions={pendingVerifications.slice(0, 3).map((rx) => ({
                  id: rx.id,
                  customerId: rx.customerId,
                  customer: {
                    firstName: rx.customer?.firstName || "Bilinmeyen",
                    lastName: rx.customer?.lastName || "MÃ¼ÅŸteri",
                    phone: rx.customer?.phone || "-",
                  },
                  farRightSph: rx.farRightSph,
                  farRightCyl: rx.farRightCyl,
                  farRightAx: rx.farRightAx,
                  farLeftSph: rx.farLeftSph,
                  farLeftCyl: rx.farLeftCyl,
                  farLeftAx: rx.farLeftAx,
                  pdRight: rx.pdRight,
                  pdLeft: rx.pdLeft,
                  pdTotal: rx.pdTotal,
                  phRight: rx.phRight,
                  phLeft: rx.phLeft,
                  lensType: rx.lensType,
                  doctorName: rx.doctorName,
                  hospitalName: rx.hospitalName,
                  notes: rx.notes,
                  createdAt: rx.createdAt.toISOString(),
                }))} 
              />
            </div>

            {/* Mobile view button */}
            <Link prefetch={false} href="/admin/verifications"
              className="sm:hidden mt-4 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:shadow-xl transition-all w-full"
            >
              <Eye className="w-4 h-4" />
              TÃ¼m DoÄŸrulamalarÄ± GÃ¶r ({pendingVerifications.length})
            </Link>
          </div>
        </div>
      )}

      {/* ============================================
          CHARTS SECTION - Side by Side
      ============================================ */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Financial Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Finansal Grafik</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Gelir takibi</p>
              </div>
            </div>
            <Link prefetch={false} 
              href="/admin/orders"
              className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              Detaylar â†’
            </Link>
          </div>
          <FinancialChart 
            orders={chartOrders.map(o => ({
              ...o,
              createdAt: o.createdAt.toISOString()
            }))} 
          />
        </div>

        {/* Customer Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">MÃ¼ÅŸteri GrafiÄŸi</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">BÃ¼yÃ¼me analizi</p>
              </div>
            </div>
            <Link prefetch={false} 
              href="/admin/customers"
              className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              Detaylar â†’
            </Link>
          </div>
          <CustomerChart 
            customers={chartCustomers.map(c => ({
              ...c,
              createdAt: c.createdAt.toISOString()
            }))}
          />
        </div>
      </div>

      {/* ============================================
          RECENT ORDERS - Modern Table Design
      ============================================ */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
        <div className="px-6 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Son SipariÅŸler
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                En son {recentOrders.length} sipariÅŸ
              </p>
            </div>
          </div>
          <Link prefetch={false} 
            href="/admin/orders" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all text-sm"
          >
            TÃ¼mÃ¼nÃ¼ GÃ¶r
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-12 sm:p-20 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-6">
              <Box className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              HenÃ¼z sipariÅŸ yok
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 max-w-md">
              Sisteminize henÃ¼z sipariÅŸ eklenmemiÅŸ. Ä°lk sipariÅŸi oluÅŸturmak iÃ§in bir mÃ¼ÅŸteri ekleyin.
            </p>
            <Link prefetch={false} 
              href="/admin/customers/new" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/30 transition-all"
            >
              <Plus className="w-5 h-5" />
              Ä°lk MÃ¼ÅŸteriyi Ekle
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {recentOrders.map((order, idx) => {
              const STATUS_CONFIG = {
                PENDING:   { label: "Yeni SipariÅŸ", gradient: "from-orange-500 to-amber-500", text: "text-orange-600 dark:text-orange-400" },
                PREPARING: { label: "HazÄ±rlanÄ±yor", gradient: "from-blue-500 to-cyan-500", text: "text-blue-600 dark:text-blue-400" },
                READY:     { label: "Teslime HazÄ±r", gradient: "from-emerald-500 to-teal-500", text: "text-emerald-600 dark:text-emerald-400" },
                DELIVERED: { label: "Teslim Edildi", gradient: "from-slate-500 to-slate-600", text: "text-slate-600 dark:text-slate-400" },
              };
              
              const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
              
              return (
                <Link prefetch={false} key={order.id}
                  href={order.customerId ? `/admin/customers/${order.customerId}` : "#"}
                  className="group px-6 sm:px-8 py-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0 font-black text-white text-lg shadow-lg`}>
                      {order.customer?.firstName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    
                    {/* Customer Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                        {order.customer?.firstName || "Bilinmeyen"} {order.customer?.lastName || "MÃ¼ÅŸteri"}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {order.customer?.phone || "-"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status & Price */}
                  <div className="flex items-center gap-3 sm:gap-4 justify-between sm:justify-end">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${cfg.text} bg-gradient-to-r ${cfg.gradient} bg-opacity-10 border-current/20`}>
                      {order.status === 'READY' && <CheckCircle className="w-3 h-3" />}
                      {order.status === 'PREPARING' && <Clock className="w-3 h-3" />}
                      {order.status === 'PENDING' && <AlertCircle className="w-3 h-3" />}
                      {cfg.label}
                    </span>
                    
                    {/* Price */}
                    {order.totalPrice && (
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">
                          {order.totalPrice.toLocaleString("tr-TR")} â‚º
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Toplam
                        </p>
                      </div>
                    )}
                    
                    {/* Arrow */}
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
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

