// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Save, Loader2, FilePlus } from "lucide-react";
import toast from "react-hot-toast";

export default function PrescriptionAddForm({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    lensType: "",
    coating: "",
    farRightSph: "", farRightCyl: "", farRightAx: "",
    farLeftSph: "", farLeftCyl: "", farLeftAx: "",
    nearRightSph: "", nearRightCyl: "", nearRightAx: "",
    nearLeftSph: "", nearLeftCyl: "", nearLeftAx: "",
    constantRightSph: "", constantRightCyl: "", constantRightAx: "",
    constantLeftSph: "", constantLeftCyl: "", constantLeftAx: "",
    addRight: "", addLeft: "",
    pdRight: "", pdLeft: "", pdTotal: "",
    phRight: "", phLeft: "",
    doctorName: "", hospitalName: "", notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Reçete ekleniyor...");
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, customerId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Reçete eklenirken hata oluştu");
      }
      toast.success("Göz bilgisi başarıyla eklendi!", { id: toastId });
      setOpen(false);
      router.refresh();
      setForm({
        lensType: "",
        coating: "",
        farRightSph: "", farRightCyl: "", farRightAx: "",
        farLeftSph: "", farLeftCyl: "", farLeftAx: "",
        nearRightSph: "", nearRightCyl: "", nearRightAx: "",
        nearLeftSph: "", nearLeftCyl: "", nearLeftAx: "",
        constantRightSph: "", constantRightCyl: "", constantRightAx: "",
        constantLeftSph: "", constantLeftCyl: "", constantLeftAx: "",
        addRight: "", addLeft: "",
        pdRight: "", pdLeft: "", pdTotal: "",
        phRight: "", phLeft: "",
        doctorName: "", hospitalName: "", notes: ""
      });
    } catch (err: any) {
      setError(err.message);
      toast.error("Hata: " + err.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-primary hover:text-foreground text-sm font-medium flex items-center gap-1 transition-colors"
      >
        <Plus className="w-4 h-4" /> Manuel Ekle
      </button>
    );
  }

  const f = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface border border-border-color rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="p-4 border-b border-border-color flex items-center justify-between">
          <h2 className="text-foreground font-bold flex items-center gap-2">
            <FilePlus className="w-5 h-5 text-primary" /> Yeni Göz Bilgisi
          </h2>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          <form id="rx-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="relative col-span-2">
                <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">Cam Tipi</label>
                <input 
                  type="text" 
                  list="lens-types" 
                  value={form.lensType || ""} 
                  onChange={f("lensType")} 
                  placeholder="Örn: Tek Odaklı, Progresif..."
                  className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all shadow-sm"
                />
                <datalist id="lens-types">
                  <option value="Tek Odaklı (Single Vision)" />
                  <option value="Bifokal (Çift Odaklı)" />
                  <option value="Progresif (Çok Odaklı)" />
                  <option value="Asferik (İnce Tasarım)" />
                  <option value="Polikarbonat (Kırılmaz)" />
                  <option value="Trivex" />
                  <option value="Organik (CR-39)" />
                  <option value="Mineral (Cam)" />
                  <option value="Yüksek İndeksli (İnceltilmiş)" />
                  <option value="Renkli Cam / Güneş Gözlüğü" />
                </datalist>
              </div>
              <div className="relative col-span-2">
                <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">Kaplama / Filtre</label>
                <input 
                  type="text" 
                  list="coating-types" 
                  value={form.coating || ""} 
                  onChange={f("coating")} 
                  placeholder="Örn: Antirefle, Mavi Işık..."
                  className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all shadow-sm"
                />
                <datalist id="coating-types">
                  <option value="Antirefle (Yansıma Önleyici)" />
                  <option value="Mavi Işık Filtreli (Blue Control)" />
                  <option value="Fotokromik (Kolormatik)" />
                  <option value="Polarize" />
                  <option value="Sert Kaplama (Çizilmez)" />
                  <option value="Su/Kir İtici (Hidrofobik)" />
                  <option value="Kaplamasız" />
                </datalist>
              </div>
            </div>

            {/* MODERN RESPONSIVE LAYOUT */}
            <div className="space-y-4">
              
              {/* UZAK ÖLÇÜLERİ */}
              <div className="bg-surface shadow-sm dark:bg-surface/30 rounded-2xl p-4 border border-border-color/60 hover:shadow-md hover:border-orange-500/40 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center shadow-sm">
                    <span className="text-orange-500 font-bold text-[10px]">UZAK</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground">Uzak Görüş Ölçüleri</h4>
                </div>
                
                <div className="flex flex-col gap-3">
                  {/* SAĞ GÖZ */}
                  <div className="bg-background/80 dark:bg-background/50 rounded-xl p-3.5 border border-border-color/50 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-primary mb-2 block tracking-wider flex items-center gap-1">Sağ Göz (R)</span>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">SPH</label>
                        <input type="text" value={form.farRightSph || ""} onChange={f("farRightSph")} className="w-full bg-surface border border-border-color rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="+0.00" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">CYL</label>
                        <input type="text" value={form.farRightCyl || ""} onChange={f("farRightCyl")} className="w-full bg-surface border border-border-color rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="-0.00" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">AX</label>
                        <input type="text" value={form.farRightAx || ""} onChange={f("farRightAx")} className="w-full bg-surface border border-border-color rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="180" />
                      </div>
                    </div>
                  </div>
                  
                  {/* SOL GÖZ */}
                  <div className="bg-background/80 dark:bg-background/50 rounded-xl p-3.5 border border-border-color/50 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-secondary mb-2 block tracking-wider flex items-center gap-1">Sol Göz (L)</span>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">SPH</label>
                        <input type="text" value={form.farLeftSph || ""} onChange={f("farLeftSph")} className="w-full bg-surface border border-border-color rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="+0.00" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">CYL</label>
                        <input type="text" value={form.farLeftCyl || ""} onChange={f("farLeftCyl")} className="w-full bg-surface border border-border-color rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="-0.00" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">AX</label>
                        <input type="text" value={form.farLeftAx || ""} onChange={f("farLeftAx")} className="w-full bg-surface border border-border-color rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="180" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* YAKIN ÖLÇÜLERİ */}
              <div className="bg-surface shadow-sm dark:bg-surface/30 rounded-2xl p-4 border border-border-color/60 hover:shadow-md hover:border-emerald-500/40 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shadow-sm">
                    <span className="text-emerald-500 font-bold text-[10px]">YAKIN</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground">Yakın Görüş Ölçüleri</h4>
                </div>
                
                <div className="flex flex-col gap-3">
                  {/* SAĞ GÖZ */}
                  <div className="bg-background/80 dark:bg-background/50 rounded-xl p-3.5 border border-border-color/50 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-primary mb-2 block tracking-wider flex items-center gap-1">Sağ Göz (R)</span>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <input type="text" value={form.nearRightSph || ""} onChange={f("nearRightSph")} className="w-full bg-surface border border-border-color rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="SPH" />
                      </div>
                      <div>
                        <input type="text" value={form.nearRightCyl || ""} onChange={f("nearRightCyl")} className="w-full bg-surface border border-border-color rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="CYL" />
                      </div>
                      <div>
                        <input type="text" value={form.nearRightAx || ""} onChange={f("nearRightAx")} className="w-full bg-surface border border-border-color rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="AX" />
                      </div>
                    </div>
                  </div>
                  
                  {/* SOL GÖZ */}
                  <div className="bg-background/80 dark:bg-background/50 rounded-xl p-3.5 border border-border-color/50 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-secondary mb-2 block tracking-wider flex items-center gap-1">Sol Göz (L)</span>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <input type="text" value={form.nearLeftSph || ""} onChange={f("nearLeftSph")} className="w-full bg-surface border border-border-color rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="SPH" />
                      </div>
                      <div>
                        <input type="text" value={form.nearLeftCyl || ""} onChange={f("nearLeftCyl")} className="w-full bg-surface border border-border-color rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="CYL" />
                      </div>
                      <div>
                        <input type="text" value={form.nearLeftAx || ""} onChange={f("nearLeftAx")} className="w-full bg-surface border border-border-color rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="AX" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DAİMİ ÖLÇÜLERİ */}
              <div className="bg-surface shadow-sm dark:bg-surface/30 rounded-2xl p-4 border border-border-color/60 hover:shadow-md hover:border-blue-500/40 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shadow-sm">
                    <span className="text-blue-500 font-bold text-[10px]">DAİMİ</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground">Daimi Görüş Ölçüleri</h4>
                </div>
                
                <div className="flex flex-col gap-3">
                  {/* SAĞ GÖZ */}
                  <div className="bg-background/80 dark:bg-background/50 rounded-xl p-3.5 border border-border-color/50 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-primary mb-2 block tracking-wider flex items-center gap-1">Sağ Göz (R)</span>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <input type="text" value={form.constantRightSph || ""} onChange={f("constantRightSph")} className="w-full bg-surface border border-border-color rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="SPH" />
                      </div>
                      <div>
                        <input type="text" value={form.constantRightCyl || ""} onChange={f("constantRightCyl")} className="w-full bg-surface border border-border-color rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="CYL" />
                      </div>
                      <div>
                        <input type="text" value={form.constantRightAx || ""} onChange={f("constantRightAx")} className="w-full bg-surface border border-border-color rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="AX" />
                      </div>
                    </div>
                  </div>
                  
                  {/* SOL GÖZ */}
                  <div className="bg-background/80 dark:bg-background/50 rounded-xl p-3.5 border border-border-color/50 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-secondary mb-2 block tracking-wider flex items-center gap-1">Sol Göz (L)</span>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <input type="text" value={form.constantLeftSph || ""} onChange={f("constantLeftSph")} className="w-full bg-surface border border-border-color rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="SPH" />
                      </div>
                      <div>
                        <input type="text" value={form.constantLeftCyl || ""} onChange={f("constantLeftCyl")} className="w-full bg-surface border border-border-color rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="CYL" />
                      </div>
                      <div>
                        <input type="text" value={form.constantLeftAx || ""} onChange={f("constantLeftAx")} className="w-full bg-surface border border-border-color rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="AX" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PD & PH ÖLÇÜLERİ (YENİ) */}
              {/* PD & PH ÖLÇÜLERİ */}
              <div className="bg-surface shadow-sm dark:bg-surface/30 rounded-2xl p-4 border border-border-color/60 hover:shadow-md hover:border-purple-500/40 transition-all duration-300 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center shadow-sm">
                    <span className="text-purple-500 font-bold text-[10px]">PD/PH</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground">PD & PH Ölçüleri</h4>
                </div>
                
                <div className="flex flex-col gap-4">
                  {/* PD KISMI */}
                  <div className="bg-[var(--rx-pdph-bg,var(--background))] rounded-xl p-3.5 border border-[var(--rx-pdph-border,var(--border-color))] shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-[var(--rx-pdph-text,#9333ea)] mb-2 block tracking-wider">Pupil Mesafesi (PD)</span>
                    <div className="flex flex-row gap-3">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">SAĞ</label>
                        <input type="text" value={form.pdRight || ""} onChange={f("pdRight")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 focus:outline-none text-center transition-all" placeholder="Örn: 31" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">SOL</label>
                        <input type="text" value={form.pdLeft || ""} onChange={f("pdLeft")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 focus:outline-none text-center transition-all" placeholder="Örn: 31" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">TOPLAM</label>
                        <input type="text" value={form.pdTotal || ""} onChange={f("pdTotal")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 focus:outline-none text-center transition-all" placeholder="Örn: 62" />
                      </div>
                    </div>
                  </div>

                  {/* PH KISMI */}
                  <div className="bg-[var(--rx-pdph-bg,var(--background))] rounded-xl p-3.5 border border-[var(--rx-pdph-border,var(--border-color))] shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-[var(--rx-pdph-text,#4f46e5)] mb-2 block tracking-wider">Pupilya Yüksekliği (PH)</span>
                    <div className="flex flex-row gap-3">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">SAĞ</label>
                        <input type="text" value={form.phRight || ""} onChange={f("phRight")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none text-center transition-all" placeholder="Örn: 22" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">SOL</label>
                        <input type="text" value={form.phLeft || ""} onChange={f("phLeft")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none text-center transition-all" placeholder="Örn: 22" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-border-color/50">
              <div className="bg-background/30 rounded-xl border border-border-color p-4">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Adisyon (ADD) & Ekstra
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5">Sağ ADD</label>
                    <input type="text" value={form.addRight || ""} onChange={f("addRight")} className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5">Sol ADD</label>
                    <input type="text" value={form.addLeft || ""} onChange={f("addLeft")} className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="bg-background/30 rounded-xl border border-border-color p-4">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Muayene Eden Kurum
                </p>
                <div className="space-y-3">
                  <div>
                    <input type="text" value={form.doctorName || ""} onChange={f("doctorName")} placeholder="Doktor Adı" className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary outline-none transition-all" />
                  </div>
                  <div>
                    <input type="text" value={form.hospitalName || ""} onChange={f("hospitalName")} placeholder="Hastane Adı" className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary outline-none transition-all" list="hospital-list" />
                  <datalist id="hospital-list">
                    <option value="Devlet Hastanesi" />
                    <option value="Şehir Hastanesi" />
                    <option value="Eğitim ve Araştırma Hastanesi" />
                    <option value="Özel Göz Hastanesi" />
                    <option value="Dünyagöz Hastanesi" />
                    <option value="Veni Vidi Göz" />
                    <option value="Kudret Göz" />
                    <option value="Göz Vakfı Hastanesi" />
                  </datalist>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-border-color/50">
              <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-2">Reçeteye Özel Notlar</label>
              <textarea
                rows={2}
                value={form.notes || ""}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Örn: Müşteri organik cam tercih ediyor..."
                className="w-full bg-surface border border-border-color rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none resize-none transition-all"
              />
            </div>

            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </form>
        </div>

        <div className="p-4 border-t border-border-color flex gap-3">
          <button onClick={() => setOpen(false)} className="flex-1 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">İptal</button>
          <button form="rx-form" type="submit" disabled={saving} className="flex-[2] py-2 gradient-primary rounded-lg text-[#1B242A] text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
