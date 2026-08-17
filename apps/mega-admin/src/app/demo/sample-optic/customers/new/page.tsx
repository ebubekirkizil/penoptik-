// @ts-nocheck
"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, Save } from "lucide-react";
import toast from "react-hot-toast";
import CameraCapture from "@/components/CameraCapture";

type ParsedData = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  tcNo?: string;
  avatarUrl?: string;
  address?: string;
  diseases?: string;
  notes?: string;
  prescriptionNotes?: string;
  email?: string;
  lensType?: string;
  coating?: string;
  farRightSph?: string; farRightCyl?: string; farRightAx?: string;
  farLeftSph?: string; farLeftCyl?: string; farLeftAx?: string;
  nearRightSph?: string; nearRightCyl?: string; nearRightAx?: string;
  nearLeftSph?: string; nearLeftCyl?: string; nearLeftAx?: string;
  constantRightSph?: string; constantRightCyl?: string; constantRightAx?: string;
  constantLeftSph?: string; constantLeftCyl?: string; constantLeftAx?: string;
  addRight?: string; addLeft?: string;
  pdRight?: string; pdLeft?: string; pdTotal?: string;
  phRight?: string; phLeft?: string;
  doctorName?: string;
  hospitalName?: string;
};

export default function NewCustomerWithScannerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsing, setParsing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);

  const [form, setForm] = useState<ParsedData>({
    firstName: "",
    lastName: "",
    phone: "",
    tcNo: "",
    avatarUrl: "",
    email: "",
    address: "",
    diseases: "",
    notes: "",
    prescriptionNotes: "",
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
    doctorName: "",
    hospitalName: "",
  });

  const handleFileChange = useCallback((file: File) => {
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const handleCaptureFromCamera = useCallback((file: File) => {
    handleFileChange(file);
    setShowCamera(false);
    // Otomatik olarak yapay zekayı tetikle
    setTimeout(() => {
      const btn = document.getElementById("hidden-parse-btn");
      if (btn) btn.click();
    }, 300);
  }, [handleFileChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  }, [handleFileChange]);

  const handleParse = async () => {
    if (!selectedFile) return;
    setParsing(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      const res = await fetch("/api/parse-prescription", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Okuma baxarısız");

      setForm(prev => ({ ...prev, ...data }));
    } catch (err: any) {
      setError(err.message ?? "Bir hata oluxtu.");
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!form.firstName || !form.lastName || !form.phone) {
      toast.error("Müxteri adı, soyadı ve telefon zorunludur.");
      return;
    }

    const cleaned = form.phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      toast.error("Geçerli bir telefon numarası girin.");
      return;
    }

    const toastId = toast.loading("Müxteri kaydediliyor...");
    setLoading(true);
    try {
      // 1. Create Customer
      const cusRes = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: cleaned,
          tcNo: form.tcNo,
          avatarUrl: form.avatarUrl,
          email: form.email,
          address: form.address,
          diseases: form.diseases,
          notes: form.notes,
        }),
      });
      const cusData = await cusRes.json();
      if (!cusRes.ok) throw new Error(cusData.error || "Müxteri kaydı baxarısız");

      // 2. If Eye Info is provided, Create Prescription (Göz Bilgileri)
      const hasEyeInfo = 
        form.farRightSph || form.farRightCyl || form.farRightAx ||
        form.farLeftSph || form.farLeftCyl || form.farLeftAx ||
        form.nearRightSph || form.nearRightCyl || form.nearRightAx ||
        form.nearLeftSph || form.nearLeftCyl || form.nearLeftAx ||
        form.constantRightSph || form.constantRightCyl || form.constantRightAx ||
        form.constantLeftSph || form.constantLeftCyl || form.constantLeftAx ||
        form.addRight || form.addLeft ||
        form.pdRight || form.pdLeft || form.pdTotal ||
        form.phRight || form.phLeft ||
        form.doctorName || form.hospitalName || form.prescriptionNotes;

      if (hasEyeInfo) {
        const eyeRes = await fetch("/api/prescriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: cusData.id,
            ...form,
            notes: form.prescriptionNotes,
            isPending: false
          }),
        });
        if (!eyeRes.ok) {
          const eyeData = await eyeRes.json();
          throw new Error("Müxteri kaydedildi fakat göz bilgileri kaydedilemedi: " + (eyeData.error || "Bilinmeyen hata"));
        }
      }

      toast.success("Müxteri baxarıyla kaydedildi!", { id: toastId });
      
      // Navigate to the newly created customer page
      if (cusData.generatedPassword) {
        router.push(`/demo/sample-optic/customers/${cusData.id}?newPw=${cusData.generatedPassword}`);
      } else {
        router.push(`/demo/sample-optic/customers/${cusData.id}`);
      }
    } catch (err: any) {
      setError(err.message ?? "Bir hata oluxtu.");
      toast.error(err.message ?? "Bir hata oluxtu.", { id: toastId });
      setLoading(false); // Only reset loading on error so the button stays disabled during redirect
    }
  };

  const f = (field: keyof ParsedData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/demo/sample-optic/customers" className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Müxteriler
        </Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center glow-primary">
            <UserPlus className="w-6 h-6 text-[#1B242A]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Yeni Müxteri & Göz Bilgileri</h1>
          </div>
        </div>
      </div>

      {/* AI Upload Zone (Askıya Alındı) */}

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Details */}
          <div className="bg-white dark:bg-surface shadow-lg shadow-slate-200/50 dark:shadow-none rounded-3xl p-6 md:p-8 space-y-6 border border-slate-100 dark:border-border-color/50 dark:border-none">
            <h3 className="text-foreground font-semibold text-lg  pb-3 mb-4">Müxteri Bilgileri</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ad *" value={form.firstName || ""} onChange={f("firstName")} required />
              <Field label="Soyad *" value={form.lastName || ""} onChange={f("lastName")} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Telefon *" type="tel" value={form.phone || ""} onChange={f("phone")} required />
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">TC Kimlik No</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.tcNo || ""}
                    onChange={f("tcNo")}
                    className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color rounded-xl px-4 py-3 text-foreground focus:bg-white dark:focus:bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm shadow-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <Field label="E-posta" type="email" value={form.email || ""} onChange={f("email")} />
            </div>
            
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Hastalık / Rahatsızlık</label>
              <input type="text" list="disease-list" value={form.diseases || ""} onChange={f("diseases")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color rounded-xl px-4 py-3 text-foreground focus:bg-white dark:focus:bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" placeholder="Örn: Miyop, Astigmat..." />
              <datalist id="disease-list">
                <option value="Miyop" />
                <option value="Hipermetrop" />
                <option value="Astigmat" />
                <option value="Presbiyopi (Yakın Görme Bozukluğu)" />
                <option value="Katarakt" />
                <option value="Glokom (Göz Tansiyonu)" />
                <option value="Şaxılık" />
                <option value="Göz Kuruluğu" />
                <option value="Sarı Nokta Hastalığı" />
                <option value="Keratokonus" />
              </datalist>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Özel Notlar</label>
              <textarea rows={2} value={form.notes || ""} onChange={f("notes")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color rounded-xl px-4 py-3 text-foreground focus:bg-white dark:focus:bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none text-sm" />
            </div>
            <Field label="Adres" value={form.address || ""} onChange={f("address")} />
          </div>

          {/* Eye Measurements (Göz Bilgileri) */}
          <div className="bg-white dark:bg-surface shadow-lg shadow-slate-200/50 dark:shadow-none rounded-3xl p-6 md:p-8 space-y-6 border border-slate-100 dark:border-border-color/50 dark:border-none">
            <div className="flex items-center justify-between pb-3 mb-4">
              <h3 className="text-foreground font-semibold text-lg">Göz Bilgileri (İsteğe Bağlı)</h3>
              <button 
                type="button" 
                onClick={() => setShowPrescription(!showPrescription)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {showPrescription ? "Gizle" : "Reçete Ekle"}
              </button>
            </div>
            
            {showPrescription && (
              <div className="animate-fade-in-up">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="relative col-span-2">
                <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">Cam Tipi</label>
                <input 
                  type="text" 
                  list="lens-types" 
                  value={form.lensType || ""} 
                  onChange={f("lensType")} 
                  placeholder="Örn: Tek Odaklı, Progresif..."
                  className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:bg-white dark:focus:bg-surface focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all shadow-sm"
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
                  <option value="Yüksek İndeksli (İnceltilmix)" />
                  <option value="Renkli Cam / Günex Gözlüğü" />
                </datalist>
              </div>
              <div className="relative col-span-2">
                <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">Kaplama / Filtre</label>
                <input 
                  type="text" 
                  list="coating-types" 
                  value={form.coating || ""} 
                  onChange={f("coating")} 
                  placeholder="Örn: Antirefle, Mavi Ixık..."
                  className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:bg-white dark:focus:bg-surface focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all shadow-sm"
                />
                <datalist id="coating-types">
                  <option value="Antirefle (Yansıma Önleyici)" />
                  <option value="Mavi Ixık Filtreli (Blue Control)" />
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
              <div className="bg-white dark:bg-surface shadow-sm rounded-2xl p-4  hover:shadow-md hover:border-orange-500/40 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center shadow-sm">
                    <span className="text-orange-500 font-bold text-[10px]">UZAK</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground">Uzak Görüx Ölçüleri</h4>
                </div>
                
                <div className="flex flex-col gap-3">
                  {/* SAĞ GÖZ */}
                  <div className="bg-background/80 dark:bg-background/50 rounded-xl p-3.5 /50 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-primary mb-2 block tracking-wider flex items-center gap-1">Sağ Göz (R)</span>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">SPH</label>
                        <input type="text" value={form.farRightSph} onChange={f("farRightSph")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="+0.00" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">CYL</label>
                        <input type="text" value={form.farRightCyl} onChange={f("farRightCyl")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="-0.00" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">AX</label>
                        <input type="text" value={form.farRightAx} onChange={f("farRightAx")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="180" />
                      </div>
                    </div>
                  </div>
                  
                  {/* SOL GÖZ */}
                  <div className="bg-background/80 dark:bg-background/50 rounded-xl p-3.5 /50 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-secondary mb-2 block tracking-wider flex items-center gap-1">Sol Göz (L)</span>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">SPH</label>
                        <input type="text" value={form.farLeftSph} onChange={f("farLeftSph")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="+0.00" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">CYL</label>
                        <input type="text" value={form.farLeftCyl} onChange={f("farLeftCyl")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="-0.00" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5 text-center">AX</label>
                        <input type="text" value={form.farLeftAx} onChange={f("farLeftAx")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="180" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* YAKIN ÖLÇÜLERİ */}
              <div className="bg-white dark:bg-surface shadow-sm rounded-2xl p-4  hover:shadow-md hover:border-emerald-500/40 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shadow-sm">
                    <span className="text-emerald-500 font-bold text-[10px]">YAKIN</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground">Yakın Görüx Ölçüleri</h4>
                </div>
                
                <div className="flex flex-col gap-3">
                  {/* SAĞ GÖZ */}
                  <div className="bg-background/80 dark:bg-background/50 rounded-xl p-3.5 /50 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-primary mb-2 block tracking-wider flex items-center gap-1">Sağ Göz (R)</span>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <input type="text" value={form.nearRightSph} onChange={f("nearRightSph")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="SPH" />
                      </div>
                      <div>
                        <input type="text" value={form.nearRightCyl} onChange={f("nearRightCyl")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="CYL" />
                      </div>
                      <div>
                        <input type="text" value={form.nearRightAx} onChange={f("nearRightAx")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="AX" />
                      </div>
                    </div>
                  </div>
                  
                  {/* SOL GÖZ */}
                  <div className="bg-background/80 dark:bg-background/50 rounded-xl p-3.5 /50 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-secondary mb-2 block tracking-wider flex items-center gap-1">Sol Göz (L)</span>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <input type="text" value={form.nearLeftSph} onChange={f("nearLeftSph")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="SPH" />
                      </div>
                      <div>
                        <input type="text" value={form.nearLeftCyl} onChange={f("nearLeftCyl")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="CYL" />
                      </div>
                      <div>
                        <input type="text" value={form.nearLeftAx} onChange={f("nearLeftAx")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="AX" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DAİMİ ÖLÇÜLERİ */}
              <div className="bg-white dark:bg-surface shadow-sm rounded-2xl p-4  hover:shadow-md hover:border-blue-500/40 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shadow-sm">
                    <span className="text-blue-500 font-bold text-[10px]">DAİMİ</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground">Daimi Görüx Ölçüleri</h4>
                </div>
                
                <div className="flex flex-col gap-3">
                  {/* SAĞ GÖZ */}
                  <div className="bg-background/80 dark:bg-background/50 rounded-xl p-3.5 /50 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-primary mb-2 block tracking-wider flex items-center gap-1">Sağ Göz (R)</span>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <input type="text" value={form.constantRightSph} onChange={f("constantRightSph")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="SPH" />
                      </div>
                      <div>
                        <input type="text" value={form.constantRightCyl} onChange={f("constantRightCyl")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="CYL" />
                      </div>
                      <div>
                        <input type="text" value={form.constantRightAx} onChange={f("constantRightAx")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="AX" />
                      </div>
                    </div>
                  </div>
                  
                  {/* SOL GÖZ */}
                  <div className="bg-background/80 dark:bg-background/50 rounded-xl p-3.5 /50 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-secondary mb-2 block tracking-wider flex items-center gap-1">Sol Göz (L)</span>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <input type="text" value={form.constantLeftSph} onChange={f("constantLeftSph")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="SPH" />
                      </div>
                      <div>
                        <input type="text" value={form.constantLeftCyl} onChange={f("constantLeftCyl")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="CYL" />
                      </div>
                      <div>
                        <input type="text" value={form.constantLeftAx} onChange={f("constantLeftAx")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground focus:bg-white dark:focus:bg-surface focus:border-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none text-center transition-all shadow-inner" placeholder="AX" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PD & PH ÖLÇÜLERİ (YENİ) */}
              <div className="bg-white dark:bg-surface shadow-sm rounded-2xl p-4 hover:shadow-md hover:border-purple-500/40 transition-all duration-300 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center shadow-sm">
                    <span className="text-purple-500 font-bold text-[10px]">PD/PH</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground">PD & PH Ölçüleri</h4>
                </div>
                
                <div className="flex flex-col gap-4">
                  {/* PD KISMI */}
                  <div className="bg-[var(--rx-pdph-bg,var(--background))] rounded-xl p-3.5 shadow-sm border border-[var(--rx-pdph-border,var(--border-color))]">
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
                  <div className="bg-[var(--rx-pdph-bg,var(--background))] rounded-xl p-3.5 shadow-sm border border-[var(--rx-pdph-border,var(--border-color))]">
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
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 shadow-[0_0_15px_rgba(126,172,181,0.05)] rounded-2xl p-4 relative overflow-hidden group">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Adisyon (ADD) & Ekstra
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5">Sağ ADD</label>
                    <input type="text" value={form.addRight || ""} onChange={f("addRight")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-3 py-2 text-xs text-foreground focus:bg-white dark:focus:bg-surface focus:border-primary outline-none transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-muted-foreground mb-1.5">Sol ADD</label>
                    <input type="text" value={form.addLeft || ""} onChange={f("addLeft")} className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-3 py-2 text-xs text-foreground focus:bg-white dark:focus:bg-surface focus:border-primary outline-none transition-all shadow-sm" />
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 shadow-[0_0_15px_rgba(126,172,181,0.05)] rounded-2xl p-4 relative overflow-hidden group">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Muayene Eden Kurum
                </p>
                <div className="space-y-3">
                  <div>
                    <input type="text" value={form.doctorName || ""} onChange={f("doctorName")} placeholder="Doktor Adı" className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-3 py-2 text-xs text-foreground focus:bg-white dark:focus:bg-surface focus:border-primary outline-none transition-all shadow-sm" />
                  </div>
                  <div>
                    <input type="text" value={form.hospitalName || ""} onChange={f("hospitalName")} placeholder="Hastane Adı" className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color/50 rounded-lg px-3 py-2 text-xs text-foreground focus:bg-white dark:focus:bg-surface focus:border-primary outline-none transition-all shadow-sm" list="hospital-list" />
                  <datalist id="hospital-list">
                    <option value="Devlet Hastanesi" />
                    <option value="Şehir Hastanesi" />
                    <option value="Eğitim ve Araxtırma Hastanesi" />
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
            
            {/* Reçete Notu */}
            <div className="mt-4 pt-2">
              <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-2">Reçeteye Özel Notlar</label>
              <textarea 
                rows={2} 
                value={form.prescriptionNotes || ""} 
                onChange={f("prescriptionNotes")} 
                placeholder="Örn: Müxteri organik cam tercih ediyor..." 
                className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color rounded-xl px-4 py-3 text-foreground focus:bg-white dark:focus:bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none text-sm" 
              />
            </div>
            </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/demo/sample-optic/customers" className="flex-1 glass  text-muted-foreground py-4 rounded-xl font-bold text-center hover:text-foreground transition-all">
            İptal
          </Link>
          <button type="submit" disabled={loading} className="flex-[2] gradient-primary text-[#1B242A] py-4 rounded-xl font-bold hover:opacity-90 hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 transition-all glow-primary flex items-center justify-center gap-2 text-lg">
            {loading ? "Kaydediliyor..." : <><Save className="w-5 h-5" /> Müxteriyi Kaydet</>}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1.5 font-medium">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full bg-slate-50 dark:bg-surface-light border border-slate-200 dark:border-border-color rounded-xl px-4 py-3 text-foreground focus:bg-white dark:focus:bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm shadow-sm"
      />
    </div>
  );
}
