"use client";

import { useEffect, useState } from "react";
import { Trash2, RotateCcw, Loader2, User, Package, Glasses, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function TrashPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/trash");
      const data = await res.json();
      if (res.ok) {
        setItems([...data.customers, ...data.orders, ...data.prescriptions]);
      } else {
        toast.error(data.error || "Çöp kutusu yüklenemedi.");
      }
    } catch (e: any) {
      toast.error("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAction = async (id: string, type: string, action: "RESTORE" | "HARD_DELETE") => {
    if (action === "HARD_DELETE" && !confirm("Bu öğeyi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }

    const toastId = toast.loading("İşlem yapılıyor...");
    try {
      const res = await fetch("/api/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type, action })
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(action === "RESTORE" ? "Öğe başarıyla geri yüklendi!" : "Öğe kalıcı olarak silindi.", { id: toastId });
        fetchItems();
      } else {
        toast.error(data.error || "İşlem başarısız.", { id: toastId });
      }
    } catch (e: any) {
      toast.error("Bir hata oluştu.", { id: toastId });
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'CUSTOMER') return <User className="w-5 h-5 text-blue-500" />;
    if (type === 'ORDER') return <Package className="w-5 h-5 text-amber-500" />;
    if (type === 'PRESCRIPTION') return <Glasses className="w-5 h-5 text-emerald-500" />;
    return <Trash2 className="w-5 h-5 text-muted-foreground" />;
  };

  const getTypeLabel = (type: string) => {
    if (type === 'CUSTOMER') return "Müşteri";
    if (type === 'ORDER') return "Sipariş";
    if (type === 'PRESCRIPTION') return "Reçete";
    return "Bilinmeyen";
  };

  const getDetailText = (item: any) => {
    if (item.type === 'CUSTOMER') return `${item.firstName} ${item.lastName} (${item.phone})`;
    if (item.type === 'ORDER') return `Sipariş No: ${item.id.slice(-6)}`;
    if (item.type === 'PRESCRIPTION') return `Reçete ID: ${item.id.slice(-6)}`;
    return "Detay yok";
  };

  return (
    <div className="page-container space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Trash2 className="w-7 h-7 text-red-500" /> Çöp Kutusu
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Silinen müşteriler, siparişler ve reçeteler 7 gün boyunca burada saklanır.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] w-full ">
          <div className="w-14 h-14 bg-surface border border-[var(--border-color)] shadow-xl rounded-2xl flex items-center justify-center relative z-10">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
          <p className="mt-4 text-sm font-semibold text-muted-foreground animate-pulse">
            Çöp kutusu yükleniyor...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="card p-16 text-center flex flex-col items-center gap-4 animate-in fade-in">
          <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center">
            <Trash2 className="w-10 h-10 text-secondary/50" />
          </div>
          <div>
            <p className="font-black text-foreground text-xl">Çöp Kutusu Boş</p>
            <p className="text-muted-foreground text-sm mt-1">Yakın zamanda silinen herhangi bir kayıt bulunmuyor.</p>
          </div>
        </div>
      ) : (
        <div className="">
          {/* ── Desktop Table ── */}
          <div className="card overflow-hidden hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-background border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Tür</th>
                  <th className="px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Detay</th>
                  <th className="px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Silinme Tarihi</th>
                  <th className="px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-background/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface border border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
                          {getTypeIcon(item.type)}
                        </div>
                        <span className="font-semibold text-foreground">
                          {getTypeLabel(item.type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground">
                      {getDetailText(item)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-background border border-[var(--border-color)] px-2.5 py-1.5 rounded-lg">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.deletedAt).toLocaleDateString("tr-TR")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleAction(item.id, item.type, "RESTORE")}
                          className="px-3 py-1.5 border border-[var(--border-color)] rounded-xl bg-background hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/20 text-muted-foreground text-xs font-bold inline-flex items-center transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Geri Yükle
                        </button>
                        <button 
                          onClick={() => handleAction(item.id, item.type, "HARD_DELETE")}
                          className="px-3 py-1.5 border border-red-500/20 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white text-xs font-bold inline-flex items-center transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Kalıcı Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="md:hidden space-y-3">
            {items.map((item, index) => (
              <div key={index} className="card p-4 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface border border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="font-bold text-foreground text-sm">
                      {getTypeLabel(item.type)}
                    </p>
                    <p className="text-muted-foreground text-sm truncate mt-0.5">
                      {getDetailText(item)}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-muted-foreground bg-background border border-[var(--border-color)] px-2 py-1 rounded-md">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.deletedAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-color)]">
                  <button 
                    onClick={() => handleAction(item.id, item.type, "RESTORE")}
                    className="flex-1 py-2 border border-[var(--border-color)] rounded-xl bg-background hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/20 text-muted-foreground text-xs font-bold flex items-center justify-center transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Geri Yükle
                  </button>
                  <button 
                    onClick={() => handleAction(item.id, item.type, "HARD_DELETE")}
                    className="flex-1 py-2 border border-red-500/20 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white text-xs font-bold flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Kalıcı Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
