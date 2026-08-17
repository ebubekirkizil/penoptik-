"use client";

import { useState } from "react";
import { Settings, Server, Shield, Database, CloudRain, Bell, Lock, Save, RefreshCw, AlertTriangle, Key } from "lucide-react";
import toast from "react-hot-toast";

export default function GlobalSettingsPage() {
  const [activeTab, setActiveTab] = useState<"server" | "database" | "security" | "backup" | "api">("server");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Ayarlar baxarıyla kaydedildi.");
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Global Sistem Ayarları</h1>
        </div>
        <p className="text-slate-500 text-sm">Sunucu durumu, veritabanı, güvenlik politikaları ve dıx API bağlantılarını tek merkezden yönetin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Column (Navigation) */}
        <div className="col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab("server")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl text-left text-sm transition-colors border ${activeTab === 'server' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <Server className="w-4 h-4" /> Sunucu & Altyapı
          </button>
          <button 
            onClick={() => setActiveTab("database")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl text-left text-sm transition-colors border ${activeTab === 'database' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <Database className="w-4 h-4" /> Veritabanı Yönetimi
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl text-left text-sm transition-colors border ${activeTab === 'security' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <Shield className="w-4 h-4" /> Güvenlik Politikaları
          </button>
          <button 
            onClick={() => setActiveTab("backup")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl text-left text-sm transition-colors border ${activeTab === 'backup' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <CloudRain className="w-4 h-4" /> Otomatik Yedekleme
          </button>
          <button 
            onClick={() => setActiveTab("api")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl text-left text-sm transition-colors border ${activeTab === 'api' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <Bell className="w-4 h-4" /> E-posta & SMS API
          </button>
        </div>

        {/* Right Column (Form Area) */}
        <div className="col-span-1 md:col-span-3">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm min-h-[500px]">
            
            {activeTab === "server" && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Sunucu Durumu & Performans</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-500 mb-1">Sunucu Sabit IP (Bakanlık / Whitelist)</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">185.22.185.235</p>
                      <button 
                        onClick={() => { navigator.clipboard.writeText("185.22.185.235"); toast.success("IP Adresi Kopyalandı!"); }}
                        className="px-2.5 py-1 text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                      >
                        Kopyala
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-500 mb-1">CPU Kullanımı</p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">%14.2</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-500 mb-1">RAM Kullanımı</p>
                    <p className="text-2xl font-black text-amber-600 dark:text-amber-400">4.2 GB <span className="text-xs text-slate-400">/ 16 GB</span></p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300 font-bold text-sm">
                    <Server className="w-4 h-4" /> Resmi Kurum & Entegrasyon IP Yetkilendirmesi
                  </div>
                  <p className="text-xs text-blue-600/80 dark:text-blue-300/70 leading-relaxed">
                    Müxterileriniz veya resmi kurumlar (SGK, Sağlık Bakanlığı, ÜTS vb.) SentientWire sunucu IP adresini talep ettiğinde yukarıdaki <code className="bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded font-mono font-bold text-blue-800 dark:text-blue-200">185.22.185.235</code> adresini doğrudan verebilirsiniz. Bu IP adresi sunucunuz için sabittir ve değixtirilemez.
                  </p>
                </div>

                <hr className="border-slate-200 dark:border-slate-800" />

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bakım Modu</label>
                  <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-xl">
                    <div>
                      <p className="font-semibold text-rose-700 dark:text-rose-400 text-sm">Sistemi Bakıma Al</p>
                      <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">Bu ayar aktif edildiğinde Müxteri Panelleri girixlere kapatılır.</p>
                    </div>
                    <button className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold shadow-md shadow-rose-500/20 transition-colors">
                      Aktiflextir
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "database" && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Veritabanı Yönetimi & Optimizasyon</h2>
                
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl flex gap-4">
                  <Database className="w-8 h-8 text-indigo-500 shrink-0" />
                  <div>
                    <h3 className="font-bold text-indigo-900 dark:text-indigo-400 text-sm">Prisma ORM Bağlantı Havuzu (Pool)</h3>
                    <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 mt-1">Şu anda aktif olarak 14 bağlantı kullanılıyor. Maksimum sınır: 100.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Cache (Önbellek) Temizleme</label>
                  <p className="text-xs text-slate-500 mb-3">Sistemde oluxan Next.js statik önbelleklerini temizleyerek son verilerin çekilmesini zorlar.</p>
                  <button onClick={handleSave} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Önbelleği Temizle
                  </button>
                </div>

                <hr className="border-slate-200 dark:border-slate-800" />

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Tehlikeli İxlemler
                  </h3>
                  <button className="px-4 py-2 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl text-sm font-bold transition-colors">
                    Tüm Test Verilerini Sil
                  </button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Güvenlik Politikaları</h2>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">SSL / TLS Zorunluluğu</label>
                  <p className="text-xs text-slate-500 mb-3">Tüm alt alan adları (subdomain) için HTTPS yönlendirmesini zorunlu kılar.</p>
                  <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-300 font-medium transition-colors">
                    <option value="strict">Sıkı (Zorunlu HSTS)</option>
                    <option value="redirect">Otomatik Yönlendir</option>
                    <option value="disabled">Devre Dıxı (Önerilmez)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Oturum Zaman Axımı (Session Timeout)</label>
                  <p className="text-xs text-slate-500 mb-3">Kullanıcılar ixlem yapmadığında kaç dakika sonra otomatik çıkıx yapılsın?</p>
                  <input type="number" defaultValue={60} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-indigo-500/50 transition-colors">
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">İki Axamalı Doğrulama (2FA) Zorunluluğu</p>
                    <p className="text-xs text-slate-500 mt-1">Tüm yöneticiler girix yaparken SMS kodu girmek zorunda kalır.</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-indigo-600" />
                </div>
              </div>
            )}

            {activeTab === "backup" && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Otomatik Yedekleme Konfigürasyonu</h2>
                
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-emerald-900 dark:text-emerald-400 text-sm">Son Baxarılı Yedekleme</h3>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">Bugün, 03:00 (Boyut: 4.2 GB)</p>
                  </div>
                  <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm">
                    İndir
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Yedekleme Sıklığı</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                    <option value="daily">Her Gün Gece (Önerilen)</option>
                    <option value="weekly">Haftada Bir Pazar Günü</option>
                    <option value="monthly">Ayda Bir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">AWS S3 Bağlantı URL'i (Uzak Yedekleme)</label>
                  <input type="text" placeholder="s3://bucket-name/backups/" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 font-mono transition-colors" />
                </div>
              </div>
            )}

            {activeTab === "api" && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">E-posta & SMS API Ayarları</h2>
                
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-500" /> SMS Sağlayıcısı (Netgsm/Mutlucell vs.)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">API Key</label>
                      <input type="password" defaultValue="************************" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">API Secret / Şifre</label>
                      <input type="password" defaultValue="********" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Gönderici Baxlığı (Header)</label>
                    <input type="text" defaultValue="SENTIENT" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                </div>

                <hr className="border-slate-200 dark:border-slate-800 my-6" />

                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-500" /> SMTP (E-Posta) Sunucusu
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">SMTP Host</label>
                    <input type="text" defaultValue="smtp.sendgrid.net" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Port</label>
                      <input type="number" defaultValue={587} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Güvenlik (SSL/TLS)</label>
                      <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                        <option>TLS</option>
                        <option>SSL</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-8 flex justify-end mt-8 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-70"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Kaydediliyor..." : "Tüm Değixiklikleri Kaydet"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
