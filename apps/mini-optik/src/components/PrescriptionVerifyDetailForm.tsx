// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Save, X, Loader2, Edit3, ShieldCheck } from "lucide-react";

interface PrescriptionVerifyDetailFormProps {
  prescription: any; // Using any for brevity, better to use exact type
}

export default function PrescriptionVerifyDetailForm({ prescription }: PrescriptionVerifyDetailFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [form, setForm] = useState({
    type: prescription.type || "Uzak",
    lensType: prescription.lensType || "",
    coating: prescription.coating || "",
    farRightSph: prescription.farRightSph || "",
    farRightCyl: prescription.farRightCyl || "",
    farRightAx: prescription.farRightAx || "",
    farLeftSph: prescription.farLeftSph || "",
    farLeftCyl: prescription.farLeftCyl || "",
    farLeftAx: prescription.farLeftAx || "",
    pdRight: prescription.pdRight || "",
    pdLeft: prescription.pdLeft || "",
    pdTotal: prescription.pdTotal || "",
    phRight: prescription.phRight || "",
    phLeft: prescription.phLeft || "",
    doctorName: prescription.doctorName || "",
    hospitalName: prescription.hospitalName || "",
    notes: prescription.notes || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/prescriptions/${prescription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isPending: false }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Göz bilgisi onaylanırken bir hata oluştu.");
      }

      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const f = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface border border-border-color rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="p-4 border-b border-border-color flex items-center justify-between">
          <h2 className="text-foreground font-bold flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" /> Doğrulama İnceleme ve Düzenleme
          </h2>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          <form id="verify-edit-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Müşteri Ölçüm Onayı</p>
                <p className="opacity-90">Müşterinin girdiği göz bilgilerini aşağıdan düzenleyebilir, kendi notlarınızı ekleyebilir ve ardından onaylayabilirsiniz.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">Kullanım Amacı</label>
                <select value={form.type} onChange={f("type")} className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                  <option>Uzak</option>
                  <option>Yakın</option>
                  <option>Uzak - Yakın</option>
                  <option>Progresif</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">Cam Tipi</label>
                <input 
                  type="text" 
                  list="lens-types-verify" 
                  value={form.lensType} 
                  onChange={f("lensType")} 
                  className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="Tek Odaklı, Progresif..."
                />
                <datalist id="lens-types-verify">
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
              <div>
                <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">Kaplama / Filtre</label>
                <input 
                  type="text" 
                  list="coating-types-verify" 
                  value={form.coating} 
                  onChange={f("coating")} 
                  className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="Antirefle, Mavi Işık..."
                />
                <datalist id="coating-types-verify">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SAĞ GÖZ */}
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                <p className="text-primary text-sm font-black text-center border-b border-primary/20 pb-2">SAĞ GÖZ (R)</p>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">SPH</label>
                  <input type="text" value={form.farRightSph} onChange={f("farRightSph")} className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">CYL</label>
                  <input type="text" value={form.farRightCyl} onChange={f("farRightCyl")} className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">AX</label>
                  <input type="text" value={form.farRightAx} onChange={f("farRightAx")} className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-medium" />
                </div>
              </div>

              {/* SOL GÖZ */}
              <div className="p-4 rounded-xl border border-secondary/20 bg-secondary/5 space-y-3">
                <p className="text-amber-600 dark:text-secondary text-sm font-black text-center border-b border-secondary/20 pb-2">SOL GÖZ (L)</p>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">SPH</label>
                  <input type="text" value={form.farLeftSph} onChange={f("farLeftSph")} className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">CYL</label>
                  <input type="text" value={form.farLeftCyl} onChange={f("farLeftCyl")} className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">AX</label>
                  <input type="text" value={form.farLeftAx} onChange={f("farLeftAx")} className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-medium" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="w-full">
                <div className="bg-[var(--rx-pdph-bg,var(--surface))] border border-[var(--rx-pdph-border,var(--border-color))] rounded-xl p-4 mb-4">
                  <span className="text-[10px] uppercase font-bold text-[var(--rx-pdph-text,var(--primary))] mb-3 block">PD / PH Ölçüleri</span>
                  <div className="flex flex-col gap-4">
                    {/* PD KISMI */}
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground/80 mb-2 block tracking-wider">PUPİL MESAFESİ (PD)</span>
                      <div className="flex flex-row gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">SAĞ</label>
                          <input type="text" value={form.pdRight || ""} onChange={f("pdRight")} className="w-full bg-background border border-border-color rounded-lg px-2 py-2 text-sm text-foreground focus:border-primary focus:outline-none text-center" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">SOL</label>
                          <input type="text" value={form.pdLeft || ""} onChange={f("pdLeft")} className="w-full bg-background border border-border-color rounded-lg px-2 py-2 text-sm text-foreground focus:border-primary focus:outline-none text-center" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">TOPLAM</label>
                          <input type="text" value={form.pdTotal || ""} onChange={f("pdTotal")} className="w-full bg-background border border-border-color rounded-lg px-2 py-2 text-sm text-foreground focus:border-primary focus:outline-none text-center" />
                        </div>
                      </div>
                    </div>
                    {/* PH KISMI */}
                    <div className="pt-2 border-t border-border-color/30">
                      <span className="text-[10px] font-bold text-muted-foreground/80 mb-2 block tracking-wider">PUPİLYA YÜKSEKLİĞİ (PH)</span>
                      <div className="flex flex-row gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">SAĞ</label>
                          <input type="text" value={form.phRight || ""} onChange={f("phRight")} className="w-full bg-background border border-border-color rounded-lg px-2 py-2 text-sm text-foreground focus:border-primary focus:outline-none text-center" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">SOL</label>
                          <input type="text" value={form.phLeft || ""} onChange={f("phLeft")} className="w-full bg-background border border-border-color rounded-lg px-2 py-2 text-sm text-foreground focus:border-primary focus:outline-none text-center" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">Muayene Eden Doktor / Hastane</label>
                <div className="flex gap-2">
                  <input type="text" value={form.doctorName} onChange={f("doctorName")} placeholder="Dr. Adı" className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                  <input type="text" value={form.hospitalName} onChange={f("hospitalName")} placeholder="Hastane" className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">Notlar (Müşteri & Admin)</label>
              <textarea
                rows={4}
                value={form.notes}
                onChange={f("notes")}
                placeholder="Notlar buraya yazılır..."
                className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
              />
            </div>

            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </form>
        </div>

        <div className="p-4 border-t border-border-color flex gap-3 bg-background">
          <button onClick={() => setOpen(false)} className="flex-1 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer">İptal</button>
          <button form="verify-edit-form" type="submit" disabled={saving} className="flex-[2] py-2.5 bg-amber-500 hover:bg-amber-600 transition-colors rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/20">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Doğrula ve Kaydet
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg text-sm font-semibold transition-colors border border-amber-500/20"
      >
        <Edit3 className="w-4 h-4" /> İncele ve Düzenle
      </button>

      {open && mounted && createPortal(modalContent, document.body)}
    </>
  );
}
