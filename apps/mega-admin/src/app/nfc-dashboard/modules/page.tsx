"use client";

import { useState } from "react";
import { AVAILABLE_MODULES, ModuleDefinition } from "@/lib/nfcModules";
import { Plus, Edit2, Trash2, GripVertical, Check } from "lucide-react";

export default function NfcModulesPage() {
  const [activeTab, setActiveTab] = useState<"social" | "contact" | "business" | "media" | "other">("contact");
  const [userModules, setUserModules] = useState([
    { id: "1", type: "whatsapp", title: "Bana Ulaxın", url: "+905551234567" },
    { id: "2", type: "instagram", title: "Instagram", url: "https://instagram.com/ornek" },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSaveModules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nfc/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          profileId: "cl_fake_id_replace_me", 
          modules: userModules 
        })
      });
      if (res.ok) alert("Sıralama ve modüller kaydedildi!");
    } catch (err) {
      alert("Hata oluxtu.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "contact", label: "İletixim" },
    { id: "social", label: "Sosyal Ağlar" },
    { id: "business", label: "İx & Finans" },
    { id: "media", label: "Eğlence" },
    { id: "other", label: "Diğer" }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
      
      {/* Sol Panel: Modül Seçici (Market) */}
      <div className="w-full lg:w-1/2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modül Ekle</h1>
          <p className="text-gray-500 mt-2">Profilinize eklemek istediğiniz bağlantı türünü seçin.</p>
        </div>

        {/* Kategori Tabları */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === cat.id ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Modül Listesi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AVAILABLE_MODULES.filter(m => m.category === activeTab).map((mod) => (
            <div 
              key={mod.id}
              className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col justify-between hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: mod.color }}
                >
                  {mod.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm leading-tight">{mod.label}</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Bağlantı</p>
                </div>
              </div>
              <button className="w-full py-2 bg-gray-50 text-gray-700 text-xs font-bold rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors flex items-center justify-center gap-1">
                <Plus size={14} /> Ekle
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sağ Panel: Canlı Önizleme ve Sıralama */}
      <div className="w-full lg:w-1/2">
        <div className="bg-gray-100 rounded-[3rem] p-4 border-[8px] border-gray-900 shadow-2xl relative max-w-[340px] mx-auto min-h-[600px] flex flex-col">
          {/* Çentik */}
          <div className="w-32 h-6 bg-gray-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-3xl z-10"></div>
          
          <div className="bg-white flex-1 rounded-[2.2rem] overflow-hidden flex flex-col p-4 pt-10">
            <h3 className="text-center font-bold text-gray-900 text-lg mb-6">Profil Önizleme</h3>
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {userModules.map((um, index) => {
                const def = AVAILABLE_MODULES.find(m => m.id === um.type);
                if (!def) return null;

                return (
                  <div 
                    key={um.id}
                    className="relative flex items-center p-3 rounded-2xl transition-transform hover:scale-[1.02] cursor-move bg-gray-50 border border-gray-100 group"
                  >
                    <div className="absolute -left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical size={16} className="text-gray-400" />
                    </div>
                    
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: def.color }}
                    >
                      {def.icon}
                    </div>
                    
                    <div className="ml-3 flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{um.title}</h4>
                      <p className="text-xs text-gray-500 truncate">{um.url}</p>
                    </div>

                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button className="p-1.5 bg-blue-100 text-blue-600 rounded-md"><Edit2 size={12} /></button>
                      <button className="p-1.5 bg-red-100 text-red-600 rounded-md"><Trash2 size={12} /></button>
                    </div>
                  </div>
                );
              })}

              {userModules.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-10">
                  Henüz modül eklemediniz. Sol taraftan seçebilirsiniz.
                </div>
              )}
            </div>

            <div className="mt-4">
              <button 
                onClick={handleSaveModules}
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Check size={18} /> 
                {loading ? "Kaydediliyor..." : "Sıralamayı Kaydet"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
