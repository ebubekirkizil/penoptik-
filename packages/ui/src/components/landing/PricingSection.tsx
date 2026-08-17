"use client";

import React, { useState } from "react";
import { CheckCircle2, X, Zap, Shield, Database, ArrowRight } from "lucide-react";
import Link from "next/link";

export function PricingSection() {
  const [view, setView] = useState<"sade" | "karsilastirma">("sade");

  const simplePackages = [
    {
      name: "Başlangıç",
      price: "₺950",
      desc: "Yeni kurulan işletmeler için ideal paket.",
      features: ["5.000 Cari Kaydı", "Aylık 1.000 Sipariş", "1 Şube / 1 Depo", "3 Kullanıcı"],
      button: "Hemen Başla",
      popular: false
    },
    {
      name: "Profesyonel",
      price: "₺2.450",
      desc: "Büyüyen ve entegrasyon arayan KOBİ'ler.",
      features: ["Sınırsız Cari Kaydı", "Aylık 20.000 Sipariş", "E-Fatura & Pazaryeri API", "10 Kullanıcı"],
      button: "Ücretsiz Dene",
      popular: true
    },
    {
      name: "Kurumsal",
      price: "Özel",
      desc: "Sınır tanımayan dev şirketler için.",
      features: ["Limitsiz İşlem", "Sınırsız Şube & Depo", "Özel Alt Alan Adı", "Özel Entegrasyonlar"],
      button: "Satışla Görüş",
      popular: false
    }
  ];

  return (
    <div className="w-full relative">
      {/* Toggle */}
      <div className="flex justify-center mb-16 relative z-20">
        <div className="bg-white/5 p-1.5 rounded-full border border-black/10 dark:border-white/10 flex items-center backdrop-blur-md shadow-2xl">
          <button
            onClick={() => setView("sade")}
            className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
              view === "sade" ? "bg-blue-600 text-gray-900 dark:text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "text-gray-500 dark:text-gray-900 dark:text-white/50 hover:text-gray-900 dark:text-gray-900 dark:text-white"
            }`}
          >
            Sade Paketler
          </button>
          <button
            onClick={() => setView("karsilastirma")}
            className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
              view === "karsilastirma" ? "bg-blue-600 text-gray-900 dark:text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "text-gray-500 dark:text-gray-900 dark:text-white/50 hover:text-gray-900 dark:text-gray-900 dark:text-white"
            }`}
          >
            Detaylı Karşılaştırma
          </button>
        </div>
      </div>

      {/* Sade Görünüm */}
      {view === "sade" && (
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10 animate-in fade-in zoom-in-95 duration-500">
          {simplePackages.map((pkg, i) => (
            <div key={i} className={`relative p-8 rounded-[2rem] border transition-all duration-500 hover:-translate-y-2
              ${pkg.popular 
                ? "bg-blue-50 dark:bg-slate-950 border-blue-200 dark:border-blue-900 shadow-[0_0_40px_rgba(37,99,235,0.2)]" 
                : "bg-white dark:bg-[#0A0A0A] border-gray-200 dark:border-[#1A1A1A] hover:border-gray-300 dark:hover:border-[#2A2A2A]"}
            `}>
              <div className="mb-6 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-900 dark:text-white">{pkg.name}</h3>
                  {pkg.popular && (
                    <div className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                      <Zap className="w-3 h-3" /> En Çok Tercih Edilen
                    </div>
                  )}
                </div>
                <p className="text-gray-500 dark:text-gray-900 dark:text-white/50 text-sm h-10">{pkg.desc}</p>
              </div>
              
              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-black text-gray-900 dark:text-gray-900 dark:text-white">{pkg.price}</span>
                {pkg.price !== "Özel" && <span className="text-gray-400 dark:text-gray-900 dark:text-white/40">/ay</span>}
              </div>

              <div className="space-y-4 mb-8">
                {pkg.features.map((feat, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${pkg.popular ? "text-blue-400" : "text-emerald-400"}`} />
                    <span className="text-gray-800 dark:text-gray-900 dark:text-white/80 text-sm font-medium">{feat}</span>
                  </div>
                ))}
              </div>

              <Link href="#iletisim" className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all
                ${pkg.popular 
                  ? "bg-blue-600 hover:bg-blue-500 text-gray-900 dark:text-white shadow-lg hover:shadow-blue-500/25" 
                  : "bg-white/5 hover:bg-white/10 text-gray-900 dark:text-gray-900 dark:text-white border border-black/10 dark:border-white/10"}
              `}>
                {pkg.button}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Detaylı Karşılaştırma Görünümü */}
      {view === "karsilastirma" && (
        <div className="overflow-x-auto pb-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
          {/* Glow effect for the table */}
          <div className="absolute inset-0 bg-blue-500/5 blur-[120px] pointer-events-none"></div>

          <div className="min-w-[900px] max-w-7xl mx-auto">
            <table className="w-full text-left border-collapse bg-white/[0.01] rounded-[2rem] overflow-hidden border border-black/10 dark:border-white/10 backdrop-blur-3xl shadow-2xl">
              <thead>
                <tr>
                  <th className="w-1/4 p-8 border-b border-black/10 dark:border-white/10 bg-gray-100 dark:bg-black/40"></th>
                  <th className="w-1/4 p-8 border-b border-black/10 dark:border-white/10 bg-gray-100 dark:bg-black/40 text-center relative group">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-900 dark:text-white mb-1">Başlangıç</div>
                    <div className="text-2xl font-black text-gray-900 dark:text-gray-900 dark:text-white">₺950</div>
                  </th>
                  <th className="w-1/4 p-8 border-b border-blue-500/30 bg-blue-900/20 text-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-900 dark:text-white mb-1">Profesyonel</div>
                    <div className="text-2xl font-black text-blue-400">₺2.450</div>
                  </th>
                  <th className="w-1/4 p-8 border-b border-black/10 dark:border-white/10 bg-gray-100 dark:bg-black/40 text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-900 dark:text-white mb-1">Kurumsal</div>
                    <div className="text-2xl font-black text-gray-900 dark:text-gray-900 dark:text-white">Özel</div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {/* Category 1 */}
                <tr>
                  <td colSpan={4} className="p-5 pl-8 font-black text-gray-900 dark:text-gray-900 dark:text-white/90 uppercase tracking-widest text-xs bg-white/[0.04] border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2"><Database className="w-4 h-4 text-blue-400" /> Sistem Kapasitesi</div>
                  </td>
                </tr>
                {[
                  { feature: "Müşteri & Cari Kaydı", p1: "5.000 Adet", p2: "Sınırsız", p3: "Sınırsız" },
                  { feature: "Aylık Sipariş Hacmi", p1: "1.000 Sipariş", p2: "20.000 Sipariş", p3: "Limitsiz İşlem" },
                  { feature: "Çoklu Şube & Depo", p1: "1 Şube / 1 Depo", p2: "3 Şube / 3 Depo", p3: "Sınırsız Şube/Depo" },
                  { feature: "Personel Kullanıcı Hesabı", p1: "3 Kullanıcı", p2: "10 Kullanıcı", p3: "Sınırsız" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-black/5 dark:border-white/5 hover:bg-white/[0.04] transition-colors group">
                    <td className="p-5 pl-8 font-medium text-gray-600 dark:text-gray-900 dark:text-white/60 group-hover:text-gray-900 dark:text-gray-900 dark:text-white transition-colors">{row.feature}</td>
                    <td className="p-5 text-center text-gray-800 dark:text-gray-900 dark:text-white/80">{row.p1}</td>
                    <td className="p-5 text-center text-gray-900 dark:text-gray-900 dark:text-white font-bold bg-blue-500/[0.03] border-x border-blue-500/10 shadow-[inset_0_0_20px_rgba(37,99,235,0)] group-hover:shadow-[inset_0_0_20px_rgba(37,99,235,0.05)] transition-shadow">{row.p2}</td>
                    <td className="p-5 text-center text-gray-800 dark:text-gray-900 dark:text-white/80">{row.p3}</td>
                  </tr>
                ))}

                {/* Category 2 */}
                <tr>
                  <td colSpan={4} className="p-5 pl-8 font-black text-gray-900 dark:text-gray-900 dark:text-white/90 uppercase tracking-widest text-xs bg-white/[0.04] border-y border-black/5 dark:border-white/5 mt-4">
                    <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" /> Otomasyon & Güvenlik</div>
                  </td>
                </tr>
                {[
                  { feature: "Finans & Ön Muhasebe", p1: true, p2: true, p3: true },
                  { feature: "B2B / B2C Sipariş Portalı", p1: false, p2: true, p3: true },
                  { feature: "GİB E-Fatura Kesim Entegrasyonu", p1: false, p2: true, p3: true },
                  { feature: "Kargo Firması Barkod Otomasyonu", p1: false, p2: "Sadece 1 Firma", p3: "Sınırsız Firma" },
                  { feature: "Pazaryeri API (Trendyol, vb)", p1: false, p2: false, p3: true },
                  { feature: "Özel Alt Alan Adı", p1: false, p2: false, p3: true },
                  { feature: "Banka Düzeyi Güvenlik (2FA)", p1: false, p2: true, p3: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-black/5 dark:border-white/5 hover:bg-white/[0.04] transition-colors group">
                    <td className="p-5 pl-8 font-medium text-gray-600 dark:text-gray-900 dark:text-white/60 group-hover:text-gray-900 dark:text-gray-900 dark:text-white transition-colors">{row.feature}</td>
                    <td className="p-5">
                      <div className="flex justify-center items-center">
                        {row.p1 === true ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : row.p1 === false ? <X className="w-5 h-5 text-gray-200 dark:text-gray-900 dark:text-white/10" /> : row.p1}
                      </div>
                    </td>
                    <td className="p-5 bg-blue-500/[0.03] border-x border-blue-500/10">
                      <div className="flex justify-center items-center">
                        {row.p2 === true ? <CheckCircle2 className="w-5 h-5 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" /> : row.p2 === false ? <X className="w-5 h-5 text-gray-200 dark:text-gray-900 dark:text-white/10" /> : <span className="font-bold text-blue-300">{row.p2}</span>}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center items-center">
                        {row.p3 === true ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : row.p3 === false ? <X className="w-5 h-5 text-gray-200 dark:text-gray-900 dark:text-white/10" /> : row.p3}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {/* CTA Row */}
                <tr className="bg-black/20">
                  <td className="p-8"></td>
                  <td className="p-8 text-center">
                    <Link href="#iletisim" className="inline-block w-full py-4 rounded-xl border border-black/10 dark:border-white/10 hover:bg-white/10 transition-colors font-bold text-gray-900 dark:text-gray-900 dark:text-white shadow-sm hover:-translate-y-1">Başla</Link>
                  </td>
                  <td className="p-8 bg-blue-500/[0.05] border-x border-b border-blue-500/20 rounded-b-[2rem] text-center">
                    <Link href="#iletisim" className="inline-block w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all font-bold text-gray-900 dark:text-gray-900 dark:text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:-translate-y-1">Ücretsiz Dene</Link>
                  </td>
                  <td className="p-8 text-center">
                    <Link href="#iletisim" className="inline-block w-full py-4 rounded-xl border border-black/10 dark:border-white/10 hover:bg-white/10 transition-colors font-bold text-gray-900 dark:text-gray-900 dark:text-white shadow-sm hover:-translate-y-1">Satışla Görüş</Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
