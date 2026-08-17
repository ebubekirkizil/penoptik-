// @ts-nocheck
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, CreditCard, Calendar, Save, UserPlus, Users, CheckCircle, Plus, Trash2, Settings, Zap } from "lucide-react";
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
    customerId: preCustomerId || "",
    newFirstName: "",
    newLastName: "",
    newPhone: "",
    newTcNo: "",
    prescriptionId: "",
    status: "PENDING",
    products: "",
    productCode: "",
    totalPrice: "",
    deposit: "",
    balance: "",
    deliveryDate: "",
    installmentCount: "1",
    installmentFrequency: "MONTHLY",
    installmentMode: "AUTO" as "AUTO" | "MANUAL",
    manualInstallments: [] as { amount: string; dueDate: string }[],
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
    const total = parseFloat(form.totalPrice) || 0;
    const deposit = parseFloat(form.deposit) || 0;
    return total > 0 ? String(Math.max(0, total - deposit)) : form.balance;
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

    const total = parseFloat(form.totalPrice) || 0;
    const deposit = parseFloat(form.deposit) || 0;
    if (deposit > total) {
      setError("Alınan ödeme (kapora) tutarı, satıx tutarından büyük olamaz.");
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        customerId: tab === "EXISTING" ? form.customerId : "NEW",
        prescriptionId: form.prescriptionId || null,
        status: form.status,
        products: form.products || null,
        productCode: form.productCode || null,
        totalPrice: form.totalPrice || null,
        deposit: form.deposit || null,
        balance: derivedBalance() || null,
        deliveryDate: form.deliveryDate || null,
      };

      if (tab === "NEW") {
        const cleanedPhone = form.newPhone.replace(/[\s\-\(\)]+/g, "");
        if (cleanedPhone.length < 10) throw new Error("Geçerli bir telefon numarası girin.");
        payload.customerData = {
          firstName: form.newFirstName,
          lastName: form.newLastName,
          phone: cleanedPhone,
          tcNo: form.newTcNo || null,
        };
      }

      payload.installmentCount = parseInt(form.installmentCount) || 1;
      payload.installmentFrequency = form.installmentFrequency || "MONTHLY";
      payload.installmentMode = form.installmentMode;
      payload.manualInstallments = form.manualInstallments;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.refresh();
      router.push(`/demo/sample-optic/customers/${data.customerId}`);
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

  const setF = (field: keyof typeof form, val: string) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const [manualAmount, setManualAmount] = useState("");
  const [manualDate, setManualDate] = useState("");

  const handleAddManualInst = () => {
    if (!manualAmount || !manualDate) return;
    setForm(prev => ({
      ...prev,
      manualInstallments: [...prev.manualInstallments, { amount: manualAmount, dueDate: manualDate }]
    }));
    setManualAmount("");
    setManualDate("");
  };

  const handleRemoveManualInst = (index: number) => {
    setForm(prev => ({
      ...prev,
      manualInstallments: prev.manualInstallments.filter((_, i) => i !== index)
    }));
  };

  const inp = "w-full bg-background border border-[var(--border-color)] rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm";
  const lbl = "block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider";

  return (
    <div className="page-container max-w-2xl">
      {/* Geri */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm bg-surface px-3 py-2 rounded-xl border border-[var(--border-color)] transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Geri Dön
        </button>
      </div>

      {/* Baxlık */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Yeni Siparix</h1>
        <p className="text-muted-foreground text-sm mt-1">Müxteriyi seçin ve siparix detaylarını doldurun.</p>
      </div>

      <div className="card p-5 sm:p-7">
        {/* Sekmeler */}
        <div className="flex gap-2 mb-7 p-1 bg-background rounded-2xl border border-[var(--border-color)]">
          {[
            { key: "EXISTING", icon: <Users className="w-4 h-4" />, label: "Kayıtlı Müxteri" },
            { key: "NEW", icon: <UserPlus className="w-4 h-4" />, label: "Yeni Müxteri" },
          ].map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key as any)}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                tab === t.key ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── MÜŞTERİ ── */}
          {tab === "EXISTING" ? (
            <div>
              <label className={lbl}>Müxteri Seç *</label>
              <CustomerCombobox customers={customers} value={form.customerId} onChange={(id) => setF("customerId", id)} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Ad *</label>
                  <input required type="text" value={form.newFirstName} onChange={f("newFirstName")} placeholder="Ahmet" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Soyad *</label>
                  <input required type="text" value={form.newLastName} onChange={f("newLastName")} placeholder="Yılmaz" className={inp} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Telefon *</label>
                  <input required type="tel" value={form.newPhone} onChange={f("newPhone")} placeholder="0555 444 33 22" className={inp} />
                </div>
                <div>
                  <label className={lbl}>TC Kimlik No</label>
                  <input type="text" maxLength={11} value={form.newTcNo} onChange={f("newTcNo")} placeholder="11 Haneli TC" className={inp} />
                </div>
              </div>
            </div>
          )}

          {/* ── REÇETE ── */}
          {tab === "EXISTING" && prescriptions.length > 0 && (
            <div>
              <label className={lbl}>Kayıtlı Reçete (İsteğe Bağlı)</label>
              <select value={form.prescriptionId} onChange={f("prescriptionId")} className={inp}>
                <option value="">— Reçete Seçin —</option>
                {prescriptions.map(rx => (
                  <option key={rx.id} value={rx.id}>
                    {new Date(rx.createdAt).toLocaleDateString("tr-TR")} · Sağ SPH: {rx.farRightSph || "—"}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ── AYIRICI ── */}
          <div className="h-px bg-[var(--border-color)]" />

          {/* ── SİPARİŞ BİLGİLERİ ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Siparix Bilgileri</span>
              <div className="flex-1 h-px bg-[var(--border-color)]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Siparix Durumu</label>
                <select value={form.status} onChange={f("status")} className={inp}>
                  <option value="PENDING">Bekliyor</option>
                  <option value="PREPARING">Hazırlanıyor</option>
                  <option value="READY">Teslime Hazır</option>
                  <option value="DELIVERED">Teslim Edildi</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Teslim Tarihi</label>
                <input type="date" value={form.deliveryDate} onChange={f("deliveryDate")} className={inp} />
              </div>
            </div>
          </div>

          {/* ── ÜRÜN ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Ürün Detayları (Otomatik Tamamlama & Barkod)</span>
              <div className="flex-1 h-px bg-[var(--border-color)]" />
            </div>
            
            {/* Ürün Arama (Akıllı Tamamlama & Barkod) */}
            <div className="mb-4">
              <label className={lbl}>Akıllı Arama veya Barkod Okutun</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ürün adı, barkod veya kodu yazın..." 
                  className={`${inp} pl-10 border-primary/50 bg-primary/5`}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase();
                    // Mock ürün araması
                    const mockProducts = [
                      { id: "prod_1", name: "Buz Mavisi Kırmızı Çerçeve", barcode: "8691234567890", costPrice: 3000, sellingPrice: 10000, taxRate: 20 },
                      { id: "prod_2", name: "Varilux Comfort Max", barcode: "VRX-MAX-01", costPrice: 2000, sellingPrice: 4500, taxRate: 20 },
                      { id: "prod_3", name: "Zeiss SmartLife", barcode: "ZS-LF-01", costPrice: 3500, sellingPrice: 6200, taxRate: 20 }
                    ];
                    
                    const found = mockProducts.find(p => p.name.toLowerCase().includes(val) || p.barcode.toLowerCase() === val);
                    if (found && val.length > 3) {
                      setForm(prev => ({
                        ...prev,
                        products: found.name,
                        productCode: found.barcode,
                        totalPrice: String(found.sellingPrice)
                      }));
                    }
                  }}
                />
                <Zap className="w-5 h-5 text-primary absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Örn: "buz mavisi" yazarak Stok Takibi modülünden ürünü otomatik çekebilirsiniz.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={lbl}>Ürün Adı / Cinsi (Çerçeve, Cam vb.)</label>
                <input type="text" value={form.products} onChange={f("products")} placeholder="Örn: Ray-Ban Çerçeve + Essilor Crizal Cam" className={inp} />
              </div>
              <div>
                <label className={lbl}>Ürün Kodu / Barkod</label>
                <input type="text" value={form.productCode} onChange={f("productCode")} placeholder="Örn: RB3025, EC-180" className={inp} />
              </div>
            </div>
          </div>

          {/* ── FİNANSAL ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-bold text-foreground">Ödeme Bilgileri</span>
              <div className="flex-1 h-px bg-[var(--border-color)]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Satıx Tutarı ( )</label>
                <input
                  type="number" min="0" step="0.01"
                  value={form.totalPrice}
                  onChange={f("totalPrice")}
                  placeholder="0,00"
                  className={`${inp} font-bold text-base`}
                />
              </div>
              <div>
                <label className={lbl}>Alınan Ödeme ( )</label>
                <input
                  type="number" min="0" step="0.01"
                  value={form.deposit}
                  onChange={f("deposit")}
                  placeholder="0,00"
                  className={`${inp} font-bold text-base`}
                />
              </div>
              <div>
                <label className={lbl}>Kalan Ödeme ( )</label>
                <input
                  type="number" min="0" step="0.01"
                  value={derivedBalance()}
                  readOnly
                  placeholder="Otomatik"
                  className="w-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 rounded-xl px-4 py-3 text-emerald-700 dark:text-emerald-400 font-bold text-base focus:outline-none cursor-not-allowed"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Otomatik hesaplanır</p>
              </div>
            </div>

            {Number(derivedBalance()) > 0 && (
              <div className="mt-6 p-5 rounded-2xl border border-border-color bg-surface/50 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-border-color">
                  <span className="text-sm font-bold text-foreground">Kalan Bakiye Taksitlendirmesi</span>
                  <div className="flex w-full sm:w-auto bg-background p-1 rounded-xl border border-border-color">
                    <button
                      type="button"
                      onClick={() => setF("installmentMode", "AUTO")}
                      className={`flex-1 justify-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${form.installmentMode === 'AUTO' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Zap className="w-3.5 h-3.5" /> Otomatik
                    </button>
                    <button
                      type="button"
                      onClick={() => setF("installmentMode", "MANUAL")}
                      className={`flex-1 justify-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${form.installmentMode === 'MANUAL' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Settings className="w-3.5 h-3.5" /> Manuel
                    </button>
                  </div>
                </div>

                {form.installmentMode === "AUTO" ? (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={lbl}>Taksit Sayısı</label>
                        <select value={form.installmentCount} onChange={f("installmentCount")} className={inp}>
                          <option value="1">Pexin / Tek Çekim (Taksit Yok)</option>
                          <option value="2">2 Taksit</option>
                          <option value="3">3 Taksit</option>
                          <option value="4">4 Taksit</option>
                          <option value="5">5 Taksit</option>
                          <option value="6">6 Taksit</option>
                          <option value="9">9 Taksit</option>
                          <option value="12">12 Taksit</option>
                        </select>
                      </div>
                      {parseInt(form.installmentCount) > 1 && (
                        <div>
                          <label className={lbl}>Taksit Aralığı</label>
                          <select value={form.installmentFrequency} onChange={f("installmentFrequency")} className={inp}>
                            <option value="MONTHLY">Aylık (Her Ay)</option>
                            <option value="BIWEEKLY">15 Günlük (İki Haftada Bir)</option>
                            <option value="WEEKLY">Haftalık (Her Hafta)</option>
                          </select>
                        </div>
                      )}
                    </div>
                    {parseInt(form.installmentCount) > 1 && (
                      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <p className="text-xs text-amber-600 dark:text-amber-500 font-medium leading-relaxed">
                          Kalan <strong>{Number(derivedBalance()).toLocaleString("tr-TR")}  </strong> tutar, <strong>{form.installmentCount}</strong> exit takside bölünecek ve ilk taksit 1 dönem ({form.installmentFrequency === "WEEKLY" ? "hafta" : form.installmentFrequency === "BIWEEKLY" ? "15 gün" : "ay"}) sonra baxlayacak xekilde hesaplanacaktır. Küsüratlar son taksite yansıtılır.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-end gap-2 mb-4">
                      <div className="flex-1">
                        <label className={lbl}>Tutar ( )</label>
                        <input
                          type="number" min="0" step="0.01"
                          value={manualAmount}
                          onChange={e => setManualAmount(e.target.value)}
                          placeholder="0.00"
                          className={inp}
                        />
                      </div>
                      <div className="flex-1">
                        <label className={lbl}>Tarih</label>
                        <input
                          type="date"
                          value={manualDate}
                          onChange={e => setManualDate(e.target.value)}
                          className={inp}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddManualInst}
                        className="bg-primary hover:bg-primary/90 text-white p-3.5 rounded-xl transition-all shadow-sm"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {form.manualInstallments.length > 0 ? (
                      <div className="space-y-2 mt-4">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Eklenecek Taksitler</p>
                        {form.manualInstallments.map((inst, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border-color">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                {i + 1}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-foreground">{Number(inst.amount).toLocaleString("tr-TR")}  </p>
                                <p className="text-xs text-muted-foreground">{new Date(inst.dueDate).toLocaleDateString("tr-TR")}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveManualInst(i)}
                              className="text-muted-foreground hover:text-red-500 p-2 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        
                        {/* Bakiye Durumu Kontrolü */}
                        {(() => {
                          const planned = form.manualInstallments.reduce((sum, x) => sum + Number(x.amount), 0);
                          const remaining = Number(derivedBalance()) - planned;
                          return (
                            <div className={`mt-3 p-3 rounded-xl border text-xs font-medium flex justify-between items-center ${remaining === 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500'}`}>
                              <span>Planlanan: <strong>{planned.toLocaleString("tr-TR")}  </strong></span>
                              {remaining > 0 ? (
                                <span>Açıkta Kalan: <strong>{remaining.toLocaleString("tr-TR")}  </strong></span>
                              ) : remaining < 0 ? (
                                <span className="text-red-500">Fazla Planlanan: <strong>{Math.abs(remaining).toLocaleString("tr-TR")}  </strong></span>
                              ) : (
                                <span>Bakiye Tamamlandı <CheckCircle className="w-3.5 h-3.5 inline-block ml-1" /></span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-4 italic border border-dashed border-border-color rounded-xl">
                        Henüz manuel taksit eklemediniz.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── HATA ── */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* ── BUTONLAR ── */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-background border border-[var(--border-color)] text-muted-foreground py-3.5 rounded-xl text-sm font-semibold text-center hover:text-foreground transition-all"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] btn-primary py-3.5 justify-center font-black text-sm disabled:opacity-60"
            >
              {loading ? "İxleniyor..." : <><CheckCircle className="w-5 h-5" /> Siparixi Oluxtur</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
