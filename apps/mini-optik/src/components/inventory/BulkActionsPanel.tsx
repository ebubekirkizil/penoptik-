"use client";

import React, { useState, useMemo } from "react";
import { X, Zap, AlertTriangle, ArrowRight, Percent, DollarSign, CheckCircle2, TrendingUp, TrendingDown, Box } from "lucide-react";
import toast from "react-hot-toast";

interface BulkPriceUpdateModalProps {
  inline?: boolean;
  products: any[];
  selectedItemIds?: string[];
  onClose: () => void;
  onComplete: () => void;
}

export default function BulkPriceUpdateModal({ products, onClose, onComplete, inline = false, selectedItemIds }: BulkPriceUpdateModalProps) {
  const [targetType, setTargetType] = useState<"ALL" | "BRAND" | "CATEGORY">("ALL");
  const [targetValue, setTargetValue] = useState("");
  
  const [actionType, setActionType] = useState<"INCREASE" | "DECREASE">("INCREASE");
  const [amountType, setAmountType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [amount, setAmount] = useState("");
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const brands = useMemo(() => Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[], [products]);
  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[], [products]);

  const affectedProducts = useMemo(() => {
    if (selectedItemIds && selectedItemIds.length > 0) {
      return products.filter(p => selectedItemIds.includes(p.id));
    }
    return products.filter(p => {
      if (targetType === "ALL") return true;
      if (targetType === "BRAND" && p.brand === targetValue) return true;
      if (targetType === "CATEGORY" && p.category === targetValue) return true;
      return false;
    });
  }, [products, targetType, targetValue, selectedItemIds]);

  const calculateNewPrice = (oldPrice: number) => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return oldPrice;

    let diff = 0;
    if (amountType === "PERCENT") {
      diff = oldPrice * (val / 100);
    } else {
      diff = val;
    }

    let newPrice = actionType === "INCREASE" ? oldPrice + diff : oldPrice - diff;
    if (newPrice < 0) newPrice = 0;
    return newPrice;
  };

  const handleExecute = async () => {
    if (affectedProducts.length === 0) {
      toast.error("İşlem yapılacak ürün bulunamadı!");
      return;
    }

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error("Lütfen geçerli bir tutar/oran girin.");
      return;
    }

    setIsExecuting(true);
    try {
      const updates = affectedProducts.map(p => ({
        id: p.id,
        newPrice: calculateNewPrice(p.salePrice || p.price || 0)
      }));

      const res = await fetch("/api/inventory/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`${data.updatedCount} ürünün fiyatı güncellendi!`);
        setShowConfirm(false);
        onComplete();
      } else {
        toast.error("Hata: " + data.error);
      }
    } catch (err) {
      toast.error("Toplu güncelleme sırasında hata oluştu.");
    }
    setIsExecuting(false);
  };

  const inner = (
      <div className={`relative bg-white dark:bg-[#1E293B] ${inline ? "rounded-2xl border border-indigo-200 dark:border-indigo-800/50 w-full mb-6 shadow-sm" : "rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh]"} overflow-hidden flex flex-col animate-in zoom-in-95 duration-200`}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Toplu Fiyat İşlemleri</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ürün fiyatlarını kategori veya marka bazlı güncelleyin</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Target Selection */}
          {(!selectedItemIds || selectedItemIds.length === 0) ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Box className="w-4 h-4 text-indigo-500" /> Hedef Ürün Kapsamı
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => { setTargetType("ALL"); setTargetValue(""); }} className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all border-2 flex items-center justify-center ${targetType === "ALL" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                  Tüm Ürünler
                </button>
                <button onClick={() => { setTargetType("BRAND"); setTargetValue(brands[0] || ""); }} className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all border-2 flex items-center justify-center ${targetType === "BRAND" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                  Marka Bazlı
                </button>
                <button onClick={() => { setTargetType("CATEGORY"); setTargetValue(categories[0] || ""); }} className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all border-2 flex items-center justify-center ${targetType === "CATEGORY" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                  Kategori Bazlı
                </button>
              </div>

              {targetType === "BRAND" && (
                <div className="animate-in slide-in-from-top-2 pt-2">
                  <select value={targetValue} onChange={e => setTargetValue(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                    {brands.length === 0 ? <option value="">Marka bulunamadı</option> : brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}

              {targetType === "CATEGORY" && (
                <div className="animate-in slide-in-from-top-2 pt-2">
                  <select value={targetValue} onChange={e => setTargetValue(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                    {categories.length === 0 ? <option value="">Kategori bulunamadı</option> : categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
              
              <div className="bg-indigo-50/50 dark:bg-indigo-500/5 px-4 py-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-400">Etkilenecek Ürün Sayısı:</span>
                <span className="text-base font-black text-indigo-900 dark:text-indigo-300 px-3 py-1 bg-white dark:bg-indigo-900/50 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800">{affectedProducts.length} Adet</span>
              </div>
            </div>
          ) : (
            <div className="bg-indigo-50/50 dark:bg-indigo-500/5 px-5 py-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-base font-black text-indigo-800 dark:text-indigo-300">Seçili Ürünler</span>
                <span className="text-sm font-medium text-indigo-600/70 dark:text-indigo-400/70">Sadece önceden seçtiğiniz ürünler etkilenecektir.</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-indigo-500 font-bold mb-1">Adet</span>
                <span className="text-2xl font-black text-indigo-900 dark:text-indigo-100 px-4 py-1.5 bg-white dark:bg-indigo-900/50 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800">{affectedProducts.length}</span>
              </div>
            </div>
          )}

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Action Setup */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" /> İşlem Yönü
              </h3>
              <div className="flex gap-3">
                <button onClick={() => setActionType("INCREASE")} className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all border-2 ${actionType === "INCREASE" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-sm" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${actionType === "INCREASE" ? "bg-emerald-200 dark:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300" : "bg-slate-100 dark:bg-slate-700"}`}>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  Zam Yap
                </button>
                <button onClick={() => setActionType("DECREASE")} className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all border-2 ${actionType === "DECREASE" ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 shadow-sm" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${actionType === "DECREASE" ? "bg-rose-200 dark:bg-rose-500/30 text-rose-800 dark:text-rose-300" : "bg-slate-100 dark:bg-slate-700"}`}>
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  İndirim Yap
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-500" /> Tutar & Oran
              </h3>
              <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                <button onClick={() => setAmountType("PERCENT")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${amountType === "PERCENT" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"}`}>
                  <Percent className="w-3.5 h-3.5"/> Yüzde (%)
                </button>
                <button onClick={() => setAmountType("FIXED")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${amountType === "FIXED" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"}`}>
                  <DollarSign className="w-3.5 h-3.5"/> Tutar (₺)
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {amountType === "PERCENT" ? <Percent className="h-5 w-5 text-slate-400" /> : <strong className="text-slate-400 text-lg">₺</strong>}
                </div>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  placeholder={amountType === "PERCENT" ? "Örn: 15" : "Örn: 150"} 
                  className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/30">
          {!showConfirm ? (
            <button 
              onClick={() => setShowConfirm(true)}
              disabled={affectedProducts.length === 0 || !amount || parseFloat(amount) <= 0}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              Fiyatları Güncelle <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/50">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <p className="text-sm font-bold">Bu işlemi geri alamazsınız. {affectedProducts.length} adet ürünün fiyatı {actionType === "INCREASE" ? "artırılacak" : "düşürülecek"}. Onaylıyor musunuz?</p>
              </div>
              <div className="flex gap-3">
                <button disabled={isExecuting} onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-3.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">Vazgeç</button>
                <button disabled={isExecuting} onClick={handleExecute} className="flex-[2] flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
                  {isExecuting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <CheckCircle2 className="w-5 h-5" />}
                  {isExecuting ? "Uygulanıyor..." : "Evet, Kesinlikle Onaylıyorum"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
  );

  if (inline) return inner;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      {inner}
    </div>
  );
}