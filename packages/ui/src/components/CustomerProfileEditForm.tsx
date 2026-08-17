// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Edit3, X, Save, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";

interface CustomerProfileEditFormProps {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    address: string | null;
    diseases: string | null;
    notes: string | null;
  };
}

export default function CustomerProfileEditForm({ customer }: CustomerProfileEditFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [form, setForm] = useState({
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone, // Read-only in input, but required by API
    email: customer.email || "",
    address: customer.address || "",
    diseases: customer.diseases || "",
    notes: customer.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Profil güncelleniyor...");
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isCustomerRequest: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Profil güncellenirken bir hata oluştu.");
      }

      toast.success("Değişiklik talebiniz onaya gönderildi. Yetkili onayı sonrasında profilinize yansıyacaktır.", { id: toastId, duration: 5000 });
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
      toast.error("Hata: " + (err.message || "Bir hata oluştu"), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="glass border border-border-color text-muted-foreground hover:text-foreground hover:border-primary/40 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
      >
        <Edit3 className="w-4 h-4 text-primary" /> Profilimi Düzenle
      </button>
    );
  }

  const f = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" style={{ zIndex: 99999 }}>
      <div className="bg-surface border border-border-color rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-border-color flex items-center justify-between">
          <h2 className="text-foreground font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Profil Bilgilerimi Düzenle
          </h2>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          <form id="profile-form" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">Ad *</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={f("firstName")}
                  className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">Soyad *</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={f("lastName")}
                  className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">Telefon</label>
              <input
                type="text"
                disabled
                value={form.phone}
                className="w-full bg-background/50 border border-border-color rounded-lg px-3 py-2 text-sm text-muted-foreground cursor-not-allowed focus:outline-none"
                title="Telefon numarası güvenlik nedeniyle değiştirilemez."
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">E-posta</label>
              <input
                type="email"
                value={form.email}
                onChange={f("email")}
                placeholder="ornek@mail.com"
                className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">Adres</label>
              <textarea
                rows={3}
                value={form.address}
                onChange={f("address")}
                placeholder="Adresiniz..."
                className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
              />
            </div>

            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </form>
        </div>

        <div className="p-4 border-t border-border-color flex gap-3">
          <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer">İptal</button>
          <button type="button" onClick={handleSubmit} disabled={saving} className="flex-[2] py-2 gradient-primary rounded-lg text-[#1B242A] text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 cursor-pointer">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Kaydet
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
