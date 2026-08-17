"use client";

import React, { useState } from "react";
import { PackageSearch, ExternalLink, ShieldCheck, Key, Settings, Save, HelpCircle, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import UtsQueue from "@/components/uts/UtsQueue";

export default function UTSIntegrationPage() {
  const [formData, setFormData] = useState({
    token: "",
    kurumNo: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use a hardcoded Firm ID for now, as we don't have auth context in this snippet
  // In a real scenario, this would come from the logged in user's session
  const firmId = "clzhc5u9m0000r3y8d7b3m9q8"; // Default firm ID for demo

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/integrations/uts/settings?firmId=${firmId}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            kurumNo: data.kurumNo || "",
            token: data.hasToken ? "********" : "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [firmId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const payload = {
        firmId,
        kurumNo: formData.kurumNo,
        token: formData.token === "********" ? undefined : formData.token,
      };

      const res = await fetch("/api/integrations/uts/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Kaydedilemedi");
      
      toast.success("ÜTS Sistem Kullanıcısı Token bilgileri başarıyla kaydedildi.");
    } catch (error) {
      toast.error("Kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center">
          <PackageSearch className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">ÜTS Entegrasyonu</h1>
          <p className="text-muted-foreground text-sm mt-1">Ürün Takip Sistemi: Alma, Verme Bildirimleri ve TİTCK Senkronizasyonu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sol Taraf: Manuel Yönlendirme */}
        <div className="space-y-6">
          <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900 rounded-3xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center shrink-0">
                <ExternalLink className="w-5 h-5 text-teal-700 dark:text-teal-400" />
              </div>
              <div>
                <h3 className="font-bold text-teal-900 dark:text-teal-300 text-lg">Resmi Portal Erişimi</h3>
                <p className="text-sm text-teal-700/80 dark:text-teal-400/80 mt-1">
                  Sağlık Bakanlığı kuralları gereği ÜTS arayüzü iframe içine gömülemez. Manuel Alma/Verme Bildirimi yapmak için e-Devlet şifrenizle ÜTS Uygulamasına gidebilirsiniz.
                </p>
              </div>
            </div>
            
            <a 
              href="https://utsuygulama.saglik.gov.tr/UTS/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-lg shadow-teal-600/20 transition-all active:scale-95"
            >
              ÜTS Portal Girişi (Yeni Sekme)
            </a>
          </div>

          <div className="bg-surface border border-border-color rounded-2xl p-5">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Otomatik Alma/Verme Bildirimleri
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dışa yönlendirme haricinde, Stok Takibi menüsü altındaki "SGK & ÜTS Onayları" sekmesinden yaptığınız her işlem, sağ tarafta belirleyeceğiniz Sistem Token'ı kullanılarak arka planda TİTCK web servislerine (REST API) iletilmektedir.
            </p>
          </div>
        </div>

        {/* Sağ Taraf: API Entegrasyon Bilgileri */}
        <div className="bg-surface border border-border-color rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Key className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <h3 className="font-bold text-lg">Arka Plan API Ayarları</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl p-5 mb-6 border border-indigo-100 dark:border-indigo-900/50">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4 text-indigo-500" /> ÜTS API Token Nasıl Alınır?
              </h4>
              <ul className="space-y-3 text-xs text-indigo-800 dark:text-indigo-200/80">
                <li className="flex items-start gap-2">
                  <span className="bg-indigo-200 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full w-4 h-4 flex items-center justify-center font-bold shrink-0 mt-0.5">1</span>
                  <span>ÜTS portalına (https://utsuygulama.saglik.gov.tr) e-Devlet ile giriş yapın.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-indigo-200 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full w-4 h-4 flex items-center justify-center font-bold shrink-0 mt-0.5">2</span>
                  <span>Sağ üstteki isminize tıklayıp "Sistem Kullanıcıları" menüsüne girin.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-indigo-200 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full w-4 h-4 flex items-center justify-center font-bold shrink-0 mt-0.5">3</span>
                  <span>"Yeni Sistem Kullanıcısı Ekle" butonuna basıp, yetki olarak <strong className="text-indigo-900 dark:text-indigo-100">REST API</strong> seçin. Oluşan uzun şifreyi kopyalayıp aşağıdaki alana yapıştırın.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Kurum / ÇKYS No</label>
              <input 
                type="text" 
                value={formData.kurumNo}
                onChange={e => setFormData({...formData, kurumNo: e.target.value})}
                placeholder="Örn: 9999999"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Sistem Kullanıcısı Token'ı</label>
              <textarea 
                value={formData.token}
                onChange={e => setFormData({...formData, token: e.target.value})}
                placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-28"
              />
              <p className="text-[11px] text-slate-500 mt-1">ÜTS sisteminden aldığınız Sistem Kullanıcısı (REST API) jetonu.</p>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                type="submit"
                disabled={isSaving || isLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl transition-all hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50"
              >
                {isSaving || isLoading ? (
                  <><Settings className="w-4 h-4 animate-spin" /> Kaydediliyor...</>
                ) : (
                  <><Save className="w-4 h-4" /> Bağlantıyı Kaydet & Sına</>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Bakanlık Denetim Raporları */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-black text-emerald-900 dark:text-emerald-100 text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Bakanlık Denetim Raporları
            </h3>
            <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80 mt-1">
              İl Sağlık Müdürlüğü ve TİTCK denetimlerinde sunmanız gereken hazır log ve stok bildirim raporları.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-4 flex flex-col items-start gap-4">
            <div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300">ÜTS İşlem Geçmişi (Loglar)</h4>
              <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-1">Alma, Verme, Tüketim bildirimlerinin durumu, tarihi ve hata/başarı mesajları.</p>
            </div>
            <button className="mt-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors w-full">
              Excel Olarak İndir
            </button>
          </div>

          <div className="bg-white dark:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-4 flex flex-col items-start gap-4">
            <div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300">Stok Bildirim Raporu</h4>
              <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-1">Envanterinizdeki tüm ürünlerin ÜTS üzerinde beyan edilen güncel miktarları.</p>
            </div>
            <button className="mt-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors w-full">
              Excel Olarak İndir
            </button>
          </div>
        </div>
      </div>

      <UtsQueue />
    </div>
  );
}
