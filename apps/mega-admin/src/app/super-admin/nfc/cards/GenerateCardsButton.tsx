"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GenerateCardsButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!confirm("10 adet yeni stok kart üretilecek. Onaylıyor musunuz?")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/nfc/admin/generate-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 10, type: "STOCK" })
      });

      if (res.ok) {
        alert("Kartlar baxarıyla üretildi!");
        router.refresh();
      } else {
        alert("Üretim baxarısız oldu.");
      }
    } catch (err) {
      alert("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleGenerate}
      disabled={loading}
      className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 rounded-lg font-bold transition-colors shadow-md disabled:opacity-50"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      ) : (
        <>
          <Plus size={18} />
          Toplu Stok Üret
        </>
      )}
    </button>
  );
}
