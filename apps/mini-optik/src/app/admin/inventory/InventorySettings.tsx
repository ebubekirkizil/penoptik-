"use client";

import React, { useState, useEffect } from "react";
import { Settings, Plus, X, Trash2, Edit2 } from "lucide-react";
import toast from "react-hot-toast";

const hexColors: Record<string, string> = {
  blue: "#3b82f6", amber: "#f59e0b", purple: "#a855f7", teal: "#14b8a6",
  rose: "#f43f5e", emerald: "#10b981", slate: "#64748b", cyan: "#06b6d4",
  fuchsia: "#d946ef", indigo: "#6366f1"
};

const getHex = (c: string) => hexColors[c] || (c.startsWith('#') ? c : '#64748b');

const getDynamicStyle = (colorStr: string, isActive: boolean = true) => {
  const hex = getHex(colorStr);
  if (!isActive) return { container: {}, dot: {}, text: {} };
  return {
    container: { backgroundColor: `${hex}1A`, borderColor: `${hex}4D` },
    dot: { backgroundColor: hex },
    text: { color: hex, backgroundColor: `${hex}1A`, borderColor: `${hex}4D` }
  };
};
interface Category {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  taxRate?: string;
}

interface MovementReason {
  id: string;
  name: string;
  color: string;
  type: string;
}

interface Brand {
  id: string;
  name: string;
  color: string;
}

interface InventorySettingsData {
  lowStockAlert: boolean;
  autoReorder: boolean;
  defaultTaxRate: string;
  stockValuation: string;
  labelFormat?: string;
  barcodeType?: string;
  categories: Category[];
  movementReasons: MovementReason[];
  brands: Brand[];
}

const defaultInvSettings: InventorySettingsData = {
  lowStockAlert: true,
  autoReorder: false,
  defaultTaxRate: "20",
  stockValuation: "FIFO",
  labelFormat: "40x20",
  barcodeType: "CODE128",
  categories: [
    { id: "1", name: "OPTIK_CERCEVE", color: "blue", isActive: true, taxRate: "10" },
    { id: "2", name: "GUNES_GOZLUGU", color: "amber", isActive: true, taxRate: "20" },
    { id: "3", name: "OPTIK_CAM", color: "purple", isActive: true, taxRate: "10" },
    { id: "4", name: "KONTAKT", color: "teal", isActive: false, taxRate: "20" },
  ],
  movementReasons: [
    { id: "1", name: "Tedarikçiden Alım", color: "emerald", type: "Giriş" },
    { id: "2", name: "Müşteriden İade", color: "cyan", type: "Giriş" },
    { id: "3", name: "Satış Çıkışı", color: "rose", type: "Çıkış 1" },
    { id: "4", name: "Fire / Zayiat", color: "amber", type: "Çıkış 2" },
    { id: "5", name: "Tedarikçiye İade", color: "fuchsia", type: "Çıkış 3" }
  ],
  brands: [
    { id: "1", name: "RAYBAN", color: "slate" },
    { id: "2", name: "PRADA", color: "slate" },
    { id: "3", name: "OSSE", color: "slate" },
  ]
};

export default function InventorySettings() {
  const [settings, setSettings] = useState<InventorySettingsData>(defaultInvSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modals
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState<Category>({ id: "", name: "", color: "blue", isActive: true, taxRate: "20" });
  
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonForm, setReasonForm] = useState<MovementReason>({ id: "", name: "", color: "emerald", type: "Giriş" });

  const [showBrandModal, setShowBrandModal] = useState(false);
  const [brandForm, setBrandForm] = useState<Brand>({ id: "", name: "", color: "slate" });

  useEffect(() => {
    fetch("/api/settings/inventory")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.inventorySettings) {
          // Merge with defaults if empty
          const s = data.inventorySettings;
          if (Object.keys(s).length > 0) {
            setSettings({ ...defaultInvSettings, ...s });
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventorySettings: settings })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Ayarlar başarıyla kaydedildi!");
      } else {
        toast.error("Hata: " + data.error);
      }
    } catch (err: any) {
      toast.error("Kaydedilirken hata oluştu");
    }
    setSaving(false);
  };

  const handleSaveCategory = () => {
    if (catForm.id) {
      setSettings({ ...settings, categories: settings.categories.map(c => c.id === catForm.id ? catForm : c) });
      toast.success("Kategori güncellendi!");
    } else {
      const newCat = { ...catForm, id: Math.random().toString(36).substr(2, 9) };
      setSettings({ ...settings, categories: [...settings.categories, newCat] });
      toast.success("Kategori eklendi!");
    }
    setShowCatModal(false);
  };

  const handleDeleteCategory = (id: string) => {
    if(!confirm("Kategoriyi silmek istediğinize emin misiniz?")) return;
    setSettings({ ...settings, categories: settings.categories.filter(c => c.id !== id) });
  };

  const handleSaveReason = () => {
    if (reasonForm.id) {
      setSettings({ ...settings, movementReasons: settings.movementReasons.map(r => r.id === reasonForm.id ? reasonForm : r) });
      toast.success("Sebep güncellendi!");
    } else {
      const newR = { ...reasonForm, id: Math.random().toString(36).substr(2, 9) };
      setSettings({ ...settings, movementReasons: [...settings.movementReasons, newR] });
      toast.success("Sebep eklendi!");
    }
    setShowReasonModal(false);
  };

  const handleDeleteReason = (id: string) => {
    if(!confirm("Sebebi silmek istediğinize emin misiniz?")) return;
    setSettings({ ...settings, movementReasons: settings.movementReasons.filter(r => r.id !== id) });
  };

  const handleSaveBrand = () => {
    if (brandForm.id) {
      setSettings({ ...settings, brands: settings.brands.map(b => b.id === brandForm.id ? brandForm : b) });
      toast.success("Marka güncellendi!");
    } else {
      const newB = { ...brandForm, id: Math.random().toString(36).substr(2, 9) };
      setSettings({ ...settings, brands: [...(settings.brands || []), newB] });
      toast.success("Marka eklendi!");
    }
    setShowBrandModal(false);
  };

  const handleDeleteBrand = (id: string) => {
    if(!confirm("Markayı silmek istediğinize emin misiniz?")) return;
    setSettings({ ...settings, brands: settings.brands.filter(b => b.id !== id) });
  };

  const handleToggleCategory = (id: string, isActive: boolean) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, isActive } : c)
    }));
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Yükleniyor...</div>;

  return (
    <div className="page-container animate-in fade-in slide-in-from-bottom-2 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Envanter ve Depo Ayarları
        </h2>
        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2">
          {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </button>
      </div>
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
        <div className="card p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl flex flex-col">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Genel Depo Ayarları</h3>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6 flex-1 w-full max-w-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Kritik Stok Uyarısı</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Ürünler limitin altına düştüğünde uyar</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.lowStockAlert} onChange={e => setSettings({...settings, lowStockAlert: e.target.checked})} />
                <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Otomatik Tedarik Siparişi</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Kritik stokları taslak siparişe ekle</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.autoReorder} onChange={e => setSettings({...settings, autoReorder: e.target.checked})} />
                <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Varsayılan KDV Oranı (%)</label>
              <select value={settings.defaultTaxRate} onChange={e => setSettings({...settings, defaultTaxRate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="20">%20</option>
                <option value="10">%10</option>
                <option value="1">%1</option>
                <option value="0">Muaf</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Stok Değerleme Yöntemi</label>
              <select value={settings.stockValuation} onChange={e => setSettings({...settings, stockValuation: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="FIFO">FIFO (İlk Giren İlk Çıkar)</option>
                <option value="LIFO">LIFO (Son Giren İlk Çıkar)</option>
                <option value="AVCO">Ağırlıklı Ortalama (AVCO)</option>
              </select>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Etiket Boyutu (mm)</label>
              <select value={settings.labelFormat || "40x20"} onChange={e => setSettings({...settings, labelFormat: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="40x20">40x20 mm (Standart Raf)</option>
                <option value="50x30">50x30 mm (Kutu Etiketi)</option>
                <option value="80x40">80x40 mm (Geniş Etiket)</option>
                <option value="100x100">100x100 mm (Kargo)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Barkod Formatı</label>
              <select value={settings.barcodeType || "CODE128"} onChange={e => setSettings({...settings, barcodeType: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="CODE128">CODE 128 (Genel Geçer)</option>
                <option value="EAN13">EAN-13 (Perakende Standart)</option>
                <option value="QR">QR Kod (2D Matris)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="card p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl flex flex-col">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Kategori Yönetimi</h3>
          <div className="space-y-2 flex-1">
            {settings.categories.map(cat => {
              const dStyle = getDynamicStyle(cat.color, cat.isActive);
              return (
                <div key={cat.id} style={dStyle.container} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${cat.isActive ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'} p-3 rounded-xl border ${!cat.isActive ? 'border-slate-200 dark:border-slate-700' : ''} group hover:shadow-sm transition-all`}>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 w-40">
                      <div style={dStyle.dot} className={`w-3 h-3 rounded-full ${cat.isActive ? '' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                      <span className={`text-[13px] font-bold ${cat.isActive ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>{cat.name}</span>
                    </div>
                    <div className="w-24">
                      {cat.taxRate && (
                        <span style={dStyle.text} className={`text-[10px] font-black ${cat.isActive ? '' : 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'} px-2.5 py-1 rounded-md border whitespace-nowrap`}>
                          % {cat.taxRate} KDV
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 sm:gap-4 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-100 dark:border-slate-800 sm:border-0">
                    <label className="relative inline-flex items-center cursor-pointer w-20 justify-end mr-auto sm:mr-0">
                      <span className="mr-2 text-[10px] font-bold text-slate-500 whitespace-nowrap">{cat.isActive ? 'Aktif' : 'Pasif'}</span>
                      <input type="checkbox" className="sr-only peer" checked={cat.isActive} onChange={e => handleToggleCategory(cat.id, e.target.checked)} />
                      <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                    </label>
                    <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setCatForm(cat); setShowCatModal(true); }} className="w-8 h-8 sm:w-auto sm:h-auto sm:p-1 bg-slate-100 dark:bg-slate-800 sm:bg-transparent rounded-lg sm:rounded-none text-slate-400 hover:text-blue-500 hover:bg-blue-50 sm:hover:bg-transparent transition-colors flex items-center justify-center"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="w-8 h-8 sm:w-auto sm:h-auto sm:p-1 bg-rose-50 dark:bg-rose-500/10 sm:bg-transparent rounded-lg sm:rounded-none text-rose-500 sm:text-slate-400 hover:text-rose-600 hover:bg-rose-100 sm:hover:bg-transparent transition-colors flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => {
            setCatForm({ id: "", name: "", color: "blue", isActive: true, taxRate: "20" });
            setShowCatModal(true);
          }} className="w-full mt-4 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-500 hover:text-primary hover:border-primary/50 transition-colors">
            + Yeni Kategori Ekle
          </button>
        </div>

        <div className="card p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl flex flex-col">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Marka Yönetimi</h3>
          <div className="space-y-2 flex-1">
            {(settings.brands || []).map(b => {
              const dStyle = getDynamicStyle(b.color, true);
              return (
                <div key={b.id} style={dStyle.container} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border group hover:shadow-sm transition-all`}>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 w-40">
                      <div style={dStyle.dot} className={`w-3 h-3 rounded-full`}></div>
                      <span className={`text-[13px] font-bold text-slate-800 dark:text-slate-200`}>{b.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 sm:gap-4 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-100 dark:border-slate-800 sm:border-0">
                    <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button onClick={() => { setBrandForm(b); setShowBrandModal(true); }} className="flex-1 sm:flex-none w-10 h-10 sm:w-auto sm:h-auto sm:p-1 bg-slate-100 dark:bg-slate-800 sm:bg-transparent rounded-lg sm:rounded-none text-slate-500 sm:text-slate-400 hover:text-blue-500 hover:bg-blue-50 sm:hover:bg-transparent transition-colors flex items-center justify-center"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteBrand(b.id)} className="flex-1 sm:flex-none w-10 h-10 sm:w-auto sm:h-auto sm:p-1 bg-rose-50 dark:bg-rose-500/10 sm:bg-transparent rounded-lg sm:rounded-none text-rose-500 sm:text-slate-400 hover:text-rose-600 hover:bg-rose-100 sm:hover:bg-transparent transition-colors flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => {
            setBrandForm({ id: "", name: "", color: "slate" });
            setShowBrandModal(true);
          }} className="w-full mt-4 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-500 hover:text-primary hover:border-primary/50 transition-colors">
            + Yeni Marka Ekle
          </button>
        </div>

        <div className="card p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl flex flex-col">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Hareket Sebepleri Yönetimi</h3>
          <div className="space-y-2 flex-1">
            {settings.movementReasons.map(r => {
              const dStyle = getDynamicStyle(r.color, true);
              return (
                <div key={r.id} style={dStyle.container} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border group hover:shadow-sm transition-all`}>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 w-40">
                      <div style={dStyle.dot} className={`w-3 h-3 rounded-full`}></div>
                      <span className={`text-[13px] font-bold text-slate-800 dark:text-slate-200`}>{r.name}</span>
                    </div>
                    <div className="w-24">
                      <span style={dStyle.text} className={`text-[10px] font-black px-2.5 py-1 rounded-md border whitespace-nowrap`}>
                        {r.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 sm:gap-4 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-100 dark:border-slate-800 sm:border-0">
                    <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button onClick={() => { setReasonForm(r); setShowReasonModal(true); }} className="flex-1 sm:flex-none w-10 h-10 sm:w-auto sm:h-auto sm:p-1 bg-slate-100 dark:bg-slate-800 sm:bg-transparent rounded-lg sm:rounded-none text-slate-500 sm:text-slate-400 hover:text-blue-500 hover:bg-blue-50 sm:hover:bg-transparent transition-colors flex items-center justify-center"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteReason(r.id)} className="flex-1 sm:flex-none w-10 h-10 sm:w-auto sm:h-auto sm:p-1 bg-rose-50 dark:bg-rose-500/10 sm:bg-transparent rounded-lg sm:rounded-none text-rose-500 sm:text-slate-400 hover:text-rose-600 hover:bg-rose-100 sm:hover:bg-transparent transition-colors flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => {
            setReasonForm({ id: "", name: "", color: "emerald", type: "Giriş" });
            setShowReasonModal(true);
          }} className="w-full mt-4 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-500 hover:text-primary hover:border-primary/50 transition-colors">
            + Yeni Sebep Ekle
          </button>
        </div>
      </div>

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-surface border border-border-color shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-border-color flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-foreground">{catForm.id ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}</h3>
              <button onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Kategori Adı</label>
                <input type="text" autoFocus value={catForm.name} onChange={e=>setCatForm({...catForm, name: e.target.value.toUpperCase()})} placeholder="Örn: YENI_KATEGORI" className="w-full px-3 py-2 bg-background border border-border-color rounded-lg text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">KDV Oranı (%)</label>
                  <select value={catForm.taxRate || "20"} onChange={e=>setCatForm({...catForm, taxRate: e.target.value})} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg text-sm focus:outline-none focus:border-primary">
                    <option value="20">%20</option>
                    <option value="10">%10</option>
                    <option value="1">%1</option>
                    <option value="0">Muaf (0)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Renk Teması</label>
                  <div className="flex items-center gap-3 pt-1">
                    <input type="color" value={getHex(catForm.color)} onChange={e => setCatForm({...catForm, color: e.target.value})} className="w-12 h-10 p-1 rounded-lg cursor-pointer bg-background border border-border-color" />
                    <span className="text-xs text-slate-500 font-medium">Özel Renk Seç</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="catStatus" checked={catForm.isActive} onChange={e=>setCatForm({...catForm, isActive: e.target.checked})} className="rounded text-primary w-4 h-4 cursor-pointer" />
                <label htmlFor="catStatus" className="text-sm font-semibold cursor-pointer">Aktif olarak kullanılsın</label>
              </div>
              <button onClick={handleSaveCategory} disabled={!catForm.name} className="w-full py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 mt-2">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-surface border border-border-color shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-border-color flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-foreground">{reasonForm.id ? "Sebebi Düzenle" : "Yeni Hareket Sebebi"}</h3>
              <button onClick={() => setShowReasonModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Sebep Adı</label>
                <input type="text" autoFocus value={reasonForm.name} onChange={e=>setReasonForm({...reasonForm, name: e.target.value})} placeholder="Örn: Müşteri İadesi" className="w-full px-3 py-2 bg-background border border-border-color rounded-lg text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Yön (Tür)</label>
                  <select value={reasonForm.type} onChange={e=>setReasonForm({...reasonForm, type: e.target.value})} className="w-full px-3 py-2 bg-background border border-border-color rounded-lg text-sm focus:outline-none focus:border-primary">
                    <option value="Giriş">Stok Girişi</option>
                    <option value="Çıkış 1">Stok Çıkışı</option>
                    <option value="Çıkış 2">Fire / Zayiat</option>
                    <option value="Çıkış 3">İade Çıkışı</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Renk Teması</label>
                  <div className="flex items-center gap-3 pt-1">
                    <input type="color" value={getHex(reasonForm.color)} onChange={e => setReasonForm({...reasonForm, color: e.target.value})} className="w-12 h-10 p-1 rounded-lg cursor-pointer bg-background border border-border-color" />
                    <span className="text-xs text-slate-500 font-medium">Özel Renk Seç</span>
                  </div>
                </div>
              </div>
              <button onClick={handleSaveReason} disabled={!reasonForm.name} className="w-full py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 mt-2">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-surface border border-border-color shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-border-color flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-foreground">{brandForm.id ? "Markayı Düzenle" : "Yeni Marka Ekle"}</h3>
              <button onClick={() => setShowBrandModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Marka Adı</label>
                <input type="text" autoFocus value={brandForm.name} onChange={e=>setBrandForm({...brandForm, name: e.target.value.toUpperCase()})} placeholder="Örn: RAYBAN" className="w-full px-3 py-2 bg-background border border-border-color rounded-lg text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Renk Teması</label>
                <div className="flex items-center gap-3 pt-1">
                  <input type="color" value={getHex(brandForm.color)} onChange={e => setBrandForm({...brandForm, color: e.target.value})} className="w-12 h-10 p-1 rounded-lg cursor-pointer bg-background border border-border-color" />
                  <span className="text-xs text-slate-500 font-medium">Özel Renk Seç</span>
                </div>
              </div>
              <button onClick={handleSaveBrand} disabled={!brandForm.name} className="w-full py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 mt-2">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
