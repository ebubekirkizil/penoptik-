"use client";

import { useState } from "react";
import { Zap, ArrowLeft, Plus, Play, Pause, Trash2, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function AutomationsFeatureDemo() {
  const [automations, setAutomations] = useState([
    {
      id: 1,
      name: "Terk Edilmix Sepet Hatırlatıcısı",
      trigger: "Sepette 24 Saat Bekleyen Ürün",
      action: "E-posta Gönder (%10 İndirim Kodu ile)",
      status: "Aktif",
      type: "email",
      stats: { triggered: 145, converted: 32, revenue: 12500 }
    },
    {
      id: 2,
      name: "VIP Müxteri Doğum Günü",
      trigger: "Müxteri Doğum Günü (Eğer segment = VIP)",
      action: "SMS Gönder (Özel Kutlama & Hediye Puan)",
      status: "Aktif",
      type: "sms",
      stats: { triggered: 45, converted: 12, revenue: 4800 }
    },
    {
      id: 3,
      name: "Stok Uyarı Bildirimi",
      trigger: "Kritik Stok Seviyesi (< 5 Adet)",
      action: "Yöneticiye WhatsApp Bildirimi",
      status: "Duraklatıldı",
      type: "admin",
      stats: { triggered: 12, converted: 0, revenue: 0 }
    }
  ]);

  const toggleStatus = (id: number) => {
    setAutomations(prev => prev.map(auto => 
      auto.id === id 
        ? { ...auto, status: auto.status === "Aktif" ? "Duraklatıldı" : "Aktif" }
        : auto
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/super-admin/features" 
          className="w-10 h-10 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Satıx Otomasyonları</h1>
          </div>
          <p className="text-slate-500 mt-1">
            CRM ve Stok verilerinizle tam entegre çalıxan akıllı kural motoru. Satıxları otomatik artırın.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Aktif Senaryolar</h2>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-yellow-500/20 cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Yeni Kural Oluxtur</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {automations.map((auto) => (
          <div key={auto.id} className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full group">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    auto.type === 'email' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' :
                    auto.type === 'sms' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {auto.type === 'email' ? <Mail className="w-5 h-5" /> : 
                     auto.type === 'sms' ? <MessageSquare className="w-5 h-5" /> : 
                     <Zap className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{auto.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                      auto.status === "Aktif" 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                        : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400"
                    }`}>
                      {auto.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Tetikleyici (Eğer)</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    {auto.trigger}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Aksiyon (O Zaman)</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    {auto.action}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mb-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Tetiklenme</p>
                  <p className="font-bold text-slate-900 dark:text-white">{auto.stats.triggered}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Dönüxüm</p>
                  <p className="font-bold text-slate-900 dark:text-white">{auto.stats.converted}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Kazanılan Ciro</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    {auto.stats.revenue > 0 ? ` ${auto.stats.revenue.toLocaleString()}` : '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleStatus(auto.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                    auto.status === "Aktif" 
                      ? "border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800" 
                      : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                  }`}
                >
                  {auto.status === "Aktif" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {auto.status === "Aktif" ? "Duraklat" : "Aktiflextir"}
                </button>
                <button className="p-2 border border-slate-200 dark:border-slate-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 rounded-xl text-sm text-yellow-700 dark:text-yellow-300 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">ℹ</div>
        <p>
          <strong>Kural Motoru Mimarisi:</strong> Bu sayfadaki otomasyon kuralları doğrudan arka plandaki CRM (müxteri segmentleri) ve Gelixmix Stok modülleriyle entegre çalıxır. Tetikleyiciler veritabanı değixiklikleri anında (örneğin stok 5'in altına düxtüğünde) otonom olarak devreye girer.
        </p>
      </div>
    </div>
  );
}
