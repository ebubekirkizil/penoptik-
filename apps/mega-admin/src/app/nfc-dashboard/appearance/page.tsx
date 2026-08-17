"use client";

import { useState } from "react";
import { Paintbrush, LayoutTemplate, Palette, Check } from "lucide-react";

export default function NfcAppearancePage() {
  const [themeMode, setThemeMode] = useState("light");
  const [themeColor, setThemeColor] = useState("#2563EB"); // Default blue
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nfc/appearance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          profileId: "cl_fake_id_replace_me", 
          themeMode, 
          themeColor 
        })
      });
      if (res.ok) alert("Görünüm baxarıyla kaydedildi!");
    } catch (err) {
      alert("Hata oluxtu.");
    } finally {
      setLoading(false);
    }
  };

  const colorPresets = [
    "#2563EB", // Blue
    "#16A34A", // Green
    "#DC2626", // Red
    "#9333EA", // Purple
    "#000000", // Black
    "#CA8A04", // Gold
    "#0D9488", // Teal
    "#E11D48", // Rose
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
      
      {/* Sol Panel: Özellextirme */}
      <div className="w-full lg:w-1/2 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Görünüm Ayarları</h1>
          <p className="text-gray-500 mt-2">Profilinizin renklerini ve temel temasını özellextirin.</p>
        </div>

        {/* Tema Modu Seçimi */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <LayoutTemplate size={18} className="text-blue-500" />
            Tema Modu
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setThemeMode("light")}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                themeMode === "light" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="w-full h-12 bg-white rounded shadow-sm border border-gray-200 mb-2"></div>
              <span className={`font-bold ${themeMode === "light" ? "text-blue-700" : "text-gray-600"}`}>Aydınlık (Light)</span>
            </button>
            
            <button 
              onClick={() => setThemeMode("dark")}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                themeMode === "dark" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="w-full h-12 bg-gray-900 rounded shadow-sm border border-gray-700 mb-2"></div>
              <span className={`font-bold ${themeMode === "dark" ? "text-blue-700" : "text-gray-600"}`}>Koyu (Dark)</span>
            </button>
          </div>
        </div>

        {/* Vurgu Rengi Seçimi */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Palette size={18} className="text-purple-500" />
            Vurgu Rengi (Accent)
          </h3>
          <p className="text-sm text-gray-500 mb-4">Butonlar ve arka plan için ana profil renginiz.</p>
          
          <div className="flex flex-wrap gap-3 mb-6">
            {colorPresets.map(color => (
              <button
                key={color}
                onClick={() => setThemeColor(color)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                  themeColor === color ? "ring-4 ring-offset-2 ring-blue-500" : "ring-1 ring-gray-200"
                }`}
                style={{ backgroundColor: color }}
              >
                {themeColor === color && <Check className="text-white" size={20} />}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Özel Renk Kodu</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-12 h-12 p-1 bg-white border border-gray-200 rounded-lg cursor-pointer"
              />
              <input 
                type="text" 
                value={themeColor.toUpperCase()}
                onChange={(e) => setThemeColor(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 font-mono text-gray-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <Paintbrush size={20} />
          {loading ? "Kaydediliyor..." : "Görünümü Kaydet"}
        </button>

      </div>

      {/* Sağ Panel: Canlı Önizleme */}
      <div className="w-full lg:w-1/2">
        <div className={`rounded-[3rem] p-4 border-[8px] border-gray-900 shadow-2xl relative max-w-[340px] mx-auto h-[650px] flex flex-col transition-colors duration-500 ${themeMode === 'dark' ? 'bg-black' : 'bg-gray-100'}`}>
          <div className="w-32 h-6 bg-gray-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-3xl z-10"></div>
          
          <div className={`flex-1 rounded-[2.2rem] overflow-hidden flex flex-col relative transition-colors duration-500 ${themeMode === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
            
            {/* Tema Rengi Üst Arka Plan */}
            <div 
              className="h-32 w-full absolute top-0 left-0 transition-colors duration-500"
              style={{ backgroundColor: themeColor, opacity: themeMode === 'dark' ? 0.3 : 1 }}
            ></div>

            <div className="relative pt-16 px-6 pb-6 flex flex-col items-center flex-1">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 shadow-lg mb-4"></div>
              <h2 className={`text-xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>Kullanıcı Adı</h2>
              <p className={themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Ünvan veya Açıklama</p>

              <div className="w-full mt-8 space-y-3">
                {/* Sahte Modül 1 */}
                <div 
                  className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white shadow-md`}
                  style={{ backgroundColor: themeColor }}
                >
                  Bana Ulaxın
                </div>
                {/* Sahte Modül 2 */}
                <div 
                  className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white shadow-md`}
                  style={{ backgroundColor: themeColor }}
                >
                  Web Sitem
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
