// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

export default function CustomerDeleteButton({ customerId, customerName }: { customerId: string, customerName: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Silme işlemi başarısız.");
      
      router.push("/admin/customers");
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 border-t border-red-500/20 pt-6">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm"
        >
          <Trash2 className="w-4 h-4" /> Müşteriyi Kalıcı Olarak Sil
        </button>
      ) : (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-500 font-bold text-lg mb-1">Emin misiniz?</h4>
              <p className="text-red-400/80 text-sm">
                <strong>{customerName}</strong> isimli müşteriyi, tüm siparişlerini ve reçetelerini kalıcı olarak siliyorsunuz. Bu işlem <strong>asla geri alınamaz!</strong>
              </p>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 text-sm text-red-500 bg-red-500/20 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Evet, Kalıcı Olarak Sil
            </button>
            <button
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="flex-1 bg-surface border border-border-color hover:border-muted-foreground/30 text-foreground py-3 rounded-xl font-bold transition-all text-sm"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
