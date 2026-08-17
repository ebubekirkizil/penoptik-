"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Hash, CreditCard, Calendar, Save, UserPlus, Users } from "lucide-react";
import { CustomerCombobox } from "@/components/CustomerCombobox";

type Customer = { id: string; firstName: string; lastName: string; phone: string };
type Prescription = { id: string; farRightSph?: string | null; farLeftSph?: string | null; createdAt: string };

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Yükleniyor...</div>}>
      <NewOrderForm />
    </Suspense>
  );
}

function NewOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preCustomerId = searchParams.get("customerId");

  const [tab, setTab] = useState<"EXISTING" | "NEW">(preCustomerId ? "EXISTING" : "EXISTING");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customerId:     preCustomerId || "",
    newFirstName:   "",
    newLastName:    "",
    newPhone:       "",
    prescriptionId: "",
    status:         "PENDING",
    products:       "",
    productCode:    "",
    totalPrice:     "",
    deposit:        "",
    balance:        "",
    deliveryDate:   "",
  });

  useEffect(() => {
    fetch("/api/customers").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setCustomers(data);
    });
  }, []);

  useEffect(() => {
    let active = true;
    if (tab === "NEW" || !form.customerId) { setPrescriptions([]); return; }
    fetch(`/api/customers/${form.customerId}`).then(r => r.json()).then(data => {
      if (active && data.prescriptions) setPrescriptions(data.prescriptions);
    });
    return () => { active = false; };
  }, [form.customerId, tab]);

  const derivedBalance = () => {
    const total   = parseFloat(form.totalPrice) || 0;
    const deposit = parseFloat(form.deposit)    || 0;
    return total > 0 ? String(total - deposit) : form.balance;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (tab === "EXISTING" && !form.customerId) {
      setError("Lütfen bir müxteri seçin.");
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        customerId:     tab === "EXISTING" ? form.customerId : "NEW",
        prescriptionId: form.prescriptionId || null,
        status:         form.status,
        products:       form.products || null,
        productCode:    form.productCode || null,
        totalPrice:     form.totalPrice || null,
        deposit:        form.deposit    || null,
        balance:        derivedBalance() || null,
        deliveryDate:   form.deliveryDate || null,
      };

      if (tab === "NEW") {
        const cleanedPhone = form.newPhone.replace(/[\s\-\(\)]+/g, "");
        if (cleanedPhone.length < 10) {
          throw new Error("Geçerli bir telefon numarası girin.");
        }
        payload.customerData = {
          firstName: form.newFirstName,
          lastName: form.newLastName,
          phone: cleanedPhone,
        };
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.refresh();
      router.push(`/admin/customers/${data.customerId}`);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Bilinmeyen bir hata oluxtu.");
    } finally {
      setLoading(false);
    }
  };

  const f = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const setF = (field: keyof typeof form, val: string) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const inputClass = "w-full bg-white/50 dark:bg-surface-light  rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm";
  const labelClass = "block text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider";

  return (
    <div className="relative min-h-screen">
      {/* Subtle animated background gradient blob */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '10s' }} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto z-10 relative">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1 bg-white/50 dark:bg-surface-light px-3 py-1.5 rounded-lg  backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4" /> Siparixlere Dön
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center glow-primary shrink-0">
            <Package className="w-7 h-7 text-[#1B242A]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Yeni Siparix Oluxtur</h1>
            <p className="text-muted-foreground text-sm mt-1">Müxteriyi seçin ve siparix detaylarını girin. Yepyeni bir deneyim.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface shadow-sm rounded-3xl p-6 sm:p-8  shadow-2xl backdrop-blur-2xl">
          
          {/* TABS */}
          <div className="flex gap-2 mb-8 p-1.5 bg-white/60 dark:bg-surface  rounded-2xl">
            <button
              type="button"
              onClick={() => setTab("EXISTING")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${tab === "EXISTING" ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]" : "text-muted-foreground hover:text-foreground hover:bg-white-hover"}`}
            >
              <Users className="w-4 h-4" /> Kayıtlı Müxteri
            </button>
            <button
              type="button"
              onClick={() => setTab("NEW")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${tab === "NEW" ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]" : "text-muted-foreground hover:text-foreground hover:bg-white-hover"}`}
            >
              <UserPlus className="w-4 h-4" /> Yeni Müxteri
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Customer Selection or Creation */}
            <div className="space-y-4">
              {tab === "EXISTING" ? (
                <div>
                  <label className={labelClass}>Müxteri Arama *</label>
                  <CustomerCombobox
                    customers={customers}
                    value={form.customerId}
                    onChange={(id) => setF("customerId", id)}
                  />
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Ad *</label>
                      <input required type="text" value={form.newFirstName} onChange={f("newFirstName")} placeholder="Örn: Ahmet" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Soyad *</label>
                      <input required type="text" value={form.newLastName} onChange={f("newLastName")} placeholder="Örn: Yılmaz" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Telefon *</label>
                    <input required type="tel" value={form.newPhone} onChange={f("newPhone")} placeholder="0555 444 33 22" className={inputClass} />
                  </div>
                </div>
              )}
            </div>

            {/* Prescription */}
            {tab === "EXISTING" && prescriptions.length > 0 && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <label className={labelClass}>Kayıtlı Reçete (İsteğe Bağlı)</label>
                <select value={form.prescriptionId} onChange={f("prescriptionId")} className={inputClass}>
                  <option value="">— Reçete Seçin —</option>
                  {prescriptions.map(rx => (
                    <option key={rx.id} value={rx.id}>
                      {new Date(rx.createdAt).toLocaleDateString("tr-TR")} · Sağ SPH: {rx.farRightSph || "—"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="h-px w-full bg-gradient-to-r from-transparent via-border-color to-transparent my-6" />

            {/* Status & Delivery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Siparix Durumu</label>
                <select value={form.status} onChange={f("status")} className={inputClass}>
                  <option value="PENDING">Bekliyor</option>
                  <option value="PREPARING">Hazırlanıyor</option>
                  <option value="READY">Teslime Hazır</option>
                  <option value="DELIVERED">Teslim Edildi</option>
                </select>
              </div>
              <div>
                <label className={`${labelClass} flex items-center gap-1`}>
                  <Calendar className="w-3.5 h-3.5" /> Teslim Tarihi
                </label>
                <input type="date" value={form.deliveryDate} onChange={f("deliveryDate")} className={inputClass} />
              </div>
            </div>

            {/* Products / Item code */}
            <div className="space-y-4 pt-2">
              <h3 className="text-foreground font-semibold flex items-center gap-2  pb-2 mb-4">
                <Hash className="w-4 h-4 text-primary" /> Ürün Detayları
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Ürün Adı / Cinsi (Çerçeve, Cam vb.)</label>
                  <input
                    type="text"
                    value={form.products}
                    onChange={f("products")}
                    placeholder="Örn: Ray-Ban Çerçeve + Essilor Crizal Cam"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Ürün Kodu / Barkod</label>
                  <input
                    type="text"
                    value={form.productCode}
                    onChange={f("productCode")}
                    placeholder="Örn: RB3025, EC-180"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Financial */}
            <div className="pt-2">
              <h3 className="text-foreground font-semibold flex items-center gap-2  pb-2 mb-4">
                <CreditCard className="w-4 h-4 text-primary" /> Finansal Bilgiler
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Satıx Tutarı ( )</p>
                  <input type="number" min="0" step="0.01" value={form.totalPrice} onChange={f("totalPrice")} placeholder="6000" className={`${inputClass} text-lg font-semibold`} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Alınan Ödeme ( )</p>
                  <input type="number" min="0" step="0.01" value={form.deposit} onChange={f("deposit")} placeholder="Alınan Ödeme / Tamamı" className={`${inputClass} text-lg font-semibold`} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Kalan Ödeme ( )</p>
                  <input
                    type="number" min="0" step="0.01"
                    value={derivedBalance()}
                    onChange={f("balance")}
                    placeholder="Otomatik"
                    className={`${inputClass} text-lg font-semibold opacity-70 bg-white/20 dark:bg-surface-light/20`}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> {error}
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <Link href="/admin/orders" className="flex-1 glass  text-muted-foreground py-4 rounded-2xl text-sm font-bold text-center hover:text-foreground transition-all flex items-center justify-center">
                İptal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] gradient-primary text-[#1B242A] py-4 rounded-2xl text-base font-black hover:opacity-90 hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 transition-all glow-primary flex items-center justify-center gap-2 shadow-xl"
              >
                {loading ? "Siparix İxleniyor..." : <><Save className="w-5 h-5" /> Siparixi Oluxtur</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
