"use client";

import { useState, useEffect } from "react";
import { Search, Download, FileText, CheckCircle2, AlertCircle, Receipt, Settings2, Key, Building, Check, Power, Filter, X, Edit3, Loader2, Bot, Server, ShieldCheck, Send } from "lucide-react";

type InvoiceItemDetails = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

type InvoiceItem = {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  type: string;
  totalAmount: number;
  taxAmount: number;
  status: string;
  gibNo: string | null;
  source: string;
  items: InvoiceItemDetails[];
};

type SimulationState = {
  step: number;
  message: string;
  visible: boolean;
};

export default function EfaturaClient({ initialInvoices }: { initialInvoices: InvoiceItem[] }) {
  const [activeTab, setActiveTab] = useState<"invoices" | "settings">("invoices");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  
  const [invoices, setInvoices] = useState<InvoiceItem[]>(initialInvoices);

  // Draft Editor Modal State
  const [editingInvoice, setEditingInvoice] = useState<InvoiceItem | null>(null);
  
  // Settings State
  const [isModuleActive, setIsModuleActive] = useState(false);
  const [isAutoBillingActive, setIsAutoBillingActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSettings, setSavedSettings] = useState(false);

  // Auto-billing simulation
  const [autoBillNotification, setAutoBillNotification] = useState<string | null>(null);

  // Advanced Processing Simulation State
  const [simulation, setSimulation] = useState<SimulationState>({ step: 0, message: "", visible: false });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoBillingActive && isModuleActive) {
      interval = setInterval(() => {
        // Find a pending invoice
        const pending = invoices.find(i => i.status === "Bekliyor");
        if (pending) {
          setInvoices(prev => prev.map(inv => {
            if (inv.id === pending.id) {
              return {
                ...inv,
                status: "Kesildi (GİB Onaylı)",
                gibNo: `GIB${new Date().getFullYear()}${Math.floor(Math.random() * 900000) + 100000}`
              };
            }
            return inv;
          }));
          setAutoBillNotification(`Otomasyon: ${pending.source} siparixi (${pending.orderNumber}) için otomatik fatura kesildi.`);
          setTimeout(() => setAutoBillNotification(null), 4000);
        }
      }, 8000); // Check every 8 seconds for simulation
    }
    return () => clearInterval(interval);
  }, [isAutoBillingActive, isModuleActive, invoices]);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (inv.gibNo && inv.gibNo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    if (statusFilter === "kesildi") matchesStatus = inv.status.includes("Kesildi");
    else if (statusFilter !== "all") matchesStatus = inv.status === statusFilter;

    let matchesSource = true;
    if (sourceFilter !== "all") matchesSource = inv.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const runSimulation = (onComplete: () => void) => {
    setSimulation({ visible: true, step: 1, message: "GİB Portalına girix yapılıyor (Token alınıyor)..." });
    
    setTimeout(() => {
      setSimulation({ visible: true, step: 2, message: "Fatura bilgileri GİB formatına çevriliyor..." });
      
      setTimeout(() => {
        setSimulation({ visible: true, step: 3, message: "GİB Portalına taslak olarak aktarılıyor..." });
        
        setTimeout(() => {
          setSimulation({ visible: true, step: 4, message: "İxlem kontrol ediliyor..." });
          
          setTimeout(() => {
            setSimulation({ visible: true, step: 5, message: "Fatura baxarıyla GİB'de oluxturuldu!" });
            
            setTimeout(() => {
              onComplete();
              setSimulation({ visible: false, step: 0, message: "" });
            }, 1000);
            
          }, 1500);
        }, 1500);
      }, 1500);
    }, 1000);
  };

  const handleCreateInvoice = (id: string) => {
    if (!isModuleActive) {
      alert("Lütfen önce Entegrasyon Ayarları kısmından modülü aktiflextirin.");
      return;
    }
    
    runSimulation(() => {
      setInvoices(prev => prev.map(inv => {
        if (inv.id === id) {
          return {
            ...inv,
            status: "Kesildi (GİB Onaylı)",
            gibNo: `GIB${new Date().getFullYear()}${Math.floor(Math.random() * 900000) + 100000}`
          };
        }
        return inv;
      }));
      setEditingInvoice(null);
    });
  };

  const handleBulkCreate = () => {
    if (!isModuleActive) {
      alert("Lütfen önce Entegrasyon Ayarları kısmından modülü aktiflextirin.");
      return;
    }
    
    runSimulation(() => {
      setInvoices(prev => prev.map(inv => {
        if (inv.status === "Bekliyor") {
          return {
            ...inv,
            status: "Kesildi (GİB Onaylı)",
            gibNo: `GIB${new Date().getFullYear()}${Math.floor(Math.random() * 900000) + 100000}`
          };
        }
        return inv;
      }));
    });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSettings(true);
      setTimeout(() => setSavedSettings(false), 3000);
    }, 1200);
  };

  const handleItemUpdate = (index: number, field: keyof InvoiceItemDetails, value: string | number) => {
    if (!editingInvoice) return;
    const updatedItems = [...editingInvoice.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate totals
    const newTotal = updatedItems.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0);
    const newTax = updatedItems.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice) * (Number(item.taxRate) / 100)), 0);

    setEditingInvoice({
      ...editingInvoice,
      items: updatedItems,
      totalAmount: newTotal + newTax,
      taxAmount: newTax
    });
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Simulation Overlay (Multi-step realist simulation) */}
      {simulation.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-8 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-95">
            <div className="relative mb-6">
              {simulation.step === 5 ? (
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 animate-in zoom-in">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              ) : (
                <div className="w-20 h-20 relative flex items-center justify-center">
                  <svg className="animate-spin text-blue-500 w-20 h-20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                    {simulation.step === 1 && <Server className="w-8 h-8" />}
                    {simulation.step === 2 && <FileText className="w-8 h-8" />}
                    {simulation.step === 3 && <ShieldCheck className="w-8 h-8" />}
                    {simulation.step === 4 && <Send className="w-8 h-8" />}
                  </div>
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">İxlem Yürütülüyor</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 min-h-[40px]">{simulation.message}</p>
            
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-6 overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${(simulation.step / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-billing Notification Toast */}
      {autoBillNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-8 fade-in flex items-center gap-3 px-4 py-3 bg-slate-900 dark:bg-emerald-900 border border-slate-700 dark:border-emerald-700 text-white rounded-xl shadow-2xl">
          <Bot className="w-5 h-5 text-emerald-400 animate-bounce" />
          <p className="text-sm font-semibold">{autoBillNotification}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('invoices')} 
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'invoices' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <FileText className="w-4 h-4" /> Faturalar & Kayıtlar
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Settings2 className="w-4 h-4" /> GİB & Otomasyon Ayarları
        </button>
      </div>

      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Power className="w-5 h-5 text-blue-500" />
                Müxteri E-Fatura Modülü
              </h2>
              <p className="text-sm text-slate-500 mt-1">Bu firmaya e-Fatura kesme yetkisini tanımlayın ve entegratör bilgilerini girin.</p>
            </div>
            
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 pl-2">Modül Durumu:</span>
              <button 
                onClick={() => setIsModuleActive(!isModuleActive)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isModuleActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isModuleActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${isModuleActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'}`}>
                {isModuleActive ? 'AKTİF' : 'PASİF'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <Building className="w-4 h-4 text-slate-400" /> Firma Resmi Bilgileri
                </h3>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Vergi Numarası (VKN) / TCKN</label>
                  <input type="text" defaultValue="1234567890" disabled={!isModuleActive} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Vergi Dairesi</label>
                  <input type="text" defaultValue="Zincirlikuyu V.D." disabled={!isModuleActive} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Mersis No</label>
                  <input type="text" defaultValue="0123456789000015" disabled={!isModuleActive} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <Key className="w-4 h-4 text-slate-400" /> GİB E-Arxiv Portal Bağlantısı
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">GİB Kullanıcı Kodu (İnteraktif VD)</label>
                  <input type="text" defaultValue="33445566" disabled={!isModuleActive} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">GİB Şifresi</label>
                  <input type="password" defaultValue="*****************" disabled={!isModuleActive} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50" />
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <Bot className="w-4 h-4 text-emerald-500" /> Otomasyon Kuralları (Auto-Billing)
                </h3>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button 
                    type="button"
                    disabled={!isModuleActive}
                    onClick={() => setIsAutoBillingActive(!isAutoBillingActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${isAutoBillingActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAutoBillingActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Tam Otomatik Kesim</p>
                    <p className="text-xs text-slate-500 mt-1">Trendyol, Shopify veya B2B üzerinden yeni bir siparix onayı geldiğinde faturayı anında resmilextir ve müxteriye gönder.</p>
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center gap-4">
              {savedSettings && (
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Ayarlar Kaydedildi
                </span>
              )}
              <button 
                type="submit"
                disabled={!isModuleActive || isSaving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                {isSaving ? "Kaydediliyor..." : <><Check className="w-4 h-4" /> Bilgileri Kaydet ve Test Et</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'invoices' && (
        <>
          {/* Action Bar */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Siparix no, müxteri veya GİB no ara..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                <Filter className="w-4 h-4 text-slate-400" />
                <select 
                  className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                >
                  <option value="all">Tüm Kaynaklar</option>
                  <option value="Trendyol">Trendyol</option>
                  <option value="Shopify">Shopify</option>
                  <option value="Hepsiburada">Hepsiburada</option>
                  <option value="SentientWire B2B">B2B Platform</option>
                </select>
              </div>

              <select 
                className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tüm Durumlar</option>
                <option value="Bekliyor">Bekleyenler</option>
                <option value="kesildi">Kesilenler (GİB Onaylı)</option>
                <option value="İptal Edildi">İptal Edilenler</option>
              </select>
              
              <button 
                onClick={handleBulkCreate}
                disabled={simulation.visible || !invoices.some(i => i.status === "Bekliyor")}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20 w-full md:w-auto cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{simulation.visible ? "İxleniyor..." : "Bekleyenleri Toplu Kes"}</span>
              </button>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Tarih / Kaynak</th>
                    <th className="px-6 py-4 font-semibold">Müxteri / Fatura Tipi</th>
                    <th className="px-6 py-4 font-semibold">Toplam (KDV Dahil)</th>
                    <th className="px-6 py-4 font-semibold">Durum / GİB No</th>
                    <th className="px-6 py-4 font-semibold text-right">İxlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono text-slate-900 dark:text-white font-medium mb-1">{item.orderNumber}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString('tr-TR')}</span>
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              {item.source}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white mb-1">{item.customerName}</div>
                          <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${
                            item.type === "E-Fatura" 
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" 
                              : "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20"
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.totalAmount)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            KDV: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.taxAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {item.status.includes("Kesildi") ? (
                            <div>
                              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs mb-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                GİB Onaylı
                              </div>
                              <div className="font-mono text-xs text-slate-500">{item.gibNo}</div>
                            </div>
                          ) : item.status === "Bekliyor" ? (
                            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Fatura Kesilecek
                            </div>
                          ) : (
                            <span className="text-slate-500 font-medium">{item.status}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.status === "Bekliyor" ? (
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setEditingInvoice(item)}
                                disabled={simulation.visible}
                                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> İncele / Düzenle
                              </button>
                              <button 
                                onClick={() => handleCreateInvoice(item.id)}
                                disabled={simulation.visible}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Kes
                              </button>
                            </div>
                          ) : item.status.includes("Kesildi") ? (
                            <button className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors tooltip-trigger" title="PDF İndir">
                              <Download className="w-5 h-5 inline-block" />
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p className="text-base font-medium text-slate-900 dark:text-white">Fatura Bulunamadı</p>
                        <p className="text-sm mt-1">Arama kriterlerinize uygun e-Fatura veya e-Arxiv kaydı yok.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Edit Draft Modal */}
      {editingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-md">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-500" />
                  Fatura İncele ve Düzenle
                </h3>
                <p className="text-sm text-slate-500 mt-1">Siparix No: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{editingInvoice.orderNumber}</span> ({editingInvoice.source})</p>
              </div>
              <button onClick={() => setEditingInvoice(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 space-y-6">
              
              <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Fatura Kesilecek Cari Unvanı</label>
                  <input type="text" value={editingInvoice.customerName} onChange={(e) => setEditingInvoice({...editingInvoice, customerName: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Vergi Numarası / TCKN</label>
                  <input type="text" defaultValue="11111111111" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Fatura Kalemleri (Hizmet/Ürünler)</h4>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Hizmet / Ürün Adı</th>
                        <th className="px-4 py-3 font-semibold w-24">Miktar</th>
                        <th className="px-4 py-3 font-semibold w-32">Birim Fiyat</th>
                        <th className="px-4 py-3 font-semibold w-24">KDV Oranı</th>
                        <th className="px-4 py-3 font-semibold text-right w-32">Satır Toplamı</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {editingInvoice.items.map((item, idx) => (
                        <tr key={item.id} className="bg-white dark:bg-[#1E293B]">
                          <td className="px-4 py-3">
                            <input type="text" value={item.name} onChange={(e) => handleItemUpdate(idx, 'name', e.target.value)} className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1" />
                          </td>
                          <td className="px-4 py-3">
                            <input type="number" value={item.quantity} onChange={(e) => handleItemUpdate(idx, 'quantity', Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono" />
                          </td>
                          <td className="px-4 py-3">
                            <input type="number" value={item.unitPrice} onChange={(e) => handleItemUpdate(idx, 'unitPrice', Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono" />
                          </td>
                          <td className="px-4 py-3">
                            <select value={item.taxRate} onChange={(e) => handleItemUpdate(idx, 'taxRate', Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                              <option value={0}>%0</option>
                              <option value={1}>%1</option>
                              <option value={10}>%10</option>
                              <option value={20}>%20</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format((item.quantity * item.unitPrice) * (1 + (item.taxRate/100)))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Ara Toplam</span>
                    <span className="font-mono">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(editingInvoice.totalAmount - editingInvoice.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Hesaplanan KDV</span>
                    <span className="font-mono">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(editingInvoice.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 dark:text-white font-bold text-lg pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Genel Toplam</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(editingInvoice.totalAmount)}</span>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setEditingInvoice(null)} className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                İptal Et
              </button>
              <button onClick={() => {
                setInvoices(prev => prev.map(inv => inv.id === editingInvoice.id ? editingInvoice : inv));
                setEditingInvoice(null);
              }} className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                Değixiklikleri Kaydet
              </button>
              <button 
                onClick={() => handleCreateInvoice(editingInvoice.id)}
                disabled={simulation.visible}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Bu Haliyle Resmilextir ve Kes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
