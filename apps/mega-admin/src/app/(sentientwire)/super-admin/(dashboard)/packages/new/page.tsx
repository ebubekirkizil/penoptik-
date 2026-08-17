import { Package, Save, ArrowLeft, Layers, ShieldCheck, Box, CreditCard, LayoutTemplate, Settings, Zap, Users, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { createPackageAction } from "./actions";
import { SAAS_MODULES } from "../../../../../../lib/modules";
import { TemplateSelector } from "./TemplateSelector";

export default function NewPackagePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/super-admin/packages" className="w-12 h-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Package className="w-6 h-6 text-indigo-500" /> Yeni SaaS Paketi Oluxtur
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">B2B müxterilerinize satacağınız ERP ve e-ticaret modüllerini detaylıca konfigüre edin.</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400">Taslak Olarak Kaydediliyor...</span>
        </div>
      </div>

      <TemplateSelector />

      <form action={createPackageAction} className="space-y-8">
        
        {/* Paket Temel Bilgileri */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <LayoutTemplate className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Paket Profili ve Finansal Detaylar</h2>
              <p className="text-sm text-slate-500 mt-1">Paketin adı, ücretlendirmesi ve vitrinde nasıl görüneceğini belirleyin.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            <div className="space-y-3 xl:col-span-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Paket Adı (Vitrinde Görünecek)</label>
              <input type="text" name="name" required className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 dark:text-white font-bold text-lg" placeholder="Örn: Enterprise Optik Suite" />
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Aylık Lisans Ücreti</label>
              <div className="flex relative">
                <input type="number" step="0.01" name="price" required className="flex-1 px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 border-r-0 rounded-l-2xl focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 dark:text-white font-black text-xl text-right" placeholder="12.500" />
                <span className="inline-flex items-center px-6 rounded-r-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-[#0F172A] text-slate-500 font-bold text-lg">
                   
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Fatura Periyodu</label>
              <select className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 dark:text-white font-bold appearance-none cursor-pointer">
                <option value="MONTHLY">Aylık Yenileme</option>
                <option value="YEARLY">Yıllık Yenileme (%15 İndirimli)</option>
              </select>
            </div>
            
            <div className="space-y-3 xl:col-span-4">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Paket Kısa Açıklaması (Satıx Pazarlama)</label>
              <textarea name="description" rows={2} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 dark:text-white resize-none" placeholder="Tüm mağazalarınızı tek ekrandan yönetebileceğiniz, sınırsız personel ve e-fatura destekli tam donanımlı kurumsal paket..."></textarea>
            </div>
          </div>
        </div>

        {/* Granüler Modül Seçimi (Feature Flags) */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Granüler Yetki & Modül Konfigürasyonu (ERP Altyapısı)</h2>
              <p className="text-sm text-slate-500 mt-1">Müxterinin menüsünde HANGİ butonlar ve özellikler aktif olacak? İxaretleyerek sistemi onlara özel xekillendirin.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10">
            {SAAS_MODULES.map((category) => (
              <div key={category.categoryId} className="space-y-5 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl ${category.bgClass} flex items-center justify-center ${category.colorClass}`}>
                    <category.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{category.categoryName}</h3>
                </div>
                
                {category.items.map((item, index) => (
                  <label key={item.id} className="flex items-start gap-4 cursor-pointer group">
                    <div className="mt-1">
                      <input 
                        type="checkbox" 
                        name="modules" 
                        value={item.id} 
                        defaultChecked={index === 0} 
                        className="w-6 h-6 rounded-lg text-indigo-600 bg-slate-200 border-transparent focus:ring-indigo-500 cursor-pointer transition-all" 
                      />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">{item.name}</span>
                      <span className="block text-xs text-slate-500 mt-1">{item.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Kaydet Butonu */}
        <div className="flex justify-end pt-4 pb-12">
          <button type="submit" className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white rounded-2xl font-black transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3 text-lg group">
            <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Yeni Paketi Sistemi Kaydet ve Yayına Al
          </button>
        </div>
      </form>
    </div>
  );
}
