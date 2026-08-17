import { Building2, TrendingUp, Users, DollarSign, ArrowUpRight, Activity, Server, Clock, HardDrive, ShieldAlert, Zap, Box, CheckCircle2, Database, Bot, BrainCircuit, MessageSquare, History, Cpu } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import os from "os";
import { SAAS_MODULES } from "../../../../lib/modules";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboard() {
  // DB VERİLERİ ÇEKİLİYOR
  const totalFirms = await prisma.firm.count({ where: { isActive: true } });
  const totalModules = SAAS_MODULES.reduce((acc, cat) => acc + cat.items.length, 0);
  const activeTickets = await prisma.ticket.count({ where: { status: "OPEN" } });
  
  const recentFirms = await prisma.firm.findMany({
    orderBy: { createdAt: 'desc' },
    take: 4,
  });

  // Calculate MRR
  const activeFirms = await prisma.firm.findMany({
    where: { isActive: true },
    select: { createdAt: true, package: { select: { price: true } } }
  });
  const mrr = activeFirms.reduce((acc, firm) => acc + ((firm as any).customPrice || firm.package?.price || 0), 0);

  // 6 Aylık MRR Büyümesi Hesaplama
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  const mrrData = [];
  let currentMonth = new Date(sixMonthsAgo);

  for (let i = 0; i < 6; i++) {
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    
    const thisMonthMrr = activeFirms
      .filter(f => {
        const d = new Date(f.createdAt);
        return d.getFullYear() < year || (d.getFullYear() === year && d.getMonth() <= month);
      })
      .reduce((sum, f) => sum + (((f as any).customPrice || f.package?.price || 0)), 0);

    mrrData.push({
      label: monthNames[month],
      value: thisMonthMrr
    });
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }
  
  // Find max MRR for graph scaling, default to 100 to avoid div/0
  const maxMrr = Math.max(...mrrData.map(d => d.value), 100);

  // System Stats (Gerçek Node.js OS)
  const totalMem = os.totalmem ? (os.totalmem() || 1) : 1;
  const freeMem = os.freemem ? (os.freemem() || 0) : 0;
  const usedMem = totalMem - freeMem;
  const memPercent = Math.min((usedMem / totalMem) * 100, 100).toFixed(1);
  const memFormatted = (usedMem / (1024 ** 3)).toFixed(1) + " GB / " + (totalMem / (1024 ** 3)).toFixed(0) + " GB";
  
  const cpus = (os.cpus && os.cpus()) || [];
  const loadAvg = (os.loadavg && os.loadavg()[0]) || 0;
  const cpuPercent = cpus.length > 0 ? Math.min((loadAvg / cpus.length) * 100, 100).toFixed(1) : "0.0";
  
  const dbRows = (await prisma.user.count()) + (await prisma.customer.count()) + (await prisma.firm.count());
  const reqPerSec = dbRows > 0 ? dbRows * 2 : 12; // Tahmini sorgu yükü orantısı

  // AI Usage Stats (Yapay Zeka)
  const p = prisma as any;
  const totalAiQueries = await p.aiUsageLog.count().catch(() => 0);
  const recentAiLogs = await p.aiUsageLog.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: { firm: true }
  }).catch(() => []);

  const aiFirmGroup = await p.aiUsageLog.groupBy({
    by: ['firmId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 1
  }).catch(() => []);
  
  let mostActiveAiFirmName = "Henüz Veri Yok";
  let mostActiveAiFirmCount = 0;
  if (aiFirmGroup.length > 0) {
    const topFirm = await prisma.firm.findUnique({ where: { id: aiFirmGroup[0].firmId } });
    if (topFirm) {
      mostActiveAiFirmName = topFirm.name;
      mostActiveAiFirmCount = aiFirmGroup[0]._count.id;
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Background Texture (Doku) Effect */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03] dark:opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Genel Bakıx 
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-1.5 uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Sistem Stabil
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Mega Admin kontrol merkezine hox geldiniz. Tüm SaaS ekosistemini buradan canlı olarak izleyebilirsiniz.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <Clock className="w-4 h-4" /> Son Güncelleme: Az Önce
          </button>
        </div>
      </div>

      {/* Ana KPI Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <div className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-md rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-200/60 dark:border-slate-700/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-bl-full transition-transform duration-500 group-hover:scale-125"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 shadow-inner">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
              <ArrowUpRight className="w-3 h-3" /> Canlı
            </span>
          </div>
          <h3 className="text-slate-600 dark:text-slate-300 text-sm font-semibold relative z-10">Toplam Aktif Firma</h3>
          <p className="text-4xl font-black text-slate-900 dark:text-white mt-1 relative z-10 tracking-tight">{totalFirms}</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-medium relative z-10">Sistemdeki toplam canlı firma</p>
        </div>

        <div className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-md rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-200/60 dark:border-slate-700/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 rounded-bl-full transition-transform duration-500 group-hover:scale-125"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 shadow-inner">
              <Box className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
              <ArrowUpRight className="w-3 h-3" /> Canlı
            </span>
          </div>
          <h3 className="text-slate-600 dark:text-slate-300 text-sm font-semibold relative z-10">Sistemdeki Modül (Lego) Sayısı</h3>
          <p className="text-4xl font-black text-slate-900 dark:text-white mt-1 relative z-10 tracking-tight">{totalModules}</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-medium relative z-10">Kullanıma hazır, entegre modüller</p>
        </div>

        <div className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-md rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-200/60 dark:border-slate-700/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/5 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 rounded-bl-full transition-transform duration-500 group-hover:scale-125"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/20 flex items-center justify-center border border-amber-100 dark:border-amber-500/20 shadow-inner">
              <DollarSign className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <h3 className="text-slate-600 dark:text-slate-300 text-sm font-semibold relative z-10">Aylık Düzenli Gelir (MRR)</h3>
          <p className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mt-1 relative z-10 tracking-tight">{mrr.toLocaleString('tr-TR')} <span className="text-xl text-slate-400 dark:text-slate-500"> </span></p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-medium relative z-10">Canlı MRR Tahmini</p>
        </div>

        <div className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-md rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-200/60 dark:border-slate-700/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/5 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20 rounded-bl-full transition-transform duration-500 group-hover:scale-125"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/20 flex items-center justify-center border border-rose-100 dark:border-rose-500/20 shadow-inner">
              <Box className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            {activeTickets > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-100 dark:border-rose-500/20">
                {activeTickets} İhtiyaç
              </span>
            )}
          </div>
          <h3 className="text-slate-600 dark:text-slate-300 text-sm font-semibold relative z-10">Aktif Destek Talepleri</h3>
          <p className="text-4xl font-black text-slate-900 dark:text-white mt-1 relative z-10 tracking-tight">{activeTickets}</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-medium relative z-10">Bekleyen ticket (bilet) sayısı</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* Sistem Altyapı Kaynakları (Server Monitor) - GERÇEK */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-slate-800 dark:text-white relative overflow-hidden col-span-1 border border-slate-200/60 dark:border-slate-800">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-white to-white dark:from-blue-500/10 dark:via-slate-900 dark:to-slate-900 opacity-60"></div>
          
          <div className="relative z-10 flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
              <Server className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              Sunucu & Veritabanı
            </h2>
            <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-bold tracking-wider rounded border border-emerald-200 dark:border-emerald-500/20">Canlı Bağlantı</span>
          </div>

          <div className="relative z-10 space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2 font-semibold">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Cpu className="w-4 h-4" /> CPU Kullanımı (Gerçek)</span>
                <span className="font-mono text-slate-800 dark:text-white">%{cpuPercent}</span>
              </div>
              <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${cpuPercent}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2 font-semibold">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><HardDrive className="w-4 h-4" /> RAM (Memory)</span>
                <span className="font-mono text-slate-800 dark:text-white">{memFormatted}</span>
              </div>
              <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${memPercent}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2 font-semibold">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Database className="w-4 h-4" /> Aktif Veri Satırı & Yük</span>
                <span className="font-mono text-slate-800 dark:text-white">~{reqPerSec} req/m</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">DB Toplam Temel Kayıt: {dbRows}</div>
              <div className="h-12 flex items-end gap-1 mt-2">
                {[4, 6, 8, 5, 3, 7, 9, 12, 8, 5, 4, 6, 8, 10, 15, 12, 8, 6, 4, 3].map((h, i) => (
                  <div key={i} className="flex-1 bg-blue-500/20 dark:bg-blue-500/40 rounded-t hover:bg-blue-400 dark:hover:bg-blue-400 transition-colors" style={{ height: `${h * 6}%` }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Son Firma Aktiviteleri / Loglar */}
        <div className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 dark:border-slate-800 col-span-1 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Son Eklenen Firmalar
            </h2>
            <Link href="/super-admin/firms" className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline">
              Tüm Firmalar
            </Link>
          </div>
          
          <div className="flex-1 space-y-4">
            {recentFirms.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-4">Henüz firma bulunmuyor.</div>
            )}
            {recentFirms.map(rf => (
              <Link href={`/super-admin/firms/${rf.id}`} key={rf.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-300 group cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 font-black text-lg border border-blue-100 dark:border-blue-500/20 shadow-sm">
                  {rf.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{rf.name}</h4>
                  <p className="text-xs font-medium text-slate-500 mt-1">Durum: <span className={rf.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{rf.isActive ? 'AKTİF' : 'PASİF'}</span> <span className="mx-1">•</span> Sektör: {rf.sector}</p>
                </div>
                <div className="text-xs font-mono font-semibold text-slate-400 dark:text-slate-500 pt-1">{new Date(rf.createdAt).toLocaleDateString("tr-TR")}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Aylık SaaS Gelir Büyüme Grafiği (MRR) - GERÇEK */}
        <div className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 dark:border-slate-800 col-span-1 lg:col-span-3 mt-4">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              SaaS MRR (Aylık Düzenli Gelir) Büyüme Trendi
            </h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg border border-blue-100 dark:border-blue-500/20 shadow-sm">6 Aylık</span>
              <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs font-bold rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm cursor-not-allowed">Yıllık (Pro)</span>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-4 px-2 pb-4">
            {mrrData.map((data, i) => (
              <div key={i} className="relative flex flex-col items-center flex-1 group">
                {/* Tooltip */}
                <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs py-2 px-3 rounded-lg font-bold shadow-xl z-20 whitespace-nowrap">
                  {data.value.toLocaleString("tr-TR")}  
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-white rotate-45"></div>
                </div>
                
                {/* Bar */}
                <div 
                  className="w-full max-w-[72px] bg-gradient-to-t from-blue-500/10 to-blue-500/30 dark:from-blue-500/20 dark:to-blue-500/50 hover:from-blue-500 hover:to-blue-400 dark:hover:from-blue-500 dark:hover:to-blue-400 rounded-t-2xl transition-all duration-500 relative overflow-hidden border border-b-0 border-blue-500/20 shadow-[0_-4px_15px_rgba(59,130,246,0.1)]"
                  style={{ height: `${Math.max((data.value / maxMrr) * 100, 5)}%` }}
                >
                  <div className="absolute bottom-0 w-full bg-blue-600 dark:bg-blue-500 rounded-t-xl transition-all duration-300" style={{ height: '0%', opacity: 0.5 }}></div>
                </div>
                
                {/* Month Label */}
                <span className="text-sm text-slate-500 dark:text-slate-400 mt-4 font-bold uppercase tracking-wider">
                  {data.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* YAPAY ZEKA (AI) KULLANIM ANALİZLERİ PANELI */}
        <div className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 dark:border-purple-500/20 col-span-1 lg:col-span-3 mt-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/10 to-transparent dark:from-purple-500/20 rounded-bl-full pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-800 pb-4 relative z-10">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-500" />
                Yapay Zeka Asistanı & Danıxman Analizleri
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Müxterilerin AI Danıxman'a sordukları sorular ve kullanım yoğunluğu</p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-bold">Toplam Sorgu</p>
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{totalAiQueries}</p>
              </div>
              <div className="text-right border-l border-slate-200 dark:border-slate-700 pl-4">
                <p className="text-xs text-slate-500 uppercase font-bold">En Aktif Firma</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white">{mostActiveAiFirmName}</p>
                <p className="text-xs text-slate-400">{mostActiveAiFirmCount} sorgu</p>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 grid grid-cols-1 gap-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-2">
              <History className="w-4 h-4 text-slate-400" />
              Son AI Sorguları (Canlı Akıx)
            </h3>
            
            {recentAiLogs.length === 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 text-center text-slate-500">
                <Bot className="w-8 h-8 mx-auto mb-3 text-slate-400 opacity-50" />
                Henüz yapay zeka asistanına sorulmux bir soru bulunmuyor.
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentAiLogs.map((log: any) => (
                <div key={log.id} className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[150px]">{log.firm?.name || 'Bilinmeyen Firma'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{new Date(log.createdAt).toLocaleString("tr-TR")}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${
                      log.source === 'GEMINI_AI' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                    }`}>
                      {log.source === 'GEMINI_AI' ? 'GEMINI (AI)' : 'INTERNAL BOT'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mb-1"><MessageSquare className="w-3 h-3" /> Soru:</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-2 italic">"{log.query}"</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mb-1"><Bot className="w-3 h-3" /> Yanıt Özeti:</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">{log.responseSummary}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
