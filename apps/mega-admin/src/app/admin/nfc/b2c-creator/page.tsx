"use client";

import { useState } from "react";

export default function B2CCardCreatorPage() {
  const [customLink, setCustomLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateB2CLink = () => {
    setLoading(true);
    // Normalde burada /api/nfc/generate-b2c-card POST isteği yapılır.
    // Backend veritabanında yeni bir NfcCard (type="CUSTOM", userId=mevcutKullanici) yaratır.
    
    setTimeout(() => {
      // Örnek rastgele kod üretimi
      const randomCode = "B-" + Math.random().toString(36).substring(2, 7).toUpperCase();
      setCustomLink(`https://sentientwire.com/nfc/${randomCode}`);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kendi NFC Kartını Üret</h1>
        <p className="text-gray-500 mt-2">Dıxarıdan aldığınız box bir NFC karta (veya NFC etiketine) dijital profilinizi bağlamak için özel bir link oluxturun.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex gap-4 text-blue-800 text-sm">
          <svg className="w-6 h-6 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-bold mb-1">Nasıl Çalıxır?</p>
            <p>1. Axağıdaki butona basarak size özel bir kart URL'si oluxturun.</p>
            <p>2. "NFC Tools" vb. bir mobil uygulama indirin.</p>
            <p>3. Üretilen linki kopyalayıp "Write (Yaz)" sekmesinden "URL" olarak kendi box kartınıza yazdırın.</p>
          </div>
        </div>

        {!customLink ? (
          <div className="text-center">
            <button
              onClick={generateB2CLink}
              disabled={loading}
              className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-70 flex items-center justify-center mx-auto gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Link Üretiliyor...
                </>
              ) : (
                "Yeni NFC Linki Üret"
              )}
            </button>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="p-6 bg-green-50 rounded-xl border border-green-100">
              <h3 className="text-green-800 font-bold mb-2">Baxarıyla Oluxturuldu!</h3>
              <p className="text-green-700 text-sm mb-4">Axağıdaki linki kendi NFC kartınıza yazdırabilirsiniz.</p>
              
              <div className="flex items-center gap-2 max-w-sm mx-auto">
                <input 
                  type="text" 
                  value={customLink} 
                  readOnly 
                  className="w-full bg-white border border-green-200 rounded-lg px-4 py-3 text-gray-900 font-mono text-sm focus:outline-none"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(customLink)}
                  className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors"
                  title="Kopyala"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => setCustomLink(null)}
              className="text-gray-500 hover:text-gray-900 text-sm font-medium"
            >
              Baxka Bir Kart Daha Üret
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
