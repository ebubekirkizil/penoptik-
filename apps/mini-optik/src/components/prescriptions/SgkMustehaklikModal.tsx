"use client";

import React, { useState } from "react";
import { X, Search, ShieldCheck, AlertTriangle, User, Calendar, Glasses } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SgkMustehaklikModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [tcNo, setTcNo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (tcNo.length !== 11) {
      toast.error("Geçerli bir T.C. Kimlik Numarası giriniz (11 hane).");
      return;
    }
    
    setIsLoading(true);
    setResult(null);

    // Mock API Call to Medula
    setTimeout(() => {
      setIsLoading(false);
      
      // Rastgele sonuç senaryosu
      if (tcNo.startsWith("9")) {
        // Hak yok senaryosu
        setResult({
          status: "DENIED",
          patient: "Yabancı Uyruklu / Kayıt Bulunamadı",
          message: "Müstehaklık bulunamadı veya 3 yıl dolmamış.",
          lastGlassDate: "2025-01-15",
          lastFrameDate: "2025-01-15"
        });
      } else {
        // Hak var senaryosu
        setResult({
          status: "APPROVED",
          patient: "Ahmet Yılmaz",
          message: "Hastanın SGK üzerinden Cam ve Çerçeve hakkı bulunmaktadır.",
          lastGlassDate: "2020-05-10",
          lastFrameDate: "2020-05-10",
          camHakkı: true,
          cerceveHakkı: true
        });
        toast.success("Müstehaklık sorgusu başarılı!");
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border-color">
        <div className="flex items-center justify-between p-5 border-b border-border-color bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">SGK Hak Sorgulama</h2>
              <p className="text-xs text-muted-foreground">Medula Müstehaklık Sorgusu</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-300/50 hover:text-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              maxLength={11}
              value={tcNo}
              onChange={(e) => setTcNo(e.target.value.replace(/\D/g, ''))}
              placeholder="T.C. Kimlik Numarası (11 Hane)"
              className="w-full pl-5 pr-14 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-center"
            />
            <button 
              type="submit"
              disabled={isLoading || tcNo.length !== 11}
              className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              {isLoading ? <span className="animate-spin text-lg">⚙</span> : <Search className="w-5 h-5" />}
            </button>
          </form>

          {result && (
            <div className={`p-5 rounded-2xl border ${result.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${result.status === 'APPROVED' ? 'bg-emerald-200 text-emerald-700' : 'bg-rose-200 text-rose-700'}`}>
                  {result.status === 'APPROVED' ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className={`font-bold ${result.status === 'APPROVED' ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-400'}`}>
                    {result.status === 'APPROVED' ? 'Hak Bulunmaktadır' : 'Hak Bulunamadı'}
                  </h3>
                  <p className="text-xs opacity-80 font-medium">{result.message}</p>
                </div>
              </div>

              <div className="space-y-3 bg-white/60 dark:bg-black/20 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Hasta:</span>
                  <span className="font-bold">{result.patient}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Son Cam Alımı:</span>
                  <span className="font-medium">{result.lastGlassDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Glasses className="w-4 h-4" /> Son Çerçeve Alımı:</span>
                  <span className="font-medium">{result.lastFrameDate}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
