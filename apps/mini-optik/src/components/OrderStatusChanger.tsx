// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { StatusConfig } from "@/lib/statusConfig";
import { CircleDot } from "lucide-react";

export default function OrderStatusChanger({
  orderId,
  currentStatus,
  statuses,
}: {
  orderId: string;
  currentStatus: string;
  statuses: StatusConfig[];
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
      {statuses.map((s) => (
        <button
          key={s.id}
          onClick={() => handleChange(s.id)}
          disabled={loading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all disabled:opacity-50 ${
            status === s.id
              ? `${s.border} ${s.color} ${s.bg} glow-primary scale-105`
              : "border-gray-700 text-gray-500 bg-transparent hover:border-gray-500"
          }`}
        >
          <span><CircleDot className="w-3.5 h-3.5" /></span>
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  );
}
