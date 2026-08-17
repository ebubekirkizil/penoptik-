"use client";

import React, { useState } from "react";
import { UserPlus, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AssignCardButton({ serialCode }: { serialCode: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/nfc/admin/cards/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, serialCode })
      });

      const data = await res.json();
      if (res.ok) {
        alert("Baxarılı: " + data.message);
        setIsOpen(false);
        router.refresh();
      } else {
        alert("Hata: " + (data.error || "Bilinmeyen bir hata oluxtu."));
      }
    } catch (err) {
      alert("Bağlantı hatası oluxtu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-[11px] sm:text-xs font-bold text-green-700 dark:text-green-400 hover:text-green-800 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 px-2 py-2 md:py-1.5 rounded-lg border border-green-200 dark:border-green-500/30 transition-colors inline-flex items-center justify-center gap-1 w-full md:w-auto"
      >
        <UserPlus className="w-3 h-3" /> Müxteriye Ata
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-800 overflow-hidden text-left">
            <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" />
                Müxteriye Ata (Kart {serialCode})
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Bu kartı bir müxteriye atayın. Sistemde e-postası kayıtlıysa direkt atanır, yoksa otomatik yeni hesap oluxturulur.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Ad</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.firstName}
                    onChange={e => setFormData(prev => ({...prev, firstName: e.target.value}))}
                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Soyad</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.lastName}
                    onChange={e => setFormData(prev => ({...prev, lastName: e.target.value}))}
                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300">E-Posta Adresi</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={e => setFormData(prev => ({...prev, email: e.target.value}))}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="ornek@mail.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Şifre (Opsiyonel)</label>
                <input 
                  type="text" 
                  value={formData.password}
                  onChange={e => setFormData(prev => ({...prev, password: e.target.value}))}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="Box bırakılırsa: 123456"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Atanıyor..." : "Müxteriye Ata"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
