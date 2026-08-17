"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Sparkles, Building2, Phone, MapPin, FileText, CheckCircle2, Box, Users, Calendar, Receipt, Plus, Settings, Play, X, ShieldCheck, Mail } from "lucide-react";
import AITemplateAssistant from "./AITemplateAssistant";

import { SAAS_MODULES } from "../../../../../../../lib/modules";

type ModuleItem = {
  id: string;
  name: string;
  icon: any;
  category: string;
};

const AVAILABLE_MODULES: ModuleItem[] = SAAS_MODULES.flatMap(category => 
  category.items.map(item => ({
    id: item.id,
    name: item.name,
    icon: category.categoryId === "CRM" ? <Users className="w-5 h-5" /> : category.categoryId === "INVENTORY" ? <Box className="w-5 h-5" /> : <Receipt className="w-5 h-5" />,
    category: category.categoryId,
  }))
);

export default function SampleOpticTemplatePage() {
  const [modules, setModules] = useState<ModuleItem[]>(
    AVAILABLE_MODULES.filter(m => ["MOD_CUSTOMER", "MOD_PRESCRIPTION", "MOD_INVENTORY", "MOD_POS", "MOD_EFATURA"].includes(m.id))
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const removeModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
  };

  const addModule = (mod: ModuleItem) => {
    if (!modules.find(m => m.id === mod.id)) {
      setModules([...modules, mod]);
    }
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-6 relative">
      {/* Left Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50 dark:bg-[#0F172A]/50">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/super-admin/features" 
              className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Optik Sektörü Şablonu</h1>
                <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">Taslak</span>
              </div>
              <p className="text-slate-500 text-sm mt-1">Bu xablon, yeni bir optik müxterisi için hazır bir sistem altyapısı sağlar.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/demo/sample-optic"
              target="_blank"
              className="px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4 text-emerald-500" /> Test Et (Canlı Demo)
            </Link>
            <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm shadow-indigo-500/20">
              <Save className="w-4 h-4" /> Şablonu Kaydet
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Section */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 rounded-lg">
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Şablon Ayarları</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" /> Varsayılan Firma Adı
                </label>
                <input 
                  type="text" 
                  defaultValue="Örnek Optik" 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" /> Varsayılan Telefon
                </label>
                <input 
                  type="text" 
                  defaultValue="+90 555 123 4567" 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" /> Varsayılan Adres
                </label>
                <textarea 
                  rows={2}
                  defaultValue="Örnek Mahallesi, Optik Caddesi No:1, İstanbul" 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all dark:text-white resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" /> İade & Garanti Politikası (Özet)
                </label>
                <textarea 
                  rows={3}
                  defaultValue="Cam ve çerçevelerimizde 2 yıl distribütör garantisi mevcuttur. Kullanıcı hatası dıxındaki kırılmalarda ücretsiz değixim yapılır." 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all dark:text-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Module Skeleton Section */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-lg">
                  <Box className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Şablon İskeleti (Modüller)</h2>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="p-2 text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-500/20 shadow-sm"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 flex-1">
              {modules.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                  <Box className="w-12 h-12 mb-3 opacity-20" />
                  <p>Henüz modül eklenmemix.</p>
                </div>
              ) : (
                modules.map(mod => (
                  <div key={mod.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-slate-400 dark:text-slate-500">
                        {mod.icon}
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{mod.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                        {mod.category}
                      </span>
                      <button 
                        onClick={() => removeModule(mod.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                      >
                        <span className="sr-only">Kaldır</span>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 shrink-0">
              <p className="text-sm text-indigo-800 dark:text-indigo-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                <span><strong>İpucu:</strong> Bu iskelet, bir müxteri Optik Şablonunu seçtiğinde otomatik olarak kurulacak modülleri temsil eder. Yapay zeka asistanını kullanarak modüllerde hızlıca değixiklik yapabilirsiniz.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right AI Assistant Area */}
      <div className="w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] flex flex-col shrink-0">
        <AITemplateAssistant />
      </div>

      {/* Add Module Modal Overlay */}
      {isAddModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-indigo-500" /> Modül Ekle
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
              {AVAILABLE_MODULES.filter(m => !modules.find(added => added.id === m.id)).length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Tüm modüller zaten eklendi!
                </div>
              ) : (
                AVAILABLE_MODULES.filter(m => !modules.find(added => added.id === m.id)).map(mod => (
                  <button 
                    key={mod.id}
                    onClick={() => addModule(mod)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors">
                        {mod.icon}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{mod.name}</div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{mod.category}</div>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 group-hover:text-indigo-600 transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
