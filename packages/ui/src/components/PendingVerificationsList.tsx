// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ShieldAlert, Eye, Loader2 } from "lucide-react";

interface PendingPrescription {
  id: string;
  customerId: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  farRightSph: string | null;
  farRightCyl: string | null;
  farRightAx: string | null;
  farLeftSph: string | null;
  farLeftCyl: string | null;
  farLeftAx: string | null;
  pdRight: string | null;
  pdLeft: string | null;
  pdTotal: string | null;
  phRight: string | null;
  phLeft: string | null;
  lensType: string | null;
  doctorName: string | null;
  hospitalName: string | null;
  notes: string | null;
  createdAt: any;
}

interface PendingVerificationsListProps {
  initialPrescriptions: PendingPrescription[];
}

export default function PendingVerificationsList({ initialPrescriptions }: PendingVerificationsListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    setError("");
    try {
      const res = await fetch(`/api/prescriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPending: false }),
      });

      if (!res.ok) {
        throw new Error("Doğrulama onaylanırken bir hata oluştu.");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Onaylama başarısız.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Bu göz bilgisi kaydını silmek istediğinize emin misiniz?")) return;
    setLoadingId(id);
    setError("");
    try {
      const res = await fetch(`/api/prescriptions/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Kayıt reddedilirken/silinirken bir hata oluştu.");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Reddetme başarısız.");
    } finally {
      setLoadingId(null);
    }
  };

  if (initialPrescriptions.length === 0) {
    return null;
  }

  return (
    <div className="glass rounded-2xl border border-border-color mt-8 overflow-hidden animate-fade-in-up">
      <div className="px-6 py-4 border-b border-border-color bg-amber-500/5 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-amber-500" />
        <h2 className="text-foreground font-bold">Bekleyen Göz Bilgisi Doğrulamaları</h2>
        <span className="bg-amber-500/20 text-amber-500 text-xs px-2.5 py-0.5 rounded-full font-bold">
          {initialPrescriptions.length} Yeni
        </span>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-500 text-sm">
          ⚠ {error}
        </div>
      )}

      <div className="divide-y divide-border-color">
        {initialPrescriptions.map((rx) => (
          <div key={rx.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between bg-surface/30">
            {/* Left side: customer info and values */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-foreground">{rx.customer.firstName} {rx.customer.lastName}</span>
                <span className="text-muted-foreground text-xs">({rx.customer.phone})</span>
                <span className="text-muted-foreground text-[11px]">· {new Date(rx.createdAt).toLocaleString("tr-TR")}</span>
              </div>

              {/* Eye values grid */}
              <div className="grid grid-cols-2 gap-4 max-w-md">
                {/* Right */}
                <div>
                  <span className="text-[10px] font-bold text-primary block mb-1">SAĞ GÖZ</span>
                  <div className="grid grid-cols-3 gap-1 bg-background/50 p-1.5 rounded-lg border border-border-color text-center">
                    <div>
                      <p className="text-[8px] text-muted-foreground">SPH</p>
                      <p className="text-xs font-bold text-foreground">{rx.farRightSph || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-muted-foreground">CYL</p>
                      <p className="text-xs font-bold text-foreground">{rx.farRightCyl || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-muted-foreground">AX</p>
                      <p className="text-xs font-bold text-foreground">{rx.farRightAx || "—"}</p>
                    </div>
                  </div>
                </div>
                {/* Left */}
                <div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-secondary block mb-1">SOL GÖZ</span>
                  <div className="grid grid-cols-3 gap-1 bg-background/50 p-1.5 rounded-lg border border-border-color text-center">
                    <div>
                      <p className="text-[8px] text-muted-foreground">SPH</p>
                      <p className="text-xs font-bold text-foreground">{rx.farLeftSph || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-muted-foreground">CYL</p>
                      <p className="text-xs font-bold text-foreground">{rx.farLeftCyl || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-muted-foreground">AX</p>
                      <p className="text-xs font-bold text-foreground">{rx.farLeftAx || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extras */}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground pt-1">
                {(rx.pdRight || rx.pdLeft || rx.pdTotal) && (
                  <span>PD: <strong className="text-foreground font-semibold">Sağ {rx.pdRight || "-"} / Sol {rx.pdLeft || "-"} / Toplam {rx.pdTotal || "-"}</strong></span>
                )}
                {(rx.phRight || rx.phLeft) && (
                  <span>PH: <strong className="text-foreground font-semibold">Sağ {rx.phRight || "-"} / Sol {rx.phLeft || "-"}</strong></span>
                )}

                {rx.lensType && <span>Cam: <strong className="text-foreground font-semibold">{rx.lensType}</strong></span>}
                {rx.doctorName && <span>Doktor: <strong className="text-foreground font-semibold">{rx.doctorName}</strong></span>}
              </div>
              {rx.notes && (
                <p className="text-xs bg-background/40 p-2 rounded-lg border border-border-color text-foreground">
                  <strong className="text-[9px] text-muted-foreground block uppercase tracking-wider mb-0.5">Müşteri Notu:</strong>
                  {rx.notes}
                </p>
              )}
            </div>

            {/* Right side: Actions */}
            <div className="flex gap-2 items-center self-end md:self-center">
              <button
                disabled={loadingId === rx.id}
                onClick={() => handleReject(rx.id)}
                className="p-2 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Reddet ve Sil"
              >
                <X className="w-4 h-4" /> Reddet
              </button>
              <button
                disabled={loadingId === rx.id}
                onClick={() => handleApprove(rx.id)}
                className="p-2 gradient-primary text-[#1B242A] hover:opacity-90 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold glow-primary cursor-pointer"
                title="Doğrula ve Sisteme Kaydet"
              >
                {loadingId === rx.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Doğrula & Onayla
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
