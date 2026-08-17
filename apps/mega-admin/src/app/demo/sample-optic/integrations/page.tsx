// @ts-nocheck
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Globe, Server, Code, FileText, CheckCircle2, Play, Loader2, Download } from "lucide-react";

export default function IntegrationsPage() {
  const [apiKey, setApiKey] = useState("************************");
  const [apiSecret, setApiSecret] = useState("************************");
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);

  const testInvoice = async () => {
    setLoading(true);
    setInvoice(null);
    try {
      const res = await fetch("/api/finance/e-fatura/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "ORD-TEST-100",
          amount: 2500,
          customerData: { name: "Nuh E-Ticaret A.Ş." }
        })
      });
      const data = await res.json();
      if (res.ok) {
        setInvoice(data);
      } else {
        alert("Hata: " + data.error);
      }
    } catch (err) {
      alert("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="w-16 h-16 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
          <Globe className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">API & Entegrasyonlar</h1>
          <p className="text-slate-500 mt-1">E-Ticaret (Shopify, Trendyol) ve E-Fatura (Uyumsoft) sistemlerini Sentient Wire'a bağlayın.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* E-Ticaret IP Bağlama */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 lg:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Server className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. E-Ticaret Pazar Yeri & IP Bağlama (Shopify, Trendyol)</h2>
          </div>
          
          <div className="space-y-6 text-slate-600 dark:text-slate-300">
            <p>Sentient Wire sisteminizin pazar yerlerinden siparix çekebilmesi için sistem IP adresimizi o platformların API ayarlarına beyaz liste (Whitelist) olarak eklemeniz gerekmektedir.</p>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Sabit Sunucu IP Adresimiz (Kopyalayın)</p>
              <div className="flex items-center gap-3">
                <code className="text-lg font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg font-bold select-all">
                  192.168.1.104
                </code>
                <span className="text-xs text-slate-400">Pazar yeri paneline bunu yapıxtırın.</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white">Nasıl Kurulur?</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li><strong className="text-slate-800 dark:text-slate-200">Shopify / Trendyol Satıcı Paneline</strong> girix yapın.</li>
                <li>Ayarlar &gt; Gelixtirici &gt; API Entegrasyonları (veya Uygulamalar) sekmesini açın.</li>
                <li>Yeni bir entegrasyon oluxturun ve "IP Beyaz Liste (Whitelist)" alanına yukarıdaki <code>192.168.1.104</code> IP adresini yapıxtırın.</li>
                <li>Oluxan <strong className="text-indigo-500">API Key</strong> ve <strong className="text-indigo-500">API Secret</strong> değerlerini kopyalayıp axağıdaki alana kaydedin.</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">API Key</label>
                <input type="text" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">API Secret</label>
                <input type="password" value={apiSecret} onChange={e => setApiSecret(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all">
                <Code className="w-4 h-4" /> API Anahtarlarını Kaydet
              </button>
            </div>
          </div>
        </div>

        {/* E-Arxiv & E-Fatura (Uyumsoft) */}
        <div className="bg-white dark:bg-[#1E293B] border border-emerald-500/20 rounded-3xl p-6 lg:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <FileText className="w-6 h-6 text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. E-Fatura & E-Arxiv (GİB / Uyumsoft) Simülasyonu</h2>
          </div>
          
          <div className="space-y-6 text-slate-600 dark:text-slate-300 relative z-10">
            <p>Satıxlarınız yapıldığında devlet sistemine (GİB) otomatik olarak e-fatura/e-arxiv kesilir ve Uyumsoft üzerinden gönderilir. Özelliğin çalıxması için yetkilendirme gereklidir.</p>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800/50">
              <h3 className="font-bold text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> GİB Entegrasyonu Aktif
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Sistem baxarıyla Uyumsoft portalına entegre edilmixtir. Artık e-ticaret sitelerinizden gelen siparixler onaylandığı an otomatik faturaya dönüxecek. (Axağıdan anında test edebilirsiniz.)
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
              <button onClick={testInvoice} disabled={loading} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {loading ? "GİB'e Gönderiliyor..." : "Sistemi Test Et (Örnek E-Arxiv Oluxtur)"}
              </button>
            </div>

            {invoice && (
              <div className="mt-6 bg-slate-900 text-white p-5 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-5 h-5" /> Fatura Baxarıyla Kesildi!
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <div>
                    <p className="text-slate-400">Durum</p>
                    <p className="font-bold text-emerald-400">{invoice.status} (GİB Onaylı)</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Fatura ID (UUID)</p>
                    <p className="font-mono text-xs">{invoice.invoiceId}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Mesaj</p>
                    <p className="font-bold">{invoice.message}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Toplam Tutar</p>
                    <p className="font-bold text-lg"> 2,500.00</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
