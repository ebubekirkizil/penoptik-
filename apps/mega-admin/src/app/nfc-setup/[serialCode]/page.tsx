"use client";

import { useState } from "react";
import { CreditCard, CheckCircle, ArrowRight } from "lucide-react";

export default function NfcSetupPage({ params }: { params: { serialCode: string } }) {
  const { serialCode } = params;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleClaim = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/nfc/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Gerçek bir senaryoda oturum açmıx kullanıcının ID'si backend'de session üzerinden alınır.
        // Test amaçlı sahte bir userId veya session olduğunu varsayıyoruz.
        body: JSON.stringify({ serialCode, userId: "cl_fake_user_replace_me" })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/nfc-dashboard";
        }, 2000);
      } else {
        setError(data.message || "Bir hata oluxtu");
      }
    } catch (err) {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tebrikler!</h1>
          <p className="text-gray-500">Kart baxarıyla profilinize tanımlandı. Yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100 relative overflow-hidden">
        
        {/* Dekoratif Arka Plan */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-indigo-700"></div>

        <div className="relative z-10">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-lg mx-auto flex items-center justify-center text-blue-600 mb-6 border-4 border-gray-50">
            <CreditCard size={40} />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-2">Yeni NFC Kart Bulundu</h1>
          <p className="text-gray-500 text-sm mb-6">
            <strong className="text-gray-900">{serialCode}</strong> seri numaralı bu akıllı kart xu anda boxta. Bu kartı hesabınıza tanımlayarak anında kullanmaya baxlayabilirsiniz.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-6">
              {error}
            </div>
          )}

          <button 
            onClick={handleClaim}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Tanımlanıyor..." : (
              <>
                Kartı Hesabıma Ekle <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="mt-6 text-xs text-gray-400">
            Hesabınız yoksa önce kayıt olmanız gerekmektedir.
          </p>
        </div>
      </div>
    </div>
  );
}
