"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown, Briefcase, Calculator, Building2, DollarSign, ArrowUpRight, ArrowDownRight, X, Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const fmt = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

interface Props {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  estimatedTax: number;
  mrrIncome: number;
  manualIncome: number;
  isProfitable: boolean;
  activeFirms: { name: string; customPrice: number | null; package: { price: number; name: string } | null }[];
}

export function FinanceDashboardClient({
  totalIncome,
  totalExpenses,
  netProfit,
  estimatedTax,
  mrrIncome,
  manualIncome,
  isProfitable,
  activeFirms
}: Props) {
  const [activeModal, setActiveModal] = useState<"MRR" | "TAX" | null>(null);
  
  // Dynamic settings state
  const [taxRate, setTaxRate] = useState(20);
  const dynamicTax = isProfitable ? (netProfit * taxRate) / 100 : 0;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        
        {/* Toplam Gelir Kartı (Tıklanabilir) */}
        <div 
          onClick={() => setActiveModal("MRR")}
          className="col-span-1 md:col-span-2 xl:col-span-1 bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group hover:shadow-blue-500/40 transition-all duration-500 cursor-pointer"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNzAiIGN5PSIzMCIgcj0iODAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-5 border border-white/10 shadow-inner group-hover:bg-white/30 transition-colors">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity">
                  Detayları Gör
                </div>
              </div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Aylık Toplam Gelir (MRR + Manuel)</p>
              <p className="text-4xl font-black mt-2 tracking-tight">{fmt(totalIncome)}  </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/20 text-sm text-blue-50 space-y-2">
              <div className="flex justify-between items-center group-hover:translate-x-1 transition-transform">
                <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 opacity-70"/> KOBİ Modül Abonelikleri:</span>
                <b className="text-white">{fmt(mrrIncome)}  </b>
              </div>
              <div className="flex justify-between items-center group-hover:translate-x-1 transition-transform delay-75">
                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 opacity-70"/> Ek / Manuel Gelirler:</span>
                <b className="text-white">{fmt(manualIncome)}  </b>
              </div>
            </div>
          </div>
        </div>

        {/* Toplam Gider */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-rose-300 dark:hover:border-rose-500/50 transition-colors duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-500/10 to-transparent rounded-bl-full transition-transform duration-700 group-hover:scale-125" />
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-5 text-rose-500 border border-rose-100 dark:border-rose-500/20 group-hover:rotate-12 transition-transform">
            <TrendingDown className="w-6 h-6" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Sistem Giderleri</p>
          <p className="text-3xl font-black mt-2 text-rose-600 dark:text-rose-400 tracking-tight">{fmt(totalExpenses)}  </p>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm font-medium text-slate-500">
            Otomatik olarak listelenen tüm giderlerin toplamı.
          </div>
        </div>

        {/* Net Kâr */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full transition-transform duration-700 group-hover:scale-125" />
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border group-hover:scale-110 transition-transform ${isProfitable ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border-emerald-100 dark:border-emerald-500/20" : "bg-rose-50 dark:bg-rose-500/10 text-rose-500 border-rose-100 dark:border-rose-500/20"}`}>
            <Briefcase className="w-6 h-6" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Net Kâr / Zarar</p>
          <p className={`text-3xl font-black mt-2 tracking-tight ${isProfitable ? "text-slate-900 dark:text-white" : "text-rose-500"}`}>
            {fmt(netProfit)}  
          </p>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-sm font-bold">
            {isProfitable
              ? <><ArrowUpRight className="w-5 h-5 text-emerald-500" /><span className="text-emerald-500">Sürdürülebilir Büyüme</span></>
              : <><ArrowDownRight className="w-5 h-5 text-rose-500" /><span className="text-rose-500">Negatif Nakit Akıxı</span></>}
          </div>
        </div>

        {/* Tahmini Vergi (Tıklanabilir) */}
        <div 
          onClick={() => setActiveModal("TAX")}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-300 dark:hover:border-amber-500/50 transition-colors duration-500 cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full transition-transform duration-700 group-hover:scale-125" />
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-5 text-amber-500 border border-amber-100 dark:border-amber-500/20 group-hover:-rotate-12 transition-transform">
              <Calculator className="w-6 h-6" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Settings2 className="w-4 h-4 text-slate-500" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Tahmini Vergi Yükümlülüğü</p>
          <p className="text-3xl font-black mt-2 text-amber-600 dark:text-amber-400 tracking-tight">{fmt(dynamicTax)}  </p>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
             <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
               <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full animate-pulse transition-all" style={{ width: `${taxRate}%` }} />
             </div>
             <span className="text-xs font-bold text-slate-400">%{taxRate}</span>
          </div>
        </div>

      </div>

      {/* MODALS */}
      <AnimatePresence>
        {activeModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999]" 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-[1000] overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {activeModal === "MRR" ? "MRR Detayları (Müxteri Bazlı)" : "Vergi Ayarları"}
                </h2>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto">
                {activeModal === "MRR" && (
                  <div className="space-y-4">
                    {activeFirms.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-4">Aktif müxteri bulunmamaktadır.</p>
                    ) : (
                      <div className="space-y-3">
                        {activeFirms.map((f, i) => {
                          const income = f.customPrice ?? f.package?.price ?? 0;
                          return (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                  {f.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white">{f.name}</p>
                                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{f.package?.name || "Özel Plan"}</p>
                                </div>
                              </div>
                              <p className="font-black text-emerald-600 dark:text-emerald-400">{fmt(income)}  </p>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeModal === "TAX" && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Vergi Oranı (%)</label>
                      <input 
                        type="range" 
                        min="0" max="50" step="1" 
                        value={taxRate} 
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        className="w-full accent-amber-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs font-bold text-slate-500 mt-3">
                        <span>%0</span>
                        <span className="text-amber-500 text-base">% {taxRate}</span>
                        <span>%50</span>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl flex flex-col gap-1">
                      <span className="text-xs font-bold text-amber-600/70 dark:text-amber-400/70">Hesaplanan Tahmini Vergi</span>
                      <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{fmt(dynamicTax)}  </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
