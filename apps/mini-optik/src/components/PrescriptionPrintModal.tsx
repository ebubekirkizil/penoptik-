"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Printer, Settings2 } from "lucide-react";

// Helper: dotted editable field
const DottedField = ({ label, value, onChange, width = "120px", isA4 = false }: { label: string; value: string; onChange?: (val: string) => void; width?: string; isA4?: boolean }) => (
  <div className={`flex items-end ${isA4 ? "mb-2.5 text-[15px]" : "mb-1.5 text-[13px]"} leading-tight`}>
    <span className="inline-block" style={{ width: isA4 && width === "120px" ? "150px" : width }}>{label}</span>
    <span className="mr-2 font-bold">:</span>
    <input
      type="text"
      className="flex-1 outline-none border-b-[1.5px] border-dotted border-gray-400 bg-transparent text-black font-semibold placeholder-transparent print:border-black"
      value={value || ""}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder=" "
    />
  </div>
);

// Helper: editable table cell
const TableInput = ({ value, onChange, isA4 = false }: { value: string; onChange: (v: string) => void; isA4?: boolean }) => (
  <input
    type="text"
    className={`w-full bg-transparent text-center outline-none border-none text-black font-semibold m-0 ${isA4 ? "p-2.5 text-[14px]" : "p-1.5 text-[12px]"} focus:bg-gray-100 transition-colors`}
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
  />
);

// Helper: Axis semicircle dial
const AxisDial = ({ label, axisValue, isA4 = false }: { label: string; axisValue?: string; isA4?: boolean }) => {
  const ax = parseInt(axisValue || "0", 10);
  const showLine = !isNaN(ax) && ax > 0 && ax <= 180;
  const w = isA4 ? 150 : 120;
  const h = isA4 ? 85 : 70;
  return (
    <div className="flex flex-col items-center">
      <svg width={w} height={h} viewBox="-65 -65 130 75" className="overflow-visible">
        <path d="M -60 0 A 60 60 0 0 1 60 0" fill="none" stroke="black" strokeWidth="1.5" />
        <line x1="-65" y1="0" x2="65" y2="0" stroke="black" strokeWidth="1.5" />
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180].map(deg => {
          const rad = (deg * Math.PI) / 180;
          const isMajor = deg % 30 === 0 || deg === 90;
          const outerR = 60;
          const innerR = isMajor ? 52 : 55;
          const textR = 68;
          const x1 = Math.cos(rad) * outerR;
          const y1 = -Math.sin(rad) * outerR;
          const x2 = Math.cos(rad) * innerR;
          const y2 = -Math.sin(rad) * innerR;
          const tx = Math.cos(rad) * textR;
          const ty = -Math.sin(rad) * textR;
          return (
            <g key={deg}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth={isMajor ? "1.5" : "1"} />
              {(deg % 10 === 0 && deg !== 0 && deg !== 180) && (
                <text x={tx} y={ty} fontSize="5" textAnchor="middle" dominantBaseline="middle" fill="black" transform={`rotate(${90 - deg}, ${tx}, ${ty})`}>
                  {deg}
                </text>
              )}
            </g>
          );
        })}
        <text x="68" y="2" fontSize="5" textAnchor="start" fill="black">0</text>
        <text x="-68" y="2" fontSize="5" textAnchor="end" fill="black">180</text>
        {showLine && (
          <line
            x1="0" y1="0"
            x2={Math.cos((ax * Math.PI) / 180) * 60}
            y2={-Math.sin((ax * Math.PI) / 180) * 60}
            stroke="red" strokeWidth="2" strokeDasharray="4 2"
          />
        )}
      </svg>
      <span className={`mt-1 font-bold ${isA4 ? "text-base" : "text-sm"}`}>{label}</span>
    </div>
  );
};

// Toggle switch component
const Toggle = ({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-start justify-between gap-3 py-3 border-b border-[var(--border-color)] last:border-0">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 mt-0.5 ${checked ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  </div>
);

export default function PrescriptionPrintModal({
  rx,
  customer,
  orderNo,
  logoUrl,
  notes,
}: {
  rx: any;
  customer: any;
  orderNo?: string;
  logoUrl?: string;
  notes?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Print settings
  const [paperSize, setPaperSize] = useState<"A4" | "A5">("A5");
  const [showNotes, setShowNotes] = useState(true);
  const [showFinancial, setShowFinancial] = useState(true);
  const [showDoctorInfo, setShowDoctorInfo] = useState(true);

  // Editable fields
  const [fields, setFields] = useState({
    adi: customer?.firstName || "",
    soyadi: customer?.lastName || "",
    siparisTarihi: new Date().toLocaleDateString("tr-TR"),
    teslimTarihi: "",
    camCinsi: rx?.lensType || "",
    adres: customer?.address || "",
    tel: customer?.phone || "",
    doktorAdi: rx?.doctorName || "",
    hastaneAdi: rx?.hospitalName || "",
    tutari: "",
    kapora: "",
    bakiye: "",
    notlar: notes || "",
    // Table fields
    farRightSph: rx?.farRightSph || "",
    farRightCyl: rx?.farRightCyl || "",
    farRightAx: rx?.farRightAx || "",
    farLeftSph: rx?.farLeftSph || "",
    farLeftCyl: rx?.farLeftCyl || "",
    farLeftAx: rx?.farLeftAx || "",
    farPd: rx?.farPd || rx?.pdTotal || rx?.pdRight || rx?.pdLeft || "",
    nearRightSph: rx?.nearRightSph || "",
    nearRightCyl: rx?.nearRightCyl || "",
    nearRightAx: rx?.nearRightAx || "",
    nearLeftSph: rx?.nearLeftSph || "",
    nearLeftCyl: rx?.nearLeftCyl || "",
    nearLeftAx: rx?.nearLeftAx || "",
    nearPd: "",
    constantRightSph: rx?.constantRightSph || "",
    constantRightCyl: rx?.constantRightCyl || "",
    constantRightAx: rx?.constantRightAx || "",
    constantLeftSph: rx?.constantLeftSph || "",
    constantLeftCyl: rx?.constantLeftCyl || "",
    constantLeftAx: rx?.constantLeftAx || "",
    constantPd: "",
    printNo: "",
  });

  useEffect(() => { setMounted(true); }, []);

  // Fetch sequence when opened
  useEffect(() => {
    if (open) {
      fetch("/api/settings/sequence")
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.sequence === "number") {
            const nextSeq = data.sequence + 1;
            const formatted = "A" + nextSeq.toString().padStart(5, '0');
            updateField("printNo", formatted);
          }
        })
        .catch(err => console.error("Sequence fetch error:", err));
    }
  }, [open]);

  const updateField = (key: keyof typeof fields, value: string) =>
    setFields(prev => ({ ...prev, [key]: value }));

  const handlePrint = async () => {
    // Extract number to update database
    const match = fields.printNo.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (!isNaN(num)) {
        await fetch("/api/settings/sequence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sequence: num }),
        }).catch(err => console.error("Sequence update error:", err));
      }
    }
    window.print();
  };

  const paperDims = paperSize === "A4"
    ? { width: "210mm", minHeight: "297mm", padding: "10mm 15mm 15mm 15mm" }
    : { width: "148mm", minHeight: "210mm", padding: "5mm 10mm 10mm 10mm" };

  const triggerBtn = (
    <button
      onClick={() => setOpen(true)}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary border border-[var(--border-color)] hover:border-primary/40 bg-background hover:bg-primary/5 px-2.5 py-1.5 rounded-lg transition-all"
      title="Yazdır"
    >
      <Printer className="w-3.5 h-3.5" />
      Yazdır
    </button>
  );

  if (!mounted) return triggerBtn;
  if (!open) return triggerBtn;

  const content = (
    <div className="print-modal-root">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Bütün body içeriğini gizle, sadece modal kalsın */
          body > *:not(.print-modal-root) {
            display: none !important;
          }
          
          /* Modal arkaplanı kağıda siyah çıkmasın diye transparan yap */
          .print-modal-root {
            position: static !important;
            background: transparent !important;
          }

          /* Modal içindeki her şeyi (ayarlar menüsü vs) gizle */
          .print-modal-root * {
            visibility: hidden;
          }

          /* Sadece print-section ve içindekileri göster */
          .print-section, .print-section * {
            visibility: visible;
          }
          
          .print-section {
            position: absolute; left: 0; top: 0;
            box-sizing: border-box;
            width: ${paperDims.width}; min-height: ${paperDims.minHeight};
            margin: 0; padding: ${paperDims.padding};
            box-shadow: none !important; border: none !important;
            background: white !important; color: black !important;
          }
          input { border-bottom: 1.5px dotted black !important; color: black !important; }
          @page { size: ${paperSize}; margin: 0; }
        }
      ` }} />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: "rgba(0,0,0,0.65)" }}>
        <div className="absolute inset-0" onClick={() => setOpen(false)} />
        <div className="relative bg-surface border border-[var(--border-color)] rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col md:flex-row overflow-hidden h-[95vh]" onClick={e => e.stopPropagation()}>

          {/* ─── Left: Settings ─── */}
          <div className="w-full md:w-72 bg-background border-r border-[var(--border-color)] flex flex-col shrink-0">
            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
              <h2 className="font-bold text-foreground flex items-center gap-2 text-sm">
                <Settings2 className="w-4 h-4" /> Yazdırma Ayarları
              </h2>
              <button onClick={() => setOpen(false)} className="md:hidden p-1 rounded-md hover:bg-surface">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-5">
              {/* Paper size */}
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Kağıt Boyutu</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["A5", "A4"] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => setPaperSize(size)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        paperSize === size
                          ? "bg-primary text-white border-primary"
                          : "bg-background border-[var(--border-color)] text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {size}
                      <span className="block text-[10px] font-normal opacity-70">
                        {size === "A5" ? "148×210mm" : "210×297mm"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content toggles */}
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">İçerik Seçenekleri</p>
                <div className="bg-surface rounded-xl border border-[var(--border-color)] px-3">
                  <Toggle label="Notları Göster" description="Sipariş notları kağıda yazılsın" checked={showNotes} onChange={setShowNotes} />
                  <Toggle label="Finansal Bilgiler" description="Tutarı, Kapora, Bakiye alanları" checked={showFinancial} onChange={setShowFinancial} />
                  <Toggle label="Doktor & Hastane" description="Doktor ve hastane adı" checked={showDoctorInfo} onChange={setShowDoctorInfo} />
                </div>
              </div>

              {/* Tip */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <strong>İpucu:</strong> Önizleme üzerindeki noktalı alanlara tıklayarak değerleri düzenleyebilirsiniz.
                </p>
              </div>

              {/* Serial no display in settings */}
              {fields.printNo && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
                  <p className="text-xs text-muted-foreground">Seri Numarası</p>
                  <p className="text-base font-black text-primary tracking-widest mt-0.5">{fields.printNo}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[var(--border-color)] bg-surface">
              <button onClick={handlePrint} className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md">
                <Printer className="w-5 h-5" /> Çıktı Al
              </button>
              <button onClick={() => setOpen(false)} className="w-full mt-2 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all">
                İptal
              </button>
            </div>
          </div>

          {/* ─── Right: Preview ─── */}
          <div className="flex-1 bg-gray-200 overflow-y-auto p-4 md:p-8 flex items-start justify-center">
            <div
              className="bg-white shadow-lg border border-gray-300 print-section flex flex-col"
              style={{ width: paperDims.width, minHeight: paperDims.minHeight, padding: paperDims.padding, color: "black", fontFamily: "Arial, sans-serif" }}
            >
              {/* Header */}
              <div className="relative text-center mb-4 pt-2">
                {/* Sağ üst tarih ve Seri Numarası */}
                <div className="absolute top-0 right-0 text-right flex flex-col items-end gap-1">
                  <div className="text-[10px] text-gray-500 font-medium">
                    {new Date().toLocaleDateString("tr-TR")}
                  </div>
                  <div className="flex items-center text-[#b91c1c] font-bold text-sm tracking-widest" style={{ fontFamily: "serif" }}>
                    <span>No:</span>
                    <input 
                      type="text" 
                      className="bg-transparent border-none outline-none text-left w-[70px] text-[#b91c1c] font-bold tracking-widest ml-1" 
                      value={fields.printNo} 
                      onChange={e => updateField("printNo", e.target.value)} 
                    />
                  </div>
                </div>

                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="h-20 max-w-[280px] object-contain mx-auto mb-1" />
                ) : (
                  <div className="inline-block">
                    <h1
                      className="text-[2.5rem] leading-none text-[#b91c1c] font-bold italic border-b-2 border-[#b91c1c] pb-0.5 inline-block"
                      style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
                    >
                      Pen Optik
                    </h1>
                  </div>
                )}
                <p className="text-[11px] font-medium text-gray-800 mt-1">
                  Batı Mh. İsmetpaşa Cd. No: 33/A Pendik Tel.: 0216 390 04 44
                </p>
              </div>

              <div className="border-b-[1.5px] border-dotted border-gray-400 my-2" />

              {/* Customer details */}
              <div className="mb-4">
                <DottedField label="Adı" value={fields.adi} onChange={v => updateField("adi", v)} isA4={paperSize === "A4"} />
                <DottedField label="Soyadı" value={fields.soyadi} onChange={v => updateField("soyadi", v)} isA4={paperSize === "A4"} />
                <DottedField label="Sipariş Tarihi" value={fields.siparisTarihi} onChange={v => updateField("siparisTarihi", v)} isA4={paperSize === "A4"} />
                <DottedField label="Teslim Tarihi" value={fields.teslimTarihi} onChange={v => updateField("teslimTarihi", v)} isA4={paperSize === "A4"} />
                <DottedField label="Cam Cinsi" value={fields.camCinsi} onChange={v => updateField("camCinsi", v)} isA4={paperSize === "A4"} />
                <DottedField label="Adres" value={fields.adres} onChange={v => updateField("adres", v)} isA4={paperSize === "A4"} />
                <DottedField label="Tel" value={fields.tel} onChange={v => updateField("tel", v)} isA4={paperSize === "A4"} />
                {showDoctorInfo && (
                  <>
                    <DottedField label="Doktor Adı" value={fields.doktorAdi} onChange={v => updateField("doktorAdi", v)} isA4={paperSize === "A4"} />
                    <DottedField label="Hastane Adı" value={fields.hastaneAdi} onChange={v => updateField("hastaneAdi", v)} isA4={paperSize === "A4"} />
                  </>
                )}
                {showNotes && (
                  <DottedField label="Notlar" value={fields.notlar} onChange={v => updateField("notlar", v)} isA4={paperSize === "A4"} />
                )}
              </div>

              {/* Axis dials */}
              <div className="flex justify-around mb-3 px-4">
                <AxisDial label="SAĞ" axisValue={fields.farRightAx || fields.nearRightAx || fields.constantRightAx || ""} isA4={paperSize === "A4"} />
                <AxisDial label="SOL" axisValue={fields.farLeftAx || fields.nearLeftAx || fields.constantLeftAx || ""} isA4={paperSize === "A4"} />
              </div>

              {/* Rx table */}
              <div className="mb-4">
                <table className={`w-full border-collapse border border-black ${paperSize === "A4" ? "text-[14px]" : "text-[12px]"} text-center font-semibold`}>
                  <thead>
                    <tr>
                      <th className="border border-black p-1.5 w-16" />
                      <th className="border border-black p-1.5">SPH</th>
                      <th className="border border-black p-1.5">CYL</th>
                      <th className="border border-black p-1.5">AX</th>
                      <th className="border border-black p-1.5">SPH</th>
                      <th className="border border-black p-1.5">CYL</th>
                      <th className="border border-black p-1.5">AX</th>
                      <th className="border border-black p-1.5">PD</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-1.5 text-left font-bold">UZAK</td>
                      <td className="border border-black p-0"><TableInput value={fields.farRightSph} onChange={v => updateField("farRightSph", v)} isA4={paperSize === "A4"} /></td>
                      <td className="border border-black p-0"><TableInput value={fields.farRightCyl} onChange={v => updateField("farRightCyl", v)} isA4={paperSize === "A4"} /></td>
                      <td className="border border-black p-0"><TableInput value={fields.farRightAx} onChange={v => updateField("farRightAx", v)} isA4={paperSize === "A4"} /></td>
                      <td className="border border-black p-0"><TableInput value={fields.farLeftSph} onChange={v => updateField("farLeftSph", v)} isA4={paperSize === "A4"} /></td>
                      <td className="border border-black p-0"><TableInput value={fields.farLeftCyl} onChange={v => updateField("farLeftCyl", v)} isA4={paperSize === "A4"} /></td>
                      <td className="border border-black p-0"><TableInput value={fields.farLeftAx} onChange={v => updateField("farLeftAx", v)} isA4={paperSize === "A4"} /></td>
                      <td className="border border-black p-0"><TableInput value={fields.farPd} onChange={v => updateField("farPd", v)} isA4={paperSize === "A4"} /></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5 text-left font-bold">YAKIN</td>
                      <td className="border border-black p-0"><TableInput value={fields.nearRightSph} onChange={v => updateField("nearRightSph", v)} isA4={paperSize === "A4"} /></td>
                      <td className="border border-black p-0"><TableInput value={fields.nearRightCyl} onChange={v => updateField("nearRightCyl", v)} isA4={paperSize === "A4"} /></td>
                      <td className="border border-black p-0"><TableInput value={fields.nearRightAx} onChange={v => updateField("nearRightAx", v)} isA4={paperSize === "A4"} /></td>
                      <td className="border border-black p-0"><TableInput value={fields.nearLeftSph} onChange={v => updateField("nearLeftSph", v)} isA4={paperSize === "A4"} /></td>
                      <td className="border border-black p-0"><TableInput value={fields.nearLeftCyl} onChange={v => updateField("nearLeftCyl", v)} isA4={paperSize === "A4"} /></td>
                      <td className="border border-black p-0"><TableInput value={fields.nearLeftAx} onChange={v => updateField("nearLeftAx", v)} isA4={paperSize === "A4"} /></td>
                      <td className="border border-black p-0"><TableInput value={fields.nearPd} onChange={v => updateField("nearPd", v)} isA4={paperSize === "A4"} /></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5 text-left font-bold">DAİMİ</td>
                      <td className="border border-black p-0"><TableInput value={fields.constantRightSph} onChange={v => updateField("constantRightSph", v)} isA4={paperSize === "A4"} /></td>
                      <td className="border border-black p-0"><TableInput value={fields.constantRightCyl} onChange={v => updateField("constantRightCyl", v)} isA4={paperSize === "A4"} /></td>
                      <td className="border border-black p-0"><TableInput value={fields.constantRightAx} onChange={v => updateField("constantRightAx", v)} isA4={paperSize === "A4"} /></td>
                      <td className="border border-black p-0"><TableInput value={fields.constantLeftSph} onChange={v => updateField("constantLeftSph", v)} isA4={paperSize === "A4"} /></td>
                      <td className="border border-black p-0"><TableInput value={fields.constantLeftCyl} onChange={v => updateField("constantLeftCyl", v)} isA4={paperSize === "A4"} /></td>
                      <td className="border border-black p-0"><TableInput value={fields.constantLeftAx} onChange={v => updateField("constantLeftAx", v)} isA4={paperSize === "A4"} /></td>
                      <td className="border border-black p-0"><TableInput value={fields.constantPd} onChange={v => updateField("constantPd", v)} isA4={paperSize === "A4"} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              {showNotes && fields.notlar && (
                <div className="mb-3 p-2 border border-dotted border-gray-400 rounded">
                  <p className="text-[11px] font-bold text-gray-700 mb-1">Notlar:</p>
                  <p className="text-[11px] text-gray-800 whitespace-pre-wrap">{fields.notlar}</p>
                </div>
              )}

              {/* Financial */}
              {showFinancial && (
                <div className={`${paperSize === "A4" ? "mt-10 pt-6" : "mt-6 pt-4"} border-t border-dotted border-gray-400`}>
                  <DottedField label="Tutarı" value={fields.tutari} onChange={v => updateField("tutari", v)} width={paperSize === "A4" ? "120px" : "90px"} isA4={paperSize === "A4"} />
                  <DottedField label="Kapora" value={fields.kapora} onChange={v => updateField("kapora", v)} width={paperSize === "A4" ? "120px" : "90px"} isA4={paperSize === "A4"} />
                  <DottedField label="Bakiye" value={fields.bakiye} onChange={v => updateField("bakiye", v)} width={paperSize === "A4" ? "120px" : "90px"} isA4={paperSize === "A4"} />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
