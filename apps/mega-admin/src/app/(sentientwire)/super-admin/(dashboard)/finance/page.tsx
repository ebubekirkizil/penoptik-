import { prisma } from "@/lib/prisma";
import {
  TrendingUp, TrendingDown, DollarSign,
  Server, Box, Megaphone, Users, Briefcase, Building2,
  Plus, Trash2, CalendarDays, ArrowUpRight, ArrowDownRight,
  Target, Percent, BadgeCheck, AlertCircle, FileText, Calculator,
  Layers, CheckCircle2, Clock
} from "lucide-react";
import { addSystemTransaction, deleteSystemTransaction } from "./actions";
import Link from "next/link";
import { FinanceDashboardClient } from "./FinanceDashboardClient";

export const dynamic = "force-dynamic";

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const CAT_META: Record<string, { label: string; color: string; bg: string }> = {
  SERVER_COST:  { label: "Sunucu & Altyapı", color: "text-blue-500",   bg: "bg-blue-500/10" },
  LICENSE:      { label: "Yazılım & Lisans",  color: "text-violet-500", bg: "bg-violet-500/10" },
  SALARY:       { label: "Personel Maaxı",   color: "text-amber-500",  bg: "bg-amber-500/10" },
  MARKETING:    { label: "Pazarlama & Reklam", color: "text-pink-500",  bg: "bg-pink-500/10" },
  SUBSCRIPTION: { label: "Abonelik Geliri",  color: "text-emerald-500", bg: "bg-emerald-500/10" },
  OTHER:        { label: "Diğer",            color: "text-slate-400",   bg: "bg-slate-500/10" },
};

function CategoryIcon({ cat }: { cat: string }) {
  const cls = "w-4 h-4";
  switch (cat) {
    case "SERVER_COST": return <Server className={cls} />;
    case "LICENSE":     return <Box className={cls} />;
    case "SALARY":      return <Users className={cls} />;
    case "MARKETING":   return <Megaphone className={cls} />;
    case "SUBSCRIPTION":return <Building2 className={cls} />;
    default:            return <Briefcase className={cls} />;
  }
}

// Aylık breakdown (son 6 ay) oluxturur
function buildMonthlyTrend(transactions: { type: string; amount: number; date: Date }[], mrrPerMonth: number) {
  const months: { label: string; income: number; expense: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("tr-TR", { month: "short", year: "2-digit" });
    const txInMonth = transactions.filter(t => {
      const td = new Date(t.date);
      return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth();
    });
    const income  = mrrPerMonth + txInMonth.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
    const expense = txInMonth.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
    months.push({ label, income, expense });
  }
  return months;
}

export default async function FinancePage() {
  // ── Veri ────────────────────────────────────────────────────────────────
  // TODO: Implement Firm customPrice and package fields in Prisma
  const activeFirms: any[] = [];

  const mrrIncome = activeFirms.reduce(
    (acc, f) => acc + (f.customPrice ?? f.package?.price ?? 0), 0
  );

  // TODO: Implement SystemFinanceTransaction model in Prisma
  const systemTx: any[] = [];

  const manualIncome  = systemTx.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = systemTx.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const totalIncome   = mrrIncome + manualIncome;
  const netProfit     = totalIncome - totalExpenses;
  const profitMargin  = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;
  const isProfitable  = netProfit >= 0;
  
  // Basit bir tahmini vergi hesabı (Örn: %20 Kurumlar Vergisi)
  const estimatedTax = isProfitable ? netProfit * 0.20 : 0;

  // Kategori bazında gider dağılımı
  const expenseByCategory: Record<string, number> = {};
  systemTx.filter(t => t.type === "EXPENSE").forEach(t => {
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
  });

  // Aylık trend
  const monthlyTrend = buildMonthlyTrend(
    systemTx.map(t => ({ type: t.type, amount: t.amount, date: new Date(t.date) })),
    mrrIncome,
  );
  const maxTrend = Math.max(...monthlyTrend.map(m => Math.max(m.income, m.expense)), 1);

  // Son 3 ve önceki 3 ay karxılaxtırması
  const last3  = monthlyTrend.slice(3).reduce((s, m) => s + m.income, 0);
  const prev3  = monthlyTrend.slice(0, 3).reduce((s, m) => s + m.income, 0);
  const mrrGrowth = prev3 > 0 ? Math.round(((last3 - prev3) / prev3) * 100) : 0;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

      {/* ── Baxlık ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              SentientWire Finans Merkezi
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
              Tüm KOBİ modül abonelikleri, gelir/gider akıxı ve vergi yükümlülükleri kontrol paneli.
            </p>
          </div>
        </div>
        <div className={`flex flex-col items-end px-5 py-3 rounded-2xl border ${
          isProfitable
            ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
            : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
        }`}>
          <div className="flex items-center gap-2 text-sm font-black">
            {isProfitable ? <BadgeCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {isProfitable ? "Sistem Kârlı Durumda" : "Sistem Zarar Durumunda"}
          </div>
          <span className="text-xs font-medium opacity-80 mt-1">Gerçek zamanlı analiz</span>
        </div>
      </div>

      {/* ── KPI Kartları ────────────────────────────────────────────────── */}
      <FinanceDashboardClient 
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netProfit={netProfit}
        estimatedTax={estimatedTax}
        mrrIncome={mrrIncome}
        manualIncome={manualIncome}
        isProfitable={isProfitable}
        activeFirms={activeFirms}
      />

      {/* ── İki Sütunlu Alt Yapı ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* SOL SÜTUN: Grafik & Ekleme Formu */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* İxlem Ekleme Formu */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-800/20 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" /> Yeni Fatura / Fix Ekle
              </h2>
              <form action={addSystemTransaction} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">İxlem Yönü</label>
                    <select name="type" className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all text-slate-700 dark:text-slate-200 cursor-pointer appearance-none">
                      <option value="EXPENSE">Gider (Çıkıx)</option>
                      <option value="INCOME">Gelir (Girix)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</label>
                    <select name="category" className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all text-slate-700 dark:text-slate-200 cursor-pointer appearance-none">
                      <option value="SERVER_COST">Altyapı</option>
                      <option value="LICENSE">Yazılım</option>
                      <option value="SALARY">Personel</option>
                      <option value="MARKETING">Reklam</option>
                      <option value="SUBSCRIPTION">Abonelik</option>
                      <option value="OTHER">Diğer</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tutar ( )</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                    </div>
                    <input type="number" step="0.01" name="amount" required placeholder="0.00"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-4 py-3 text-base font-black outline-none transition-all text-slate-900 dark:text-white" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Açıklama / Fatura Baxlığı</label>
                  <input type="text" name="description" placeholder="Örn: Vercel Cloud Ödemesi"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all text-slate-900 dark:text-white" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tarih</label>
                  <input type="date" name="date" required defaultValue={today}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all text-slate-700 dark:text-slate-200 cursor-pointer" />
                </div>
                
                <button type="submit" className="w-full py-3.5 bg-slate-900 hover:bg-blue-600 dark:bg-white dark:hover:bg-blue-500 dark:text-slate-900 text-white rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2 mt-4 group">
                  <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" /> Makbuzu Kaydet
                </button>
              </form>
            </div>
          </div>

          {/* Aylık Trend Grafiği (SVG) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">Gelir / Gider Trendi</h2>
                <p className="text-xs font-medium text-slate-400 mt-1">Son 6 aylık performans</p>
              </div>
              <div className="flex flex-col gap-1.5 text-[10px] font-black uppercase tracking-wider">
                <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />Gelir</span>
                <span className="flex items-center gap-2 text-rose-600 dark:text-rose-400"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />Gider</span>
              </div>
            </div>
            
            <div className="flex items-end gap-2 h-44 mt-4">
              {monthlyTrend.map((m, i) => {
                const incPct = maxTrend > 0 ? (m.income / maxTrend) * 100 : 0;
                const expPct = maxTrend > 0 ? (m.expense / maxTrend) * 100 : 0;
                const isLast = i === monthlyTrend.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar relative cursor-crosshair">
                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      {/* Gelir bar */}
                      <div
                        className={`w-1/2 max-w-[12px] rounded-t-full transition-all duration-700 ${isLast ? "bg-emerald-500" : "bg-emerald-500/40 group-hover/bar:bg-emerald-500/70"}`}
                        style={{ height: `${Math.max(4, incPct)}%` }}
                      />
                      {/* Gider bar */}
                      <div
                        className={`w-1/2 max-w-[12px] rounded-t-full transition-all duration-700 ${isLast ? "bg-rose-500" : "bg-rose-500/40 group-hover/bar:bg-rose-500/70"}`}
                        style={{ height: `${Math.max(expPct > 0 ? 4 : 0, expPct)}%` }}
                      />
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${isLast ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>{m.label}</span>
                    
                    {/* Tooltip */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-xl p-3 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-2xl border border-slate-700/50 scale-95 group-hover/bar:scale-100">
                      <div className="flex justify-between gap-4 mb-1"><span className="text-slate-400">Gelir:</span><span className="font-bold text-emerald-400">{fmt(m.income)}  </span></div>
                      <div className="flex justify-between gap-4 mb-2"><span className="text-slate-400">Gider:</span><span className="font-bold text-rose-400">{fmt(m.expense)}  </span></div>
                      <div className={`flex justify-between gap-4 pt-2 border-t border-slate-700 font-black ${m.income - m.expense >= 0 ? "text-white" : "text-rose-400"}`}>
                        <span>Net:</span><span>{fmt(m.income - m.expense)}  </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SAĞ SÜTUN: Gelixmix Tablo & Liste */}
        <div className="xl:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" /> Detaylı Fatura & Fix Kayıtları
                </h2>
                <p className="text-xs font-medium text-slate-500 mt-1">Sistemdeki tüm KOBİ ödemeleri ve manuel harcamalar.</p>
              </div>
              <div className="flex items-center gap-2">
                 <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                   Toplam {systemTx.length} Kayıt
                 </span>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="py-4 pl-6">İxlem & Kategori</th>
                    <th className="py-4">Tarih</th>
                    <th className="py-4">Durum</th>
                    <th className="py-4 text-right">Tutar</th>
                    <th className="py-4 text-right pr-6">İxlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {systemTx.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <FileText className="w-10 h-10 mb-3 opacity-20" />
                          <p className="text-sm font-bold">Kayıt Bulunamadı</p>
                          <p className="text-xs mt-1">Sisteme henüz bir gelir veya gider girilmemix.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {systemTx.map((tx) => {
                    const meta = CAT_META[tx.category] ?? CAT_META["OTHER"];
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="py-4 pl-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${tx.type === "INCOME" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : `${meta.bg} ${meta.color}`}`}>
                              <CategoryIcon cat={tx.category} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tx.description || meta.label}</p>
                              <p className="text-[11px] font-bold text-slate-400 mt-0.5">{meta.label}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-xs font-bold text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 opacity-50" />
                            {new Date(tx.date).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="py-4">
                           <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
                             <CheckCircle2 className="w-3 h-3" /> İxlendi
                           </div>
                        </td>
                        <td className="py-4 text-right">
                          <span className={`text-base font-black ${tx.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                            {tx.type === "INCOME" ? "+" : "−"}{fmt(tx.amount)}  
                          </span>
                        </td>
                        <td className="py-4 text-right pr-6">
                          <form action={async () => {
                            "use server";
                            await deleteSystemTransaction(tx.id);
                          }}>
                            <button type="submit" className="p-2.5 text-slate-400 hover:text-white hover:bg-rose-500 rounded-xl transition-all shadow-sm opacity-0 group-hover:opacity-100 hover:shadow-rose-500/30" title="Kayıttan Sil">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center text-xs font-medium text-slate-500">
               * Yukarıdaki liste gerçek zamanlı olarak modül abonelikleri ve manuel girixlerden beslenmektedir.
            </div>
          </div>
          
        </div>
      </div>

    </div>
  );
}
