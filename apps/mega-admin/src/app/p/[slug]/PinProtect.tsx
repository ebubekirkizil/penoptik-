"use client";

import { useState } from "react";
import { Lock, Unlock, ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";

type Props = {
  slug: string;
  profileName: string;
  themeColor: string;
  designConfig?: any;
};

export default function PinProtect({ slug, profileName, themeColor, designConfig = {} }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Özellextirme Değerleri
  const pinBgColor = designConfig.pinBgColor || themeColor || "#0f172a";
  const pinTextColor = designConfig.pinTextColor || "#ffffff";
  const pinImage = designConfig.pinImage || "";
  
  // Kontrast hesaplama (arka plan veya yazı rengine göre)
  const isLightText = pinTextColor === "#ffffff" || pinTextColor.toLowerCase() === "#fff";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (pin.length < 4) {
      setError("PIN en az 4 haneli olmalıdır");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/nfc/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, pin }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        // Kısa animasyon sonrası reload
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setError(data.message || "Hatalı PIN");
        setPin("");
      }
    } catch (err) {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: pinBgColor }}
    >
      {/* Arka Plan Görseli (Eğer varsa) */}
      {pinImage && (
        <div className="absolute inset-0 z-0">
          <Image 
            src={pinImage} 
            alt="Background" 
            fill 
            className="object-cover opacity-60 blur-sm"
            priority
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        </div>
      )}

      {/* Dekoratif Efektler */}
      {!pinImage && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-20 blur-3xl mix-blend-screen bg-white"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-10 blur-3xl mix-blend-screen bg-white"></div>
        </>
      )}

      <div className="relative z-10 w-full max-w-sm">
        {/* Güvenlik Kutusu */}
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[2rem] shadow-2xl p-8 text-center overflow-hidden">
          
          <div className="flex justify-center mb-6">
            <div 
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner transition-all duration-500 ease-out ${
                success ? 'bg-green-500 scale-110 shadow-green-500/50' : 'bg-white/20 backdrop-blur-md border border-white/30'
              }`}
              style={{ color: pinTextColor }}
            >
              {success ? <ShieldCheck size={36} className="text-white" /> : <Lock size={36} />}
            </div>
          </div>

          <h2 
            className="text-2xl font-bold mb-2 tracking-tight"
            style={{ color: pinTextColor }}
          >
            {profileName}
          </h2>
          <p 
            className="text-sm mb-8 opacity-80"
            style={{ color: pinTextColor }}
          >
            Bu profile erixmek için PIN kodunu girin.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••••"
                className={`w-full text-center text-3xl tracking-[0.5em] font-bold rounded-2xl py-4 focus:outline-none transition-all placeholder:tracking-normal placeholder:text-xl placeholder:font-normal placeholder:opacity-50 ${
                  isLightText 
                    ? 'bg-black/20 text-white border-white/10 focus:border-white/50 focus:bg-black/40' 
                    : 'bg-white/50 text-gray-900 border-black/10 focus:border-black/50 focus:bg-white/80'
                } border-2`}
                style={{ color: pinTextColor }}
                disabled={loading || success}
                autoFocus
              />
              {error && (
                <div className="absolute -bottom-6 left-0 w-full text-center">
                  <p className="text-red-400 text-xs font-bold animate-bounce drop-shadow-md">{error}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || success || pin.length < 4}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 ${
                success 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                  : isLightText 
                    ? 'bg-white text-gray-900 hover:bg-gray-100 shadow-xl' 
                    : 'bg-gray-900 text-white hover:bg-gray-800 shadow-xl'
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : success ? (
                "Doğrulandı!"
              ) : (
                <>
                  Kilidi Aç <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Güvenlik Rozeti */}
        <div className="mt-8 flex items-center justify-center gap-2 opacity-60" style={{ color: pinTextColor }}>
          <ShieldCheck size={14} />
          <span className="text-xs font-medium uppercase tracking-wider">Uçtan Uca Şifreli</span>
        </div>
      </div>
    </div>
  );
}
