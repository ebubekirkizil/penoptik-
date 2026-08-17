"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";

type Props = {
  cardId: string;
  isLocked: boolean;
};

export default function LockCardButton({ cardId, isLocked }: Props) {
  const [loading, setLoading] = useState(false);

  const handleLock = async () => {
    if (!confirm("Bu kartı kalıcı olarak kilitlemek istediğinize emin misiniz? Bu ixlem kartın atamasının ve URL'sinin yazılım üzerinden değixtirilmesini engeller.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/nfc/admin/cards/${cardId}/lock`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        alert(data.message || "Bir hata oluxtu");
      }
    } catch (err) {
      alert("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  if (isLocked) {
    return (
      <span className="text-[11px] sm:text-xs font-bold text-gray-500 bg-gray-100 px-2 py-2 md:py-1.5 rounded-lg border border-gray-200 inline-flex items-center justify-center gap-1 w-full md:w-auto cursor-not-allowed">
        <Lock className="w-3 h-3" /> Kilitli
      </span>
    );
  }

  return (
    <button 
      onClick={handleLock}
      disabled={loading}
      className="text-[11px] sm:text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-2 md:py-1.5 rounded-lg border border-red-200 transition-colors inline-flex items-center justify-center gap-1 w-full md:w-auto disabled:opacity-50"
    >
      <Unlock className="w-3 h-3" /> {loading ? "İxleniyor..." : "Kilitle"}
    </button>
  );
}
