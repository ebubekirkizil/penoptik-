"use client";

import React, { useState } from "react";
import { Lock, Box, CheckCircle2, LayoutDashboard, Settings, Users, LineChart, Package, Globe } from "lucide-react";

export function AdminDemo() {
  const [activeTab, setActiveTab] = useState(0);

  const mockData = [
    {
      ciro: "₺142.500",
      siparis: "1,204",
      api: "84.2K/sn",
      chart: [40, 60, 30, 80, 45, 90, 55, 100, 75, 85],
    },
    {
      ciro: "₺95.200",
      siparis: "842",
      api: "62.1K/sn",
      chart: [60, 40, 80, 50, 90, 30, 70, 45, 100, 65],
    },
    {
      ciro: "₺310.000",
      siparis: "3,450",
      api: "142.5K/sn",
      chart: [80, 90, 100, 85, 95, 75, 100, 90, 85, 100],
    }
  ];

  const currentData = mockData[activeTab];

  return (
    <div className="w-full max-w-[1100px] mx-auto bg-white dark:bg-gray-50 dark:bg-[#0a0a0a] rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden font-sans relative flex flex-col h-[650px]">
      {/* Window Controls */}
      <div className="bg-gray-50 dark:bg-[#111111] border-b border-black/5 dark:border-white/5 flex items-center px-4 py-3 shrink-0 z-10">
        <div className="flex gap-2 mr-6">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
        </div>
        <div className="flex items-center gap-2 text-gray-400 dark:text-white/40 text-xs font-mono">
          <Lock className="w-3 h-3" />
          <span>console.sentientwire.com</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-64 border-r border-black/5 dark:border-white/5 bg-[#0d0d0d] p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible shrink-0 z-10">
          {[
            { icon: LayoutDashboard, label: "Genel Bakış" },
            { icon: Package, label: "Siparişler" },
            { icon: LineChart, label: "Finans Raporu" },
            { icon: Users, label: "Müşteriler" },
            { icon: Globe, label: "Entegrasyonlar" },
            { icon: Settings, label: "Ayarlar" },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all whitespace-nowrap md:whitespace-normal font-medium
                ${activeTab === i
                  ? "bg-white/10 text-gray-900 dark:text-white shadow-sm" 
                  : "text-gray-400 dark:text-white/40 hover:text-gray-900 dark:text-white hover:bg-white/5"}`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 bg-gradient-to-br from-[#0a0a0a] to-[#050505] overflow-hidden flex flex-col relative">
          
          {/* TAB 0: Genel Bakış */}
          {activeTab === 0 && (
            <div className="flex flex-col h-full animate-fade-in-up">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 shrink-0">
                <div className="bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-5 flex flex-col shadow-lg">
                  <span className="text-gray-400 dark:text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Günlük Ciro</span>
                  <span className="text-2xl font-black text-emerald-400">₺142.500</span>
                </div>
                <div className="bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-5 flex flex-col shadow-lg">
                  <span className="text-gray-400 dark:text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Bekleyen Sipariş</span>
                  <span className="text-2xl font-black text-blue-400">1,204</span>
                </div>
                <div className="bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-5 flex flex-col shadow-lg">
                  <span className="text-gray-400 dark:text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">API İstekleri</span>
                  <span className="text-2xl font-black text-purple-400">84.2K/sn</span>
                </div>
              </div>

              <div className="bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-6 flex-1 mb-6 flex items-end justify-between gap-2 shadow-lg relative group">
                <div className="absolute top-4 left-4 text-gray-400 dark:text-white/30 text-xs font-semibold">Trafik Analizi</div>
                {[40, 60, 30, 80, 45, 90, 55, 100, 75, 85].map((h, i) => (
                  <div key={i} className="w-full bg-blue-500/20 hover:bg-blue-500/40 rounded-t-md transition-all duration-300 border-t border-blue-400/50" style={{ height: `${h}%` }}></div>
                ))}
              </div>

              <div className="bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-4 shrink-0 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/5">
                    <Box className="w-5 h-5 text-gray-500 dark:text-white/50" />
                  </div>
                  <div>
                    <div className="w-32 h-2 rounded-full bg-white/20 mb-2"></div>
                    <div className="w-20 h-1.5 rounded-full bg-white/10"></div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Sistem Aktif</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Siparişler */}
          {activeTab === 1 && (
            <div className="flex flex-col h-full animate-fade-in-up">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <h3 className="text-gray-900 dark:text-white font-medium">Son Siparişler</h3>
                <div className="bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-600 dark:text-white/60">Filtrele</div>
              </div>
              <div className="flex-1 bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-1 overflow-hidden flex flex-col">
                <div className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-black/5 dark:border-white/5 text-xs font-semibold text-gray-400 dark:text-white/40 uppercase">
                  <span>Sipariş ID</span>
                  <span>Müşteri</span>
                  <span>Tutar</span>
                  <span>Durum</span>
                </div>
                <div className="flex-1 overflow-hidden flex flex-col">
                  {[
                    { id: "#SW-9021", name: "Ahmet Yılmaz", price: "₺1,250", status: "Hazırlanıyor", color: "blue" },
                    { id: "#SW-9020", name: "Zeynep Kaya", price: "₺4,500", status: "Kargoya Verildi", color: "purple" },
                    { id: "#SW-9019", name: "Caner Demir", price: "₺850", status: "Teslim Edildi", color: "emerald" },
                    { id: "#SW-9018", name: "Elif Şahin", price: "₺2,100", status: "İptal Edildi", color: "red" },
                    { id: "#SW-9017", name: "Burak Çelik", price: "₺3,450", status: "Hazırlanıyor", color: "blue" },
                  ].map((order, i) => (
                    <div key={i} className="grid grid-cols-4 gap-4 px-4 py-4 border-b border-black/5 dark:border-white/5 text-sm text-gray-800 dark:text-white/80 hover:bg-white/5 items-center transition-colors">
                      <span className="font-mono text-gray-600 dark:text-white/60">{order.id}</span>
                      <span>{order.name}</span>
                      <span className="font-medium">{order.price}</span>
                      <div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase bg-${order.color}-500/10 text-${order.color}-400 border border-${order.color}-500/20`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Finans Raporu */}
          {activeTab === 2 && (
            <div className="flex flex-col h-full animate-fade-in-up">
               <div className="grid grid-cols-2 gap-4 mb-6 shrink-0">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 flex flex-col">
                    <span className="text-emerald-500/60 text-[10px] font-bold uppercase tracking-wider mb-2">Toplam Gelir (Aylık)</span>
                    <span className="text-3xl font-black text-emerald-400">₺1.240.000</span>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 flex flex-col">
                    <span className="text-red-500/60 text-[10px] font-bold uppercase tracking-wider mb-2">Toplam Gider (Aylık)</span>
                    <span className="text-3xl font-black text-red-400">₺420.500</span>
                  </div>
               </div>
               <div className="bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-6 flex-1 relative overflow-hidden flex items-end">
                  <div className="absolute top-4 left-4 text-gray-400 dark:text-white/30 text-xs font-semibold">Net Büyüme Eğrisi</div>
                  <svg className="w-full h-4/5" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M0,100 L0,50 C20,60 40,20 60,40 C80,60 90,10 100,20 L100,100 Z" fill="url(#grad1)" opacity="0.3" />
                    <path d="M0,50 C20,60 40,20 60,40 C80,60 90,10 100,20" fill="none" stroke="#3b82f6" strokeWidth="2" />
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
               </div>
            </div>
          )}

          {/* TAB 3: Müşteriler */}
          {activeTab === 3 && (
            <div className="flex flex-col h-full animate-fade-in-up">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4">
                {[1, 2, 3, 4, 5, 6].map((user) => (
                  <div key={user} className="bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center text-center hover:bg-white/[0.02] transition-colors">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 mb-3 p-0.5">
                      <div className="w-full h-full bg-[#121212] rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-500 dark:text-white/50" />
                      </div>
                    </div>
                    <div className="h-3 w-20 bg-white/20 rounded-full mb-2"></div>
                    <div className="h-2 w-12 bg-white/10 rounded-full mb-4"></div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">Aktif B2B</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Entegrasyonlar */}
          {activeTab === 4 && (
            <div className="flex flex-col h-full animate-fade-in-up space-y-4">
              <h3 className="text-gray-800 dark:text-white/80 font-medium mb-2 shrink-0">Bağlı Sistemler</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["Shopify API", "Trendyol Pazaryeri", "Hepsiburada", "Logo ERP", "Stripe Ödeme", "NetGSM SMS"].map((int, i) => (
                  <div key={i} className="bg-[#121212] border border-black/5 dark:border-white/5 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/5">
                        <Globe className="w-5 h-5 text-indigo-400" />
                      </div>
                      <span className="text-sm text-gray-800 dark:text-white/80 font-medium">{int}</span>
                    </div>
                    {/* Fake Toggle */}
                    <div className="w-10 h-5 bg-emerald-500/20 rounded-full border border-emerald-500/30 flex items-center px-0.5 cursor-pointer">
                      <div className="w-4 h-4 bg-emerald-400 rounded-full translate-x-5 shadow-sm"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Ayarlar */}
          {activeTab === 5 && (
            <div className="flex flex-col h-full animate-fade-in-up">
               <div className="bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-6 flex-1">
                  <h3 className="text-gray-900 dark:text-white font-medium mb-6 border-b border-black/5 dark:border-white/5 pb-4">Sistem Tercihleri</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white/90 font-medium mb-1">Gece Modu</div>
                        <div className="text-xs text-gray-400 dark:text-white/40">Arayüzü koyu temada kullanın.</div>
                      </div>
                      <div className="w-10 h-5 bg-blue-500/20 rounded-full border border-blue-500/30 flex items-center px-0.5 cursor-pointer">
                        <div className="w-4 h-4 bg-blue-400 rounded-full translate-x-5 shadow-sm"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white/90 font-medium mb-1">İki Aşamalı Doğrulama (2FA)</div>
                        <div className="text-xs text-gray-400 dark:text-white/40">Hesap güvenliği için SMS veya Authenticator.</div>
                      </div>
                      <div className="w-10 h-5 bg-white/5 rounded-full border border-black/10 dark:border-white/10 flex items-center px-0.5 cursor-pointer">
                        <div className="w-4 h-4 bg-white/30 rounded-full shadow-sm"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white/90 font-medium mb-1">Otomatik Yedekleme</div>
                        <div className="text-xs text-gray-400 dark:text-white/40">Veritabanı her gece saat 03:00'da yedeklensin.</div>
                      </div>
                      <div className="w-10 h-5 bg-emerald-500/20 rounded-full border border-emerald-500/30 flex items-center px-0.5 cursor-pointer">
                        <div className="w-4 h-4 bg-emerald-400 rounded-full translate-x-5 shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 pt-6 border-t border-black/5 dark:border-white/5 flex justify-end">
                    <div className="bg-white text-black px-6 py-2 rounded-lg font-medium text-sm hover:bg-white/90 cursor-pointer transition-colors">Kaydet</div>
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
