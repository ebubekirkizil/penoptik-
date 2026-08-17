// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Save, X, Package, Hash, CreditCard, Calendar, Loader2, Info, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

type OrderEditProps = {
  order: {
    id: string;
    products: string | null;
    productCode: string | null;
    totalPrice: number | null;
    totalCost: number | null;
    deposit: number | null;
    balance: number | null;
    deliveryDate: string | null;
    paidInstallments?: number;
  };
};

export default function OrderEditForm({ order }: OrderEditProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const initialKapora = Math.max(0, (order.deposit || 0) - (order.paidInstallments || 0));
  const [form, setForm] = useState({
    products: order.products || "",
    productCode: order.productCode || "",
    totalPrice: order.totalPrice?.toString() || "",
    totalCost: order.totalCost?.toString() || "",
    kapora: initialKapora.toString(),
    deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split("T")[0] : "",
  });

  // Sync state with props if order changes externally
  useEffect(() => {
    if (!open) {
      setForm({
        products: order.products || "",
        productCode: order.productCode || "",
        totalPrice: order.totalPrice?.toString() || "",
        totalCost: order.totalCost?.toString() || "",
        kapora: Math.max(0, (order.deposit || 0) - (order.paidInstallments || 0)).toString(),
        deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split("T")[0] : "",
      });
    }
  }, [order, open]);

  const paidInst = order.paidInstallments || 0;

  const derivedTotalTaken = () => {
    const k = parseFloat(form.kapora) || 0;
    return k + paidInst;
  };

  const derivedBalance = () => {
    const t = parseFloat(form.totalPrice) || 0;
    return t > 0 ? t - derivedTotalTaken() : (order.balance || 0);
  };

  const handleSave = async () => {
    if (derivedBalance() < 0) {
      toast.error("Alınan toplam ödeme (kapora + taksitler), satış tutarından büyük olamaz!");
      return;
    }
    const toastId = toast.loading("Sipariş güncelleniyor...");
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: form.products || null,
          productCode: form.productCode || null,
          totalPrice: form.totalPrice || null,
          totalCost: form.totalCost || null,
          deposit: derivedTotalTaken().toString(),
          balance: derivedBalance().toString(),
          deliveryDate: form.deliveryDate || null,
        }),
      });
      if (res.ok) {
        toast.success("Sipariş başarıyla güncellendi!", { id: toastId });
        setOpen(false);
        router.refresh();
      } else {
        throw new Error("Güncelleme başarısız");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Hata: " + (e.message || "Bilinmeyen hata"), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bu siparişi tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    
    const toastId = toast.loading("Sipariş siliniyor...");
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Sipariş başarıyla silindi!", { id: toastId });
        setOpen(false);
        router.refresh();
      } else {
        throw new Error("Silme işlemi başarısız");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Hata: " + (e.message || "Bilinmeyen hata"), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-white dark:bg-surface hover:bg-slate-50 dark:hover:bg-surface-light text-foreground hover:text-primary font-semibold text-sm transition-all border border-border-color hover:border-primary/40 rounded-xl px-4 py-3 shadow-sm active:scale-[0.98]"
      >
        <Edit3 className="w-4 h-4 text-primary" /> Siparişi Düzenle
      </button>
    );
  }

  return (
    <div className="bg-surface/60 rounded-xl border border-primary/20 p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-foreground text-xs font-semibold flex items-center gap-1.5">
          <Edit3 className="w-3.5 h-3.5 text-primary" /> Sipariş Düzenle
        </p>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Products / Item code */}
      <div>
        <label className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
          <Hash className="w-3 h-3" /> Ürün Adı / Cinsi
        </label>
        <input
          type="text"
          value={form.products}
          onChange={e => setForm(p => ({ ...p, products: e.target.value }))}
          placeholder="Örn: Ray-Ban Çerçeve + Essilor Cam"
          className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all mb-2"
        />
        <label className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
          <Hash className="w-3 h-3" /> Ürün Kodu
        </label>
        <input
          type="text"
          value={form.productCode}
          onChange={e => setForm(p => ({ ...p, productCode: e.target.value }))}
          placeholder="Örn: RB3025"
          className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Financial fields */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div>
          <label className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
            <CreditCard className="w-3 h-3" /> Maliyet (₺)
          </label>
          <input
            type="number" min="0" step="0.01"
            value={form.totalCost}
            onChange={e => setForm(p => ({ ...p, totalCost: e.target.value }))}
            placeholder="0"
            className="w-full bg-surface border border-border-color rounded-lg px-2 py-2 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
        <div>
          <label className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
            <CreditCard className="w-3 h-3" /> Satış (₺)
          </label>
          <input
            type="number" min="0" step="0.01"
            value={form.totalPrice}
            onChange={e => setForm(p => ({ ...p, totalPrice: e.target.value }))}
            placeholder="0"
            className="w-full bg-surface border border-border-color rounded-lg px-2 py-2 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Kapora (₺)</label>
            <div className="group relative flex items-center">
              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help hover:text-primary transition-colors" />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-[220px] p-2.5 bg-surface border border-border-color shadow-lg rounded-lg text-[11px] text-foreground opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10 text-center leading-relaxed">
                Bu alan <strong>sadece ilk başta alınan peşinatı (kaporayı)</strong> temsil eder. <br/><br/>Sonradan yapılan taksit ödemeleri buraya dahil edilmez.
              </div>
            </div>
          </div>
          <input
            type="number" min="0" step="0.01"
            value={form.kapora}
            onChange={e => setForm(p => ({ ...p, kapora: e.target.value }))}
            placeholder="0"
            className="w-full bg-surface border border-border-color rounded-lg px-2 py-2 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">Toplam Alınan</label>
            <div className="group relative flex items-center">
              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help hover:text-primary transition-colors" />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-[220px] p-2.5 bg-surface border border-border-color shadow-lg rounded-lg text-[11px] text-foreground opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10 text-center leading-relaxed">
                Hem kapora hem de sonradan müşteriden alınan tüm taksit ödemelerinin toplamıdır.
              </div>
            </div>
          </div>
          <input
            type="number" readOnly
            value={derivedTotalTaken()}
            placeholder="Otomatik"
            className="w-full bg-surface border border-border-color rounded-lg px-2 py-2 text-muted-foreground text-sm focus:outline-none transition-all opacity-70 cursor-not-allowed font-medium"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block font-semibold uppercase tracking-wider">Kalan Ödeme (₺)</label>
          <input
            type="number" readOnly
            value={derivedBalance()}
            placeholder="Otomatik"
            className="w-full bg-surface border border-border-color rounded-lg px-2 py-2 text-muted-foreground text-sm focus:outline-none transition-all opacity-70 cursor-not-allowed font-medium"
          />
        </div>
      </div>

      {/* Delivery date */}
      <div>
        <label className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
          <Calendar className="w-3 h-3" /> Teslim Tarihi
        </label>
        <input
          type="date"
          value={form.deliveryDate}
          onChange={e => setForm(p => ({ ...p, deliveryDate: e.target.value }))}
          className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleDelete}
          disabled={saving}
          className="glass border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center disabled:opacity-60"
          title="Siparişi Sil"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setOpen(false)}
          className="flex-1 glass border border-border-color text-muted-foreground py-2 rounded-lg text-xs font-semibold hover:text-foreground transition-all"
        >
          İptal
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-[2] gradient-primary text-[#1B242A] py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-all glow-primary flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Kaydediliyor...</> : <><Save className="w-3.5 h-3.5" /> Kaydet</>}
        </button>
      </div>
    </div>
  );
}
