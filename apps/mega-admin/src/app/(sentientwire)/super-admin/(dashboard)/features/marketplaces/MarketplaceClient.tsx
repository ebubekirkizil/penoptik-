"use client";

import { useState } from "react";
import { Store, ShoppingBag, CheckCircle2, ShieldCheck, Link2, X, Loader2 } from "lucide-react";
import Link from "next/link";

interface Channel {
  id: string;
  name: string;
  type: "Pazaryeri" | "E-Ticaret Altyapısı" | "B2B";
  icon: string;
  status: "Aktif" | "Pasif";
  lastSync?: string;
  todayOrders?: number;
}

export default function MarketplaceClient() {
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: "impecta-b2b",
      name: "İMPECTA B2B & Wholesale",
      type: "B2B",
      icon: "https://cdn-icons-png.flaticon.com/512/2830/2830305.png",
      status: "Aktif",
      lastSync: "Şimdi",
      todayOrders: 5,
    },
    {
      id: "trendyol",
      name: "Trendyol",
      type: "Pazaryeri",
      icon: "https://cdn.icon-icons.com/icons2/3914/PNG/512/trendyol_logo_icon_248694.png",
      status: "Pasif",
    },
    {
      id: "shopify",
      name: "Shopify",
      type: "E-Ticaret Altyapısı",
      icon: "https://cdn3.iconfinder.com/data/icons/social-media-2068/64/_shopping-512.png",
      status: "Pasif",
    },
    {
      id: "hepsiburada",
      name: "Hepsiburada",
      type: "Pazaryeri",
      icon: "https://cdn-icons-png.flaticon.com/512/3082/3082823.png",
      status: "Pasif",
    },
    {
      id: "woocommerce",
      name: "WooCommerce",
      type: "E-Ticaret Altyapısı",
      icon: "https://cdn-icons-png.flaticon.com/512/5968/5968804.png",
      status: "Pasif",
    }
  ]);

  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  
  // Simulation State
  const [simulation, setSimulation] = useState({
    visible: false,
    step: 0,
    message: ""
  });

  const handleConnect = () => {
    if (!selectedChannel) return;

    setSimulation({ visible: true, step: 1, message: `${selectedChannel.name} API'ye Bağlanılıyor...` });
    
    setTimeout(() => {
      setSimulation({ visible: true, step: 2, message: "API Anahtarları Doğrulanıyor..." });
      
      setTimeout(() => {
        setSimulation({ visible: true, step: 3, message: "Geçmix Siparixler Senkronize Ediliyor..." });
        
        setTimeout(() => {
          setSimulation({ visible: true, step: 4, message: "Katalog ve Stoklar Exitleniyor..." });
          
          setTimeout(() => {
            setSimulation({ visible: true, step: 5, message: "Bağlantı Baxarılı!" });
            
            setTimeout(() => {
              setChannels(channels.map(c => 
                c.id === selectedChannel.id 
                ? { ...c, status: "Aktif", lastSync: "Az Önce", todayOrders: Math.floor(Math.random() * 20) + 1 } 
                : c
              ));
              setSimulation({ visible: false, step: 0, message: "" });
              setSelectedChannel(null);
            }, 1000);
            
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
            <Link href="/super-admin/features" className="hover:text-indigo-600 transition-colors">Modüller</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-300 font-medium">Pazaryeri & Satıx Kanalları</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Store className="w-8 h-8 text-fuchsia-500" />
            Satıx Kanalları Yönetimi
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Siparixlerinizi, stoklarınızı ve faturalarınızı tek merkezden yönetmek için mağazalarınızı İMPECTA'ya bağlayın.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {channels.map((channel) => (
          <div 
            key={channel.id} 
            className={`relative bg-white dark:bg-[#1E293B] border ${channel.status === 'Aktif' ? 'border-emerald-500/50 dark:border-emerald-500/30 shadow-emerald-500/10' : 'border-slate-200 dark:border-slate-800'} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 overflow-hidden`}
          >
            {channel.status === 'Aktif' && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                Bağlı
              </div>
            )}
            
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden p-2">
                <img src={channel.icon} alt={channel.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{channel.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{channel.type}</p>
              </div>
            </div>

            {channel.status === "Aktif" ? (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Son Senkronizasyon</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{channel.lastSync}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Çekilen Siparix</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{channel.todayOrders} Adet</span>
                </div>
                <button 
                  onClick={() => {
                    setChannels(channels.map(c => c.id === channel.id ? { ...c, status: "Pasif" } : c));
                  }}
                  className="w-full mt-2 py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  Bağlantıyı Kopar
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setSelectedChannel(channel)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Link2 className="w-4 h-4" /> Entegrasyonu Kur
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Connection Modal */}
      {selectedChannel && !simulation.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-1.5 flex items-center justify-center">
                   <img src={selectedChannel.icon} alt="icon" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedChannel.name} Bağlantısı</h3>
              </div>
              <button onClick={() => setSelectedChannel(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 p-4 rounded-xl text-sm mb-6 flex gap-3 items-start">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <p>Girdiğiniz API bilgileri İMPECTA HSM sunucularında uçtan uca xifrelenerek saklanır.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Satıcı ID / Mağaza ID</label>
                <input type="text" placeholder="Örn: 123456" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">API Key / Access Token</label>
                <input type="text" placeholder="******************" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Secret Key (Opsiyonel)</label>
                <input type="password" placeholder="******************" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50" />
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => setSelectedChannel(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">İptal</button>
              <button onClick={handleConnect} className="px-6 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-fuchsia-500/30">
                Sına ve Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Overlay */}
      {simulation.visible && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="text-center">
            {simulation.step === 5 ? (
              <div className="w-24 h-24 mx-auto bg-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            ) : (
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-fuchsia-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-fuchsia-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-fuchsia-500 animate-pulse" />
                </div>
              </div>
            )}
            
            <h2 className="text-2xl font-bold text-white mb-2">{simulation.message}</h2>
            <p className="text-slate-400">Lütfen bekleyin, bu ixlem birkaç saniye sürebilir...</p>
            
            <div className="flex justify-center gap-2 mt-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    i < simulation.step ? 'bg-emerald-500' : 
                    i === simulation.step ? 'bg-fuchsia-500 scale-150' : 
                    'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
