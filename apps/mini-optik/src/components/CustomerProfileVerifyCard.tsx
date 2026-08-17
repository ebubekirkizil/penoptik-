"use client";

import { useState } from "react";
import { Check, X, ArrowRight, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface CustomerProfileVerifyCardProps {
  verification: any;
}

export default function CustomerProfileVerifyCard({ verification }: CustomerProfileVerifyCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/verifications/customer/${verification.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        throw new Error("İşlem başarısız oldu.");
      }

      router.refresh();
    } catch (err) {
      alert("Hata oluştu.");
      setLoading(false);
    }
  };

  const oldData = verification.oldData || {};
  const newData = verification.newData || {};

  const fields = [
    { key: "firstName", label: "Ad" },
    { key: "lastName", label: "Soyad" },
    { key: "email", label: "E-posta" },
    { key: "address", label: "Adres" },
    { key: "diseases", label: "Hastalıklar" },
    { key: "notes", label: "Notlar" },
  ];

  const changedFields = fields.filter(f => oldData[f.key] !== newData[f.key]);

  return (
    <div className="bg-white dark:bg-surface shadow-sm dark:bg-surface rounded-2xl border border-primary/30 overflow-hidden flex flex-col shadow-[0_0_15px_rgba(var(--primary-rgb),0.05)]">
      {/* Card Header */}
      <div className="p-4 bg-white/30 dark:bg-surface flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-foreground">
              {verification.customer?.firstName} {verification.customer?.lastName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Profil Güncellemesi</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
            <p className="text-[10px] font-bold text-primary uppercase">Bekliyor</p>
          </div>
        </div>
      </div>

      {/* Changes Summary */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {changedFields.length === 0 ? (
          <p className="text-sm text-muted-foreground">Değişiklik bulunamadı.</p>
        ) : (
          <div className="space-y-3">
            {changedFields.map((field) => (
              <div key={field.key} className="text-sm border border-border-color rounded-xl p-3 bg-background/50">
                <span className="block text-[10px] text-muted-foreground uppercase font-semibold mb-2">{field.label}</span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-2 bg-danger/5 rounded-lg text-danger/80 break-words line-through decoration-danger/50 text-xs">
                    {oldData[field.key] || "-"}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 p-2 bg-success/5 rounded-lg text-success break-words text-xs font-medium">
                    {newData[field.key] || "-"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border-color bg-white/50 dark:bg-surface-light grid grid-cols-2 gap-3">
        <button
          disabled={loading}
          onClick={() => handleAction("reject")}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-danger text-danger hover:bg-danger/10 font-bold transition-all disabled:opacity-50"
        >
          <X className="w-4 h-4" /> Reddet
        </button>
        <button
          disabled={loading}
          onClick={() => handleAction("approve")}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success text-white hover:bg-success/90 font-bold shadow-lg shadow-success/20 transition-all disabled:opacity-50"
        >
          <Check className="w-4 h-4" /> Onayla
        </button>
      </div>
    </div>
  );
}
