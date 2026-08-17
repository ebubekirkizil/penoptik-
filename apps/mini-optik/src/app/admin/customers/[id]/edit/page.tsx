// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, User, Phone, Mail, MapPin, Stethoscope, StickyNote, Loader2, CheckCircle } from "lucide-react";
import CustomerDeleteButton from "@/components/CustomerDeleteButton";

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const isSubmitting = useRef(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    tcNo: "",
    diseases: "",
    notes: "",
  });

  useEffect(() => {
    params.then(({ id: resolvedId }) => {
      setId(resolvedId);
      fetch(`/api/customers/${resolvedId}`)
        .then(r => r.json())
        .then(data => {
          if (data.error) {
            setError("Müşteri bulunamadı.");
            return;
          }
          setForm({
            firstName: data.firstName || "",
            lastName:  data.lastName  || "",
            phone:     data.phone     || "",
            email:     data.email     || "",
            address:   data.address   || "",
            tcNo:      data.tcNo      || "",
            diseases:  data.diseases  || "",
            notes:     data.notes     || "",
          });
        })
        .catch(() => setError("Müşteri bilgileri yüklenemedi."))
        .finally(() => setLoading(false));
    });
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setError("");

    if (!form.firstName || !form.lastName || !form.phone) {
      setError("Ad, soyad ve telefon zorunludur.");
      isSubmitting.current = false;
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncelleme başarısız.");

      setSaved(true);
      setTimeout(() => {
        router.refresh();
        router.push(`/admin/customers/${id}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
      isSubmitting.current = false;
    } finally {
      setSaving(false);
    }
  };

  const f = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/customers/${id}`} className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Müşteri Detayı
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center glow-primary">
          <User className="w-6 h-6 text-[#1B242A]" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Müşteri Düzenle</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Bilgileri güncelleyin ve kaydedin</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl px-4 py-3 text-sm mb-6">
          ⚠ {error}
        </div>
      )}

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl px-4 py-3 text-sm mb-6 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Kaydedildi! Yönlendiriliyorsunuz...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white dark:bg-surface shadow-sm rounded-2xl p-6  space-y-4">
          <h3 className="text-foreground font-semibold flex items-center gap-2  pb-3">
            <User className="w-4 h-4 text-primary" /> Kişisel Bilgiler
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ad *" icon={<User className="w-4 h-4" />} value={form.firstName} onChange={f("firstName")} required />
            <Field label="Soyad *" icon={<User className="w-4 h-4" />} value={form.lastName} onChange={f("lastName")} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Telefon *" icon={<Phone className="w-4 h-4" />} value={form.phone} onChange={f("phone")} type="tel" required />
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">
                TC Kimlik No
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.tcNo}
                  onChange={f("tcNo")}
                  className="w-full bg-slate-50 dark:bg-surface-light rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="E-posta" icon={<Mail className="w-4 h-4" />} value={form.email} onChange={f("email")} type="email" />
          </div>
          <Field label="Adres" icon={<MapPin className="w-4 h-4" />} value={form.address} onChange={f("address")} />
        </div>

        {/* Health & Notes */}
        <div className="bg-white dark:bg-surface shadow-sm rounded-2xl p-6  space-y-4">
          <h3 className="text-foreground font-semibold flex items-center gap-2  pb-3">
            <Stethoscope className="w-4 h-4 text-red-400" /> Sağlık Bilgileri
          </h3>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Stethoscope className="w-3 h-3 text-red-400" /> Hastalık / Rahatsızlık
            </label>
            <textarea
              rows={3}
              value={form.diseases}
              onChange={f("diseases")}
              placeholder="Diyabet, hipertansiyon, vb..."
              className="w-full bg-white dark:bg-surface  rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider flex items-center gap-1">
              <StickyNote className="w-3 h-3 text-amber-400" /> Özel Notlar
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={f("notes")}
              placeholder="Ek notlar..."
              className="w-full bg-white dark:bg-surface  rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href={`/admin/customers/${id}`}
            className="flex-1 glass  text-muted-foreground py-4 rounded-xl font-bold text-center hover:text-foreground transition-all"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={saving || saved}
            className="flex-[2] gradient-primary text-[#1B242A] py-4 rounded-xl font-bold hover:opacity-90 hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 transition-all glow-primary flex items-center justify-center gap-2 text-base"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor...</>
            ) : saved ? (
              <><CheckCircle className="w-4 h-4" /> Kaydedildi!</>
            ) : (
              <><Save className="w-5 h-5" /> Değişiklikleri Kaydet</>
            )}
          </button>
        </div>
      </form>

      <CustomerDeleteButton customerId={id} customerName={`${form.firstName} ${form.lastName}`.trim()} />
    </div>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          className={`w-full bg-slate-50 dark:bg-surface-light rounded-xl py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm ${icon ? "pl-10 pr-4" : "px-4"}`}
        />
      </div>
    </div>
  );
}
