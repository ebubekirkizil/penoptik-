"use client";

import React, { useState } from "react";
import { X, Calculator, ShieldCheck, DollarSign, ArrowRight } from "lucide-react";

export default function SgkHesaplamaModal({ isOpen, onClose, onApply }: { isOpen: boolean, onClose: () => void, onApply?: (total: number, sgkDiscount: number) => void }) {
  const [cerceveBedeli, setCerceveBedeli] = useState("");
  const [camBedeli, setCamBedeli] = useState("");
  const [emekliMi, setEmekliMi] = useState(false);

  if (!isOpen) return null;

  // SGK Örnek Katılım Payı Kriterleri (2025 Yaklaşık)
  // Çerçeve Hak: ~150 TL
  // Çift Cam Hak: ~200 TL
  // Emekliden %10, Çalışandan %20 Maaştan kesinti. Dolayısıyla elden tahsil edilmez.
  // Ek olarak Reçete bedeli vs alınır ama basitleştirelim.
  const sgkCerceveKarsilanan = 150;
  const sgkCamKarsilanan = 200;

  const totalBedel = (parseFloat(cerceveBedeli) || 0) + (parseFloat(camBedeli) || 0);
  const totalSgkIndirimi = sgkCerceveKarsilanan + sgkCamKarsilanan;
  let musteriOdeyecek = totalBedel - totalSgkIndirimi;
  if (musteriOdeyecek < 0) musteriOdeyecek = 0;

  const katilimPayiYuzdesi = emekliMi ? 10 : 20;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border-color">
        <div className="flex items-center justify-between p-5 border-b border-border-color bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">SGK Katılım Hesaplama</h2>
              <p className="text-xs text-muted-foreground">İndirimler ve Net Fiyat</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-300/50 hover:text-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Çerçeve Satış Fiyatı (₺)</label>
              <input 
                type="number" 
                value={cerceveBedeli}
                onChange={(e) => setCerceveBedeli(e.target.value)}
                placeholder="Örn: 1500"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Cam Çift Satış Fiyatı (₺)</label>
              <input 
                type="number" 
                value={camBedeli}
                onChange={(e) => setCamBedeli(e.target.value)}
                placeholder="Örn: 2000"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => setEmekliMi(!emekliMi)}>
            <input type="checkbox" checked={emekliMi} onChange={() => {}} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
            <div className="flex-1">
              <p className="text-sm font-bold">Hasta Emekli (Maaştan Kesinti)</p>
              <p className="text-xs text-muted-foreground">Katılım payı %{katilimPayiYuzdesi} oranında maaştan tahsil edilecektir.</p>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Toplam Liste Fiyatı:</span>
              <span className="font-medium">{totalBedel.toLocaleString("tr-TR")} ₺</span>
            </div>
            <div className="flex justify-between text-sm text-emerald-600 font-bold border-b border-emerald-200 dark:border-emerald-800 pb-3">
              <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> SGK Karşılanan:</span>
              <span>- {totalSgkIndirimi.toLocaleString("tr-TR")} ₺</span>
            </div>
            <div className="flex justify-between items-end pt-2">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Müşteriden Alınacak Net Fiyat:</span>
              <span className="text-2xl font-black text-emerald-600">{musteriOdeyecek.toLocaleString("tr-TR")} ₺</span>
            </div>
          </div>

          <button 
            onClick={() => {
              if(onApply) onApply(musteriOdeyecek, totalSgkIndirimi);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
          >
            Fiyatı Siparişe Aktar <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
