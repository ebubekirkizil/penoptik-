"use client";

import React, { useState } from "react";
import { Server, ExternalLink, ShieldCheck, Key, Settings, Save, HelpCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SGKIntegrationPage() {
  const [formData, setFormData] = useState({
    kurumKodu: "",
    sifre: "",
    tesisKodu: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use a hardcoded Firm ID for now, as we don't have auth context in this snippet
  // In a real scenario, this would come from the logged in user's session
  const firmId = "clzhc5u9m0000r3y8d7b3m9q8"; // Default firm ID for demo

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/integrations/sgk/settings?firmId=${firmId}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            kurumKodu: data.kurumKodu || "",
            sifre: data.hasSifre ? "********" : "",
            tesisKodu: data.tesisKodu || ""
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
        kurumKodu: formData.kurumKodu,
        tesisKodu: formData.tesisKodu,
        sifre: formData.sifre === "********" ? undefined : formData.sifre,
      };

      const res = await fetch("/api/integrations/sgk/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Kaydedilemedi");
      
      // Log the activity to the system
      await fetch('/api/admin/system/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SGK Medula Entegrasyonu Güncellendi',
          details: {
            kurumKodu: formData.kurumKodu || 'Girmedi',
            tesisKodu: formData.tesisKodu || 'Boş'
          }
        })
      });

      toast.success("SGK Medula API bilgileri güvenle kaydedildi.");
    } catch (err) {
      toast.error("Kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
          <Server className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">SGK Medula İşlemleri</h1>
          <p className="text-muted-foreground text-sm mt-1">E-Reçete, Müstehaklık Sorgulama ve Optik Web Servisleri</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sol Taraf: Manuel Yönlendirme */}
        <div className="space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-3xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center shrink-0">
                <ExternalLink className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-indigo-900 dark:text-indigo-300 text-lg">Resmi Portal Erişimi</h3>
                <p className="text-sm text-indigo-700/80 dark:text-indigo-400/80 mt-1">
                  Güvenlik protokolleri gereği SGK ekranları sistem içine gömülemez. Manuel işlemlerinizi yapmak için Medula Optik v3 portalına doğrudan erişebilirsiniz.
                </p>
              </div>
            </div>
            
            <a 
              href="https://medula.sgk.gov.tr/optik/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              Medula Optik Girişi (Yeni Sekme)
            </a>
          </div>

          <div className="bg-surface border border-border-color rounded-2xl p-5">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Bakanlık Onaylı Mimari
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dışa yönlendirme, Bakanlık denetimlerinde Cross-Origin (CORS) ve Clickjacking güvenlik kurallarına uygunluğu sağlar. Tüm otomatik sorgular (müstehaklık, reçete arama) sağ taraftaki API servisleri ile arka planda çalışır.
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
                <HelpCircle className="w-4 h-4 text-indigo-500" /> SGK Şifresi Ne İşe Yarar?
              </h4>
              <p className="text-xs text-indigo-800 dark:text-indigo-200/80 leading-relaxed">
                SGK Medula Optik Portalına giriş yaparken kullandığınız şifreyi buraya girdiğinizde; sistem yeni bir gözlük satışı sırasında hastanın <strong>Müstehaklık (Gözlük Hakkı)</strong> durumunu ve doktorun yazdığı <strong>E-Reçeteyi</strong> otomatik olarak Medula'dan çeker. 
                <br/><br/>
                Şifreniz <span className="font-bold">AES-256 (GCM) askeri standartlarında</span> şifrelenerek veritabanına kaydedilir, bir daha arayüzde görünmez ve kimse tarafından okunamaz.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Kurum Kodu (Sicil)</label>
              <input 
                type="text" 
                value={formData.kurumKodu}
                onChange={e => setFormData({...formData, kurumKodu: e.target.value})}
                placeholder="Örn: 1111111"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Web Servis Şifresi</label>
              <input 
                type="password" 
                value={formData.sifre}
                onChange={e => setFormData({...formData, sifre: e.target.value})}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-[11px] text-slate-500 mt-1">Medula giriş şifreniz, sunucuda şifrelenerek AES-256 ile saklanır.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tesis Kodu (Opsiyonel)</label>
              <input 
                type="text" 
                value={formData.tesisKodu}
                onChange={e => setFormData({...formData, tesisKodu: e.target.value})}
                placeholder="Örn: 9999"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
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
              İl Sağlık Müdürlüğü ve SGK denetimlerinde sunmanız gereken hazır log ve reçete raporları.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-4 flex flex-col items-start gap-4">
            <div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300">Karekod Log Kayıtları</h4>
              <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-1">ÜTS'ye bildirilen ürünlerin sisteme giriş, çıkış ve doğrulama logları.</p>
            </div>
            <button className="mt-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors w-full">
              Excel Olarak İndir
            </button>
          </div>

          <div className="bg-white dark:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-4 flex flex-col items-start gap-4">
            <div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300">SGK Reçete Listesi</h4>
              <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-1">Seçilen tarih aralığındaki tüm SGK reçeteleri ve Medula takip numaraları.</p>
            </div>
            <button className="mt-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors w-full">
              Excel Olarak İndir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
