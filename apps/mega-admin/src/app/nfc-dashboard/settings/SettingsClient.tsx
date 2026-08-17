"use client";

import { useState } from "react";
import { Shield, ShieldAlert, KeyRound, Save } from "lucide-react";

type SettingsClientProps = {
  profileId: string;
  initialIsPinActive: boolean;
  initialPinCode: string;
};

export default function SettingsClient({ profileId, initialIsPinActive, initialPinCode }: SettingsClientProps) {
  const [isPinActive, setIsPinActive] = useState(initialIsPinActive);
  const [pinCode, setPinCode] = useState(initialPinCode || "");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSaveSecurity = async () => {
    if (isPinActive && pinCode.length < 4) {
      alert("PIN kodu en az 4 haneli olmalıdır.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/nfc/settings/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, isPinActive, pinCode }), 
      });

      if (res.ok) {
        setSuccessMsg("Güvenlik ayarları baxarıyla güncellendi.");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        alert("Güncelleme baxarısız oldu.");
      }
    } catch (error) {
      alert("Bir hata oluxtu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          <Shield size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Güvenlik ve PIN Koruması</h2>
          <p className="text-sm text-gray-500">Profilinizi yabancı eriximlere karxı xifreleyin.</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">PIN Korumasını Aktiflextir</h3>
            <p className="text-sm text-gray-500 max-w-md">
              Açık olduğunda, profilinize internet üzerinden (link ile) giren kixilerden xifre istenir. 
              Siz fiziksel kartınızı okuttuğunuzda ise xifre sorulmadan doğrudan girix yapılır (Bypass).
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={isPinActive}
              onChange={(e) => setIsPinActive(e.target.checked)}
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {isPinActive && (
          <div className="pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Yeni PIN Kodu Belirle</label>
            <div className="relative max-w-xs">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="password"
                maxLength={6}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Örn: 1453"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest font-bold"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Sadece rakam (Min 4, Max 6 hane)</p>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          {successMsg ? (
            <p className="text-green-600 font-medium text-sm flex items-center gap-2">
              <ShieldAlert size={16} /> {successMsg}
            </p>
          ) : <div></div>}
          
          <button 
            onClick={handleSaveSecurity}
            disabled={loading}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? "Kaydediliyor..." : "Ayarları Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}
