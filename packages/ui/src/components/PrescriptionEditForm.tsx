// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, Save, Loader2, Edit3 } from "lucide-react";
import toast from "react-hot-toast";

export default function PrescriptionEditForm({ rx }: { rx: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [form, setForm] = useState({
    lensType: rx.lensType || "",
    coating: rx.coating || "",
    farRightSph: rx.farRightSph || "", farRightCyl: rx.farRightCyl || "", farRightAx: rx.farRightAx || "",
    farLeftSph: rx.farLeftSph || "", farLeftCyl: rx.farLeftCyl || "", farLeftAx: rx.farLeftAx || "",
    nearRightSph: rx.nearRightSph || "", nearRightCyl: rx.nearRightCyl || "", nearRightAx: rx.nearRightAx || "",
    nearLeftSph: rx.nearLeftSph || "", nearLeftCyl: rx.nearLeftCyl || "", nearLeftAx: rx.nearLeftAx || "",
    constantRightSph: rx.constantRightSph || "", constantRightCyl: rx.constantRightCyl || "", constantRightAx: rx.constantRightAx || "",
    constantLeftSph: rx.constantLeftSph || "", constantLeftCyl: rx.constantLeftCyl || "", constantLeftAx: rx.constantLeftAx || "",
    addRight: rx.addRight || "", addLeft: rx.addLeft || "",
    pdRight: rx.pdRight || "", pdLeft: rx.pdLeft || "", pdTotal: rx.pdTotal || "",
    phRight: rx.phRight || "", phLeft: rx.phLeft || "",
    doctorName: rx.doctorName || "", hospitalName: rx.hospitalName || "", notes: rx.notes || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Göz bilgisi güncelleniyor...");
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/prescriptions/${rx.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Güncelleme başarısız");
      }
      toast.success("Göz bilgisi başarıyla güncellendi!", { id: toastId });
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      toast.error("Hata: " + err.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Trigger button — inline, not absolute
  const triggerBtn = (
    <button
      onClick={() => setOpen(true)}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary border border-[var(--border-color)] hover:border-primary/40 bg-background hover:bg-primary/5 px-2.5 py-1.5 rounded-lg transition-all"
      title="Göz Bilgisini Düzenle"
    >
      <Edit3 className="w-3.5 h-3.5" />
      Düzenle
    </button>
  );

  if (!mounted) return triggerBtn;
  if (!open) return triggerBtn;

  const f = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  // 3-col SPH/CYL/AX grid for one eye
  const EyeRow = ({
    label, sphF, cylF, axF, sphPlaceholder = "+0.00", axPlaceholder = "180",
    bgVar, borderVar, textVar
  }: any) => (
    <div className="rounded-xl p-3 border" style={{ backgroundColor: bgVar, borderColor: borderVar }}>
      <span className="text-[10px] uppercase font-bold mb-2 block tracking-widest" style={{ color: textVar }}>{label}</span>
      <div className="grid grid-cols-3 gap-2">
        {[{ lbl: "SPH", f: sphF, ph: sphPlaceholder }, { lbl: "CYL", f: cylF, ph: "-0.00" }, { lbl: "AX", f: axF, ph: axPlaceholder }].map(c => (
          <div key={c.lbl}>
            <label className="block text-[10px] font-semibold mb-1 text-center" style={{ color: textVar, opacity: 0.8 }}>{c.lbl}</label>
            <input type="text" value={form[c.f] || ""} onChange={f(c.f)}
              className="w-full rounded-lg px-1 py-2 text-sm font-bold text-center transition-all focus:outline-none focus:ring-1 focus:ring-primary/30"
              style={{ backgroundColor: 'var(--rx-value-bg)', color: 'var(--rx-value-text)', borderColor: borderVar, borderWidth: 1 }}
              placeholder={c.ph} />
          </div>
        ))}
      </div>
    </div>
  );

  const SectionBlock = ({ label, badge, bgVar, borderVar, textVar, children }: any) => (
    <div className="rounded-xl border p-3" style={{ backgroundColor: bgVar, borderColor: borderVar }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md" style={{ backgroundColor: textVar, color: bgVar }}>{badge}</span>
        <span className="text-xs font-semibold" style={{ color: textVar }}>{label}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: "rgba(0,0,0,0.65)" }}>
      {/* Backdrop click closes */}
      <div className="absolute inset-0" onClick={() => setOpen(false)} />

      <div
        className="relative bg-surface dark:bg-surface border border-[var(--border-color)] rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: "92dvh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Göz Bilgisini Düzenle</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">{rx.lensType || "Reçete"} · {new Date(rx.createdAt).toLocaleDateString("tr-TR")}</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-xl hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <form id="rx-edit-form" onSubmit={handleSubmit} className="space-y-4">

            {/* Cam Tipi & Kaplama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1.5">Cam Tipi</label>
                <input
                  type="text" list="rx-lens-types"
                  value={form.lensType || ""} onChange={f("lensType")}
                  placeholder="Örn: Tek Odaklı, Progresif..."
                  className="w-full bg-background border border-[var(--border-color)] rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all"
                />
                <datalist id="rx-lens-types">
                  <option value="Tek Odaklı (Single Vision)" />
                  <option value="Bifokal (Çift Odaklı)" />
                  <option value="Progresif (Çok Odaklı)" />
                  <option value="Asferik (İnce Tasarım)" />
                  <option value="Polikarbonat (Kırılmaz)" />
                  <option value="Yüksek İndeksli (İnceltilmiş)" />
                </datalist>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1.5">Kaplama / Filtre</label>
                <input
                  type="text" list="rx-coating-types"
                  value={form.coating || ""} onChange={f("coating")}
                  placeholder="Örn: Antirefle, Mavi Işık..."
                  className="w-full bg-background border border-[var(--border-color)] rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all"
                />
                <datalist id="rx-coating-types">
                  <option value="Antirefle (Yansıma Önleyici)" />
                  <option value="Mavi Işık Filtreli (Blue Control)" />
                  <option value="Fotokromik (Kolormatik)" />
                  <option value="Polarize" />
                  <option value="Sert Kaplama (Çizilmez)" />
                </datalist>
              </div>
            </div>

            {/* UZAK */}
            <SectionBlock label="Uzak Görüş Ölçüleri" badge="UZAK" bgVar="var(--rx-uzak-bg)" borderVar="var(--rx-uzak-border)" textVar="var(--rx-uzak-text)">
              <EyeRow label="Sağ Göz (R)" sphF="farRightSph" cylF="farRightCyl" axF="farRightAx" bgVar="var(--surface)" borderVar="var(--rx-uzak-border)" textVar="var(--rx-uzak-text)" />
              <EyeRow label="Sol Göz (L)" sphF="farLeftSph" cylF="farLeftCyl" axF="farLeftAx" bgVar="var(--surface)" borderVar="var(--rx-uzak-border)" textVar="var(--rx-uzak-text)" />
            </SectionBlock>

            {/* YAKIN */}
            <SectionBlock label="Yakın Görüş Ölçüleri" badge="YAKIN" bgVar="var(--rx-yakin-bg)" borderVar="var(--rx-yakin-border)" textVar="var(--rx-yakin-text)">
              <EyeRow label="Sağ Göz (R)" sphF="nearRightSph" cylF="nearRightCyl" axF="nearRightAx" sphPlaceholder="SPH" axPlaceholder="AX" bgVar="var(--surface)" borderVar="var(--rx-yakin-border)" textVar="var(--rx-yakin-text)" />
              <EyeRow label="Sol Göz (L)" sphF="nearLeftSph" cylF="nearLeftCyl" axF="nearLeftAx" sphPlaceholder="SPH" axPlaceholder="AX" bgVar="var(--surface)" borderVar="var(--rx-yakin-border)" textVar="var(--rx-yakin-text)" />
            </SectionBlock>

            {/* DAİMİ */}
            <SectionBlock label="Daimi Görüş Ölçüleri" badge="DAİMİ" bgVar="var(--rx-daimi-bg)" borderVar="var(--rx-daimi-border)" textVar="var(--rx-daimi-text)">
              <EyeRow label="Sağ Göz (R)" sphF="constantRightSph" cylF="constantRightCyl" axF="constantRightAx" sphPlaceholder="SPH" axPlaceholder="AX" bgVar="var(--surface)" borderVar="var(--rx-daimi-border)" textVar="var(--rx-daimi-text)" />
              <EyeRow label="Sol Göz (L)" sphF="constantLeftSph" cylF="constantLeftCyl" axF="constantLeftAx" sphPlaceholder="SPH" axPlaceholder="AX" bgVar="var(--surface)" borderVar="var(--rx-daimi-border)" textVar="var(--rx-daimi-text)" />
            </SectionBlock>

            {/* PD & PH */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border p-3" style={{ backgroundColor: 'var(--rx-pdph-bg)', borderColor: 'var(--rx-pdph-border)' }}>
                <span className="text-[10px] uppercase font-black tracking-widest mb-3 block" style={{ color: 'var(--rx-pdph-text)' }}>Pupil Mesafesi (PD)</span>
                <div className="grid grid-cols-3 gap-2">
                  {[["SAĞ", "pdRight", "Örn: 31"], ["SOL", "pdLeft", "Örn: 31"], ["TOPLAM", "pdTotal", "Örn: 62"]].map(([lbl, fld, ph]) => (
                    <div key={fld}>
                      <label className="block text-[10px] font-semibold mb-1 text-center" style={{ color: 'var(--rx-pdph-text)', opacity: 0.8 }}>{lbl}</label>
                      <input type="text" value={form[fld] || ""} onChange={f(fld)}
                        className="w-full rounded-lg px-1 py-2 text-sm font-bold text-center transition-all focus:outline-none focus:ring-1 focus:ring-primary/30"
                        style={{ backgroundColor: 'var(--rx-value-bg)', color: 'var(--rx-value-text)', borderColor: 'var(--rx-pdph-border)', borderWidth: 1 }}
                        placeholder={ph} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border p-3" style={{ backgroundColor: 'var(--rx-pdph-bg)', borderColor: 'var(--rx-pdph-border)' }}>
                <span className="text-[10px] uppercase font-black tracking-widest mb-3 block" style={{ color: 'var(--rx-pdph-text)' }}>Pupilya Yüksekliği (PH)</span>
                <div className="grid grid-cols-2 gap-2">
                  {[["SAĞ", "phRight", "Örn: 22"], ["SOL", "phLeft", "Örn: 22"]].map(([lbl, fld, ph]) => (
                    <div key={fld}>
                      <label className="block text-[10px] font-semibold mb-1 text-center" style={{ color: 'var(--rx-pdph-text)', opacity: 0.8 }}>{lbl}</label>
                      <input type="text" value={form[fld] || ""} onChange={f(fld)}
                        className="w-full rounded-lg px-1 py-2 text-sm font-bold text-center transition-all focus:outline-none focus:ring-1 focus:ring-primary/30"
                        style={{ backgroundColor: 'var(--rx-value-bg)', color: 'var(--rx-value-text)', borderColor: 'var(--rx-pdph-border)', borderWidth: 1 }}
                        placeholder={ph} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ADD & Kurum */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--border-color)] p-3">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground mb-2 block">Adisyon (ADD)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">Sağ ADD</label>
                    <input type="text" value={form.addRight || ""} onChange={f("addRight")} className="w-full bg-background border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">Sol ADD</label>
                    <input type="text" value={form.addLeft || ""} onChange={f("addLeft")} className="w-full bg-background border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-all" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-[var(--border-color)] p-3">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground mb-2 block">Muayene Eden Kurum</span>
                <div className="space-y-2">
                  <input type="text" value={form.doctorName || ""} onChange={f("doctorName")} placeholder="Doktor Adı" className="w-full bg-background border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-all" />
                  <input type="text" value={form.hospitalName || ""} onChange={f("hospitalName")} placeholder="Hastane / Klinik" list="rx-hospital-list" className="w-full bg-background border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-all" />
                  <datalist id="rx-hospital-list">
                    <option value="Devlet Hastanesi" />
                    <option value="Şehir Hastanesi" />
                    <option value="Özel Göz Hastanesi" />
                    <option value="Dünyagöz Hastanesi" />
                  </datalist>
                </div>
              </div>
            </div>

            {/* Notlar */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1.5">Açıklama / Notlar</label>
              <textarea
                rows={2}
                value={form.notes || ""}
                onChange={f("notes")}
                placeholder="Ek notlar..."
                className="w-full bg-background border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none resize-none transition-all"
              />
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl">{error}</p>}
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--border-color)] flex gap-3 shrink-0">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground bg-background border border-[var(--border-color)] rounded-xl transition-all"
          >
            İptal
          </button>
          <button
            form="rx-edit-form"
            type="submit"
            disabled={saving}
            className="flex-[2] py-2.5 bg-primary text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor...</> : <><Save className="w-4 h-4" /> Güncelle</>}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
