// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface PrescriptionVerifyActionsProps {
  prescriptionId: string;
  isPending: boolean;
}

export default function PrescriptionVerifyActions({ prescriptionId, isPending }: PrescriptionVerifyActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isPending) return null;

  const handleApprove = async () => {
    const toastId = toast.loading("Onaylanıyor...");
    setLoading(true);
    try {
      const res = await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPending: false }),
      });

      if (!res.ok) throw new Error("Onaylanamadı");
      toast.success("Kayıt başarıyla onaylandı!", { id: toastId });
      router.refresh();
    } catch (err: any) {
      toast.error("Hata: " + err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Bu bekleyen kaydı silmek istediğinize emin misiniz?")) return;
    const toastId = toast.loading("Reddediliyor (Siliniyor)...");
    setLoading(true);
    try {
      const res = await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Silinemedi");
      toast.success("Kayıt reddedildi ve silindi.", { id: toastId });
      router.refresh();
    } catch (err: any) {
      toast.error("Hata: " + err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-color">
      <span className="text-xs text-amber-500 font-semibold mr-auto flex items-center gap-1">
        ⚠ Onay Bekliyor
      </span>
      <button
        disabled={loading}
        onClick={handleReject}
        className="px-2.5 py-1 text-xs border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-1 font-semibold transition-all cursor-pointer"
      >
        <X className="w-3.5 h-3.5" /> Reddet
      </button>
      <button
        disabled={loading}
        onClick={handleApprove}
        className="px-2.5 py-1 text-xs bg-primary text-[#1B242A] hover:opacity-90 rounded-lg flex items-center gap-1 font-bold transition-all glow-primary cursor-pointer"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Check className="w-3.5 h-3.5" />
        )}
        Onayla
      </button>
    </div>
  );
}
