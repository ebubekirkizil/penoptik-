"use client";

import { useState } from "react";
import { Truck, Package, CheckCircle2, ShieldCheck, Link2, X, Loader2, Printer, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CargoCompany {
  id: string;
  name: string;
  icon: string;
  status: "Aktif" | "Pasif";
  lastBarcode?: string;
  todayShipments?: number;
}

export default function ShippingClient() {
  const [companies, setCompanies] = useState<CargoCompany[]>([
    {
      id: "yurtici",
      name: "Yurtiçi Kargo",
      icon: "https://yurticikargo.com/Content/theme/img/yurtici-kargo-logo.png",
      status: "Pasif",
    },
    {
      id: "aras",
      name: "Aras Kargo",
      icon: "https://www.araskargo.com.tr/assets/img/logo.png",
      status: "Pasif",
    },
    {
      id: "mng",
      name: "MNG Kargo",
      icon: "https://www.mngkargo.com.tr/Content/Images/mng-logo-yeni.png",
      status: "Pasif",
    },
    {
      id: "sendeo",
      name: "Sendeo",
      icon: "https://sendeo.com.tr/assets/img/logo.svg",
      status: "Pasif",
    },
    {
      id: "ptt",
      name: "PTT Kargo",
      icon: "https://upload.wikimedia.org/wikipedia/tr/6/69/Ptt_logo.png",
      status: "Pasif",
    }
  ]);

  const [selectedCompany, setSelectedCompany] = useState<CargoCompany | null>(null);
  
  // Connection Simulation State
  const [connSimulation, setConnSimulation] = useState({
    visible: false,
    step: 0,
    message: ""
  });

  // Barcode Generation Simulation State
  const [barcodeSimulation, setBarcodeSimulation] = useState({
    visible: false,
    step: 0,
    message: ""
  });

  const handleConnect = () => {
    if (!selectedCompany) return;

    setConnSimulation({ visible: true, step: 1, message: `${selectedCompany.name} Web Servislerine Bağlanılıyor...` });
    
    setTimeout(() => {
      setConnSimulation({ visible: true, step: 2, message: "Müxteri Kodu ve API Şifresi Doğrulanıyor..." });
      
      setTimeout(() => {
        setConnSimulation({ visible: true, step: 3, message: "Barkod Şablonları İndiriliyor..." });
        
        setTimeout(() => {
          setConnSimulation({ visible: true, step: 4, message: "Canlı Kargo Takip Webhookları Kuruluyor..." });
          
          setTimeout(() => {
            setConnSimulation({ visible: true, step: 5, message: "Entegrasyon Baxarıyla Tamamlandı!" });
            
            setTimeout(() => {
              setCompanies(companies.map(c => 
                c.id === selectedCompany.id 
                ? { ...c, status: "Aktif", lastBarcode: "Az Önce", todayShipments: Math.floor(Math.random() * 50) + 10 } 
                : c
              ));
              setConnSimulation({ visible: false, step: 0, message: "" });
              setSelectedCompany(null);
            }, 1000);
            
          }, 1500);
        }, 1500);
      }, 1500);
    }, 1000);
  };

  const handleCreateBarcode = () => {
    setBarcodeSimulation({ visible: true, step: 1, message: "Pazaryeri Siparixi Çekiliyor (#TRD-98231)..." });
    
    setTimeout(() => {
      setBarcodeSimulation({ visible: true, step: 2, message: "Müxteri Adres ve Desi Bilgileri Hesaplanıyor..." });
      
      setTimeout(() => {
        setBarcodeSimulation({ visible: true, step: 3, message: "Kargo Firmasına İletiliyor (Takip No Alınıyor)..." });
        
        setTimeout(() => {
          setBarcodeSimulation({ visible: true, step: 4, message: "Barkod (ZPL) Etiketi Oluxturuluyor..." });
          
          setTimeout(() => {
            setBarcodeSimulation({ visible: true, step: 5, message: "Barkod Yazıcıya Gönderildi!" });
            
            setTimeout(() => {
              setBarcodeSimulation({ visible: false, step: 0, message: "" });
            }, 2000);
            
          }, 1500);
        }, 1500);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/super-admin/features" className="hover:text-teal-600 transition-colors">Modüller</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-300 font-medium">Kargo & Lojistik</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Truck className="w-8 h-8 text-teal-500" />
            Kargo Entegrasyonları
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Siparixlerinizi tek tuxla kargoya verin, barkod yazdırın ve kargo hareketlerini müxterilerinize SMS ile bildirin.
          </p>
        </div>
        
        {companies.some(c => c.status === "Aktif") && (
          <button 
            onClick={handleCreateBarcode}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/30 flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Örnek Barkod Yazdır (Test)
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div 
            key={company.id} 
            className={`relative bg-white dark:bg-[#1E293B] border ${company.status === 'Aktif' ? 'border-teal-500/50 dark:border-teal-500/30 shadow-teal-500/10' : 'border-slate-200 dark:border-slate-800'} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 overflow-hidden`}
          >
            {company.status === 'Aktif' && (
              <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                Bağlı
              </div>
            )}
            
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden p-2">
                <img src={company.icon} alt={company.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{company.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Web Servis (API)</p>
              </div>
            </div>

            {company.status === "Aktif" ? (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Son Barkod</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{company.lastBarcode}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Bugün Kargolanan</span>
                  <span className="font-semibold text-teal-600 dark:text-teal-400">{company.todayShipments} Paket</span>
                </div>
                <button 
                  onClick={() => {
                    setCompanies(companies.map(c => c.id === company.id ? { ...c, status: "Pasif" } : c));
                  }}
                  className="w-full mt-2 py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  Bağlantıyı Kopar
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setSelectedCompany(company)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Link2 className="w-4 h-4" /> Entegrasyonu Kur
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Connection Modal */}
      {selectedCompany && !connSimulation.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-1.5 flex items-center justify-center">
                   <img src={selectedCompany.icon} alt="icon" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCompany.name} API</h3>
              </div>
              <button onClick={() => setSelectedCompany(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 p-4 rounded-xl text-sm mb-6 flex gap-3 items-start">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <p>Kargo firması tarafından size verilen Müxteri Kodu ve API xifresini giriniz.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Kurumsal Müxteri Kodu</label>
                <input type="text" placeholder="Örn: 987654321" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">API Kullanıcı Adı</label>
                <input type="text" placeholder="api_user" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">API Şifresi</label>
                <input type="password" placeholder="******************" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => setSelectedCompany(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">İptal</button>
              <button onClick={handleConnect} className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/30">
                Sına ve Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Simulation Overlay */}
      {connSimulation.visible && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="text-center">
            {connSimulation.step === 5 ? (
              <div className="w-24 h-24 mx-auto bg-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            ) : (
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-teal-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-teal-500 animate-pulse" />
                </div>
              </div>
            )}
            
            <h2 className="text-2xl font-bold text-white mb-2">{connSimulation.message}</h2>
            
            <div className="flex justify-center gap-2 mt-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    i < connSimulation.step ? 'bg-emerald-500' : 
                    i === connSimulation.step ? 'bg-teal-500 scale-150' : 
                    'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Barcode Creation Simulation Overlay */}
      {barcodeSimulation.visible && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
            {/* Fake Barcode scanning effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="w-full h-1 bg-red-500 shadow-[0_0_20px_red] animate-[scan_2s_ease-in-out_infinite]" />
            </div>
            
            <div className="w-20 h-20 bg-teal-100 dark:bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              {barcodeSimulation.step === 5 ? (
                <Printer className="w-10 h-10 text-teal-600 dark:text-teal-400 animate-bounce" />
              ) : (
                <Package className="w-10 h-10 text-teal-600 dark:text-teal-400 animate-pulse" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Barkod Operasyonu
            </h2>
            
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
              <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">
                {barcodeSimulation.message}
              </p>
            </div>
            
            <div className="space-y-3">
              {[
                "Siparix Verisi Çekildi", 
                "Adres ve Desi Doğrulandı", 
                "Kargo API İletiximi", 
                "ZPL Etiket Oluxturuldu", 
                "Yazdırıldı"
              ].map((label, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                    barcodeSimulation.step > index + 1 ? 'bg-emerald-500 text-white' :
                    barcodeSimulation.step === index + 1 ? 'bg-teal-500 text-white animate-pulse' :
                    'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {barcodeSimulation.step > index + 1 ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className={`font-medium ${
                    barcodeSimulation.step > index ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                  }`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
