"use client";

import React, { useState } from "react";
import { X, Search, FileDown, CheckCircle2, User, Glasses } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SgkEreceteModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [tcNo, setTcNo] = useState("");
  const [ereceteNo, setEreceteNo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (tcNo.length !== 11) {
      toast.error("Geçerli bir T.C. Kimlik Numarası giriniz (11 hane).");
      return;
    }
    if (!ereceteNo) {
      toast.error("E-Reçete numarasını giriniz.");
      return;
    }
    
    setIsLoading(true);
    setResult(null);

    // Mock API Call to Medula
    setTimeout(() => {
      setIsLoading(false);
      
      setResult({
        status: "FOUND",
        patient: "Ayşe Demir",
        doctor: "Dr. Kemal Yücel",
        hospital: "Göztepe Eğitim ve Araştırma Hastanesi",
        date: "2026-08-12",
        prescription: {
          farRightSph: "-1.25",
          farRightCyl: "-0.50",
          farRightAxis: "90",
          farLeftSph: "-1.50",
          farLeftCyl: "",
          farLeftAxis: "",
        }
      });
      toast.success("E-Reçete başarıyla çekildi!");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border-color">
        <div className="flex items-center justify-between p-5 border-b border-border-color bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <FileDown className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">E-Reçete Çağır</h2>
              <p className="text-xs text-muted-foreground">Medula e-Reçete Sorgulama</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-300/50 hover:text-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">T.C. Kimlik No</label>
              <input 
                type="text" 
                maxLength={11}
                value={tcNo}
                onChange={(e) => setTcNo(e.target.value.replace(/\D/g, ''))}
                placeholder="11 Hane"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">E-Reçete No</label>
              <input 
                type="text" 
                value={ereceteNo}
                onChange={(e) => setEreceteNo(e.target.value)}
                placeholder="Örn: 1234XYZ98"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            
            <button 
              type="submit"
              disabled={isLoading || tcNo.length !== 11 || !ereceteNo}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {isLoading ? <span className="animate-spin text-lg">⚙</span> : <><Search className="w-4 h-4" /> Sorgula</>}
            </button>
          </form>

          {result && (
            <div className="p-5 rounded-2xl border bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-200 text-blue-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-800 dark:text-blue-400">Reçete Bulundu</h3>
                  <p className="text-xs opacity-80 font-medium">{result.hospital} • {result.date}</p>
                </div>
              </div>

              <div className="space-y-3 bg-white/60 dark:bg-black/20 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Hasta:</span>
                  <span className="font-bold">{result.patient}</span>
                </div>
                <div className="flex items-center justify-between text-sm border-b border-slate-200/50 dark:border-slate-700 pb-2">
                  <span className="text-muted-foreground flex items-center gap-2">Doktor:</span>
                  <span className="font-medium">{result.doctor}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">SAĞ GÖZ (R)</span>
                    <div className="text-xs font-medium">SPH: {result.prescription.farRightSph || "0.00"}</div>
                    <div className="text-xs font-medium">CYL: {result.prescription.farRightCyl || "0.00"}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">SOL GÖZ (L)</span>
                    <div className="text-xs font-medium">SPH: {result.prescription.farLeftSph || "0.00"}</div>
                    <div className="text-xs font-medium">CYL: {result.prescription.farLeftCyl || "0.00"}</div>
                  </div>
                </div>

                <button onClick={() => alert("Reçete verileri forma aktarılacak.")} className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">
                  Sisteme (Göz Bilgisine) Aktar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
