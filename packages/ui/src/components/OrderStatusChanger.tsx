// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { ClipboardList, Clock, CheckCircle, Check } from "lucide-react";

const STATUSES = [
  { value: "PENDING", label: "Bekliyor", icon: <ClipboardList className="w-4 h-4" />, color: "border-yellow-500/30 text-yellow-400 bg-yellow-500/10" },
  { value: "PREPARING", label: "Hazırlanıyor", icon: <Clock className="w-4 h-4" />, color: "border-blue-500/30 text-blue-400 bg-blue-500/10" },
  { value: "READY", label: "Teslime Hazır", icon: <CheckCircle className="w-4 h-4" />, color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" },
  { value: "DELIVERED", label: "Teslim Edildi", icon: <Check className="w-4 h-4" />, color: "border-gray-500/30 text-gray-400 bg-gray-500/10" },
  { value: "COMPLETED", label: "Tamamlandı", icon: <CheckCircle className="w-4 h-4" />, color: "border-primary/30 text-primary bg-primary/10" }
];

export default function OrderStatusChanger({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = async (newStatus: string) => {
    if (newStatus === status) return;
    
    // Optimistic update
    const previousStatus = status;
    setStatus(newStatus);
    const toastId = toast.loading("Durum güncelleniyor...");
    setLoading(true);
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) throw new Error("Durum güncellenemedi");
      
      toast.success("Sipariş durumu güncellendi!", { id: toastId });
      
      // router.refresh doesn't block UI when wrapped in transition or done asynchronously
      router.refresh();
    } catch (e: any) {
      console.error(e);
      // Revert optimistic update
      setStatus(previousStatus);
      toast.error("Durum güncellenirken hata oluştu.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {STATUSES.map((s) => (
        <button
          key={s.value}
          onClick={() => handleChange(s.value)}
          disabled={loading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all disabled:opacity-50 ${
            status === s.value
              ? `${s.color} glow-primary scale-105`
              : "border-gray-700 text-gray-500 bg-transparent hover:border-gray-500"
          }`}
        >
          <span>{s.icon}</span>
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  );
}
