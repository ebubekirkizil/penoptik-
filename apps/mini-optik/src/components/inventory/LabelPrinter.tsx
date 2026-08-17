"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Printer, X, Plus, Minus, Search, AlertTriangle, CheckCircle2,
  LayoutTemplate, ChevronRight, ShieldCheck, Tag, Package, Settings, Save
} from "lucide-react";
import { toast } from "react-hot-toast";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  barcode: string;
  brand: string;
  model: string;
  salePrice: number;
  category?: string;
}

interface LabelPrinterProps {
  products: Product[];
}

type TemplateDesign = "STANDARD" | "SGK";

interface LabelTemplate {
  id: string;
  name: string;
  subtitle: string;
  cols: number;
  rows: number;
  labelWidthMm: number;
  labelHeightMm: number;
  previewCols: number;
  previewRows: number;
  isRoll?: boolean;
  pageMargin?: string;
}

const PRESET_TEMPLATES: LabelTemplate[] = [
  { id: "tanex-tw-2095", name: "Tanex TW-2095", subtitle: "5 Sütun × 19 Satır = 95 Etiket", cols: 5, rows: 19, labelWidthMm: 30, labelHeightMm: 12, previewCols: 5, previewRows: 4, pageMargin: "2.5mm 18.5mm" },
  { id: "st-2164", name: "Tanex TW-2164", subtitle: "4 Sütun × 16 Satır = 64 Etiket", cols: 4, rows: 16, labelWidthMm: 52.5, labelHeightMm: 18, previewCols: 4, previewRows: 4, pageMargin: "4.5mm 0mm" },
  { id: "tanex-3x8", name: "Tanex TW-2024", subtitle: "3 Sütun × 8 Satır = 24 Etiket", cols: 3, rows: 8, labelWidthMm: 64, labelHeightMm: 34, previewCols: 3, previewRows: 3, pageMargin: "12.5mm 9mm" },
  { id: "4x12", name: "Tanex TW-2044", subtitle: "4 Sütun × 14 Satır = 56 Etiket", cols: 4, rows: 14, labelWidthMm: 52.5, labelHeightMm: 21.2, previewCols: 4, previewRows: 3, pageMargin: "0mm" },
  { id: "tekli-57x40", name: "Rulo 57×40mm", subtitle: "Termal Yazıcı Uyumlu", cols: 1, rows: 1, labelWidthMm: 57, labelHeightMm: 40, previewCols: 1, previewRows: 1, isRoll: true, pageMargin: "0" },
  { id: "20x10", name: "Rulo 20×10mm", subtitle: "Küçük fiyat etiketi (rol bazlı)", cols: 1, rows: 1, labelWidthMm: 20, labelHeightMm: 10, previewCols: 3, previewRows: 2, isRoll: true, pageMargin: "0" },
];

const SETTINGS_KEY = "labelPrinterSettings";

function loadSettings(): { templateId: string; design: TemplateDesign } {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { templateId: "tanex-tw-2095", design: "STANDARD" };
  } catch { return { templateId: "tanex-tw-2095", design: "STANDARD" }; }
}

function TemplateThumbnail({ template, isSelected }: { template: LabelTemplate; isSelected: boolean }) {
  const cells = Array(template.previewCols * template.previewRows).fill(null);
  return (
    <div className="grid gap-[3px] p-1.5 w-full h-full" style={{ gridTemplateColumns: `repeat(${template.previewCols}, 1fr)` }}>
      {cells.map((_, i) => (
        <div key={i} className={`rounded-sm ${isSelected ? "bg-primary/30 border border-primary/50" : "bg-slate-300/60 dark:bg-slate-600/50 border border-slate-300 dark:border-slate-600"}`} />
      ))}
    </div>
  );
}

export default function LabelPrinter({ products }: LabelPrinterProps) {
  const [settings, setSettings] = useState(() => loadSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(() => loadSettings());

  const selectedTemplate = PRESET_TEMPLATES.find(t => t.id === settings.templateId) || PRESET_TEMPLATES[0];
  const templateDesign = settings.design;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [disabledSlots, setDisabledSlots] = useState<Set<number>>(new Set());
  const [startLabelNumber, setStartLabelNumber] = useState<number | "">("");
  const [endLabelNumber, setEndLabelNumber] = useState<number | "">("");

  const cols = selectedTemplate.cols;
  const rows = selectedTemplate.rows;
  const totalSlots = cols * rows;

  const parsedStartOffset = typeof startLabelNumber === "number" && startLabelNumber > 1 ? startLabelNumber - 1 : 0;

  const missingBarcodes = selectedItems.filter(i => !i.product.barcode || i.product.barcode.trim() === "");

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products.slice(0, 5);
    }

    return products.filter(p =>
      (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode?.includes(searchTerm) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase()))
    ).slice(0, 5);
  }, [products, searchTerm]);

  const labelsToPrint: Product[] = useMemo(() => {
    const arr: Product[] = [];
    selectedItems.forEach(item => { for (let i = 0; i < item.quantity; i++) arr.push(item.product); });
    return arr;
  }, [selectedItems]);

  const mappedSlots = useMemo(() => {
    const mapping: (Product | "DISABLED" | "EMPTY")[] = Array(totalSlots).fill("EMPTY");
    
    // Apply start offset
    for (let i = 0; i < parsedStartOffset && i < totalSlots; i++) {
       mapping[i] = "DISABLED";
    }

    // Apply individually disabled slots
    disabledSlots.forEach(idx => { if (idx < totalSlots) mapping[idx] = "DISABLED"; });
    
    let li = 0;
    for (let i = 0; i < totalSlots; i++) {
      if (mapping[i] !== "DISABLED" && li < labelsToPrint.length) { mapping[i] = labelsToPrint[li]; li++; }
    }
    return { mapping, unplacedCount: Math.max(0, labelsToPrint.length - li) };
  }, [totalSlots, disabledSlots, parsedStartOffset, labelsToPrint]);

  const totalLabelsToPrint = selectedItems.reduce((acc, i) => acc + i.quantity, 0);

  const addItem = useCallback((product: Product) => {
    if (settings.design === "SGK") {
      const cat = product.category?.toUpperCase() || "";
      if (cat === "GUNES") {
        toast.error("HATA: Güneş gözlüğüne SGK / ÜTS etiketi çıkarılamaz!");
        return;
      }
    }
    setSelectedItems(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
    setSearchTerm("");
  }, [settings.design]);

  const updateQty = (id: string, delta: number, isAbsolute: boolean = false, allowZero: boolean = false) =>
    setSelectedItems(prev => prev.map(i => {
      if (i.product.id !== id) return i;
      const next = isAbsolute ? delta : i.quantity + delta;
      return { ...i, quantity: allowZero ? Math.max(0, next) : Math.max(1, next) };
    }));

  const removeItem = (id: string) => setSelectedItems(prev => prev.filter(i => i.product.id !== id));
  
  const toggleSlot = (index: number) => {
    // If it's empty and before our start offset, clicking it makes it the new start!
    if (index < parsedStartOffset) {
      setStartLabelNumber(index + 1);
      return;
    }
    // If it's after or equal to start offset, clicking toggles its disabled state
    setDisabledSlots(prev => { const n = new Set(prev); n.has(index) ? n.delete(index) : n.add(index); return n; });
  };

  // Auto adjust quantity if endLabelNumber is specified and there is exactly 1 item
  useEffect(() => {
    if (typeof startLabelNumber === "number" && typeof endLabelNumber === "number" && endLabelNumber >= startLabelNumber) {
      const desiredQty = (endLabelNumber - startLabelNumber) + 1;
      if (selectedItems.length === 1 && selectedItems[0].quantity !== desiredQty) {
        setSelectedItems(prev => [{ ...prev[0], quantity: desiredQty }]);
      }
    }
  }, [startLabelNumber, endLabelNumber, selectedItems.length]);

  const saveSettings = () => {
    setSettings(tempSettings);
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(tempSettings)); } catch { }
    setShowSettings(false);
    
    // If switching to SGK, remove sunglasses from the queue
    if (tempSettings.design === "SGK") {
      setSelectedItems(prev => {
        const filtered = prev.filter(i => (i.product.category?.toUpperCase() || "") !== "GUNES");
        if (filtered.length < prev.length) {
          toast.error("Güneş gözlükleri SGK etiketi ile basılamayacağı için listeden çıkarıldı.");
        }
        return filtered;
      });
    }
  };

  const updateDesign = (d: TemplateDesign) => {
    const next = { ...settings, design: d };
    setSettings(next);
    setTempSettings(next);
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch { }
    if (d === "SGK") {
      setSelectedItems(prev => {
        const filtered = prev.filter(i => (i.product.category?.toUpperCase() || "") !== "GUNES");
        if (filtered.length < prev.length) {
          toast.error("Güneş gözlükleri SGK etiketi ile basılamayacağı için listeden çıkarıldı.");
        }
        return filtered;
      });
    }
  };

  // ── Settings Modal ──────────────────────────────────────────────────────────
  const renderSettingsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-[var(--border-color)] rounded-3xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-lg flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Etiket Basma Ayarları</h3>
          <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-black/5 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* Design type */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-muted-foreground mb-2">Etiket Tasarımı</label>
          <div className="flex bg-background border border-[var(--border-color)] rounded-xl p-1 gap-1 w-fit">
            <button onClick={() => setTempSettings(p => ({ ...p, design: "STANDARD" }))}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${tempSettings.design === "STANDARD" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-black/5"}`}>
              <Tag className="w-3.5 h-3.5" /> Standart Fiyat
            </button>
            <button onClick={() => setTempSettings(p => ({ ...p, design: "SGK" }))}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${tempSettings.design === "SGK" ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground hover:bg-black/5"}`}>
              <ShieldCheck className="w-3.5 h-3.5" /> SGK / ÜTS
            </button>
          </div>
          {tempSettings.design === "SGK" && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-2">
              ⚠️ SGK/ÜTS etiketi sadece tıbbi ürünler (çerçeve, optik cam, kontakt lens) için kullanılır. Normal güneş gözlüklerinde kullanmayın.
            </p>
          )}
        </div>

        {/* Template selection */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-2">Etiket Kağıt Şablonu</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRESET_TEMPLATES.map(tpl => {
              const isSelected = tempSettings.templateId === tpl.id;
              return (
                <div key={tpl.id} onClick={() => setTempSettings(p => ({ ...p, templateId: tpl.id }))}
                  className={`relative cursor-pointer rounded-2xl border-2 p-3 transition-all hover:shadow-md ${isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-[var(--border-color)] bg-background hover:border-primary/40"}`}>
                  {isSelected && <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5 text-white" /></div>}
                  <div className="h-[56px] w-full mb-2 bg-surface rounded-xl border border-[var(--border-color)] overflow-hidden p-1.5">
                    <TemplateThumbnail template={tpl} isSelected={isSelected} />
                  </div>
                  <div className="font-black text-xs text-foreground leading-tight">{tpl.name}</div>
                  <div className="text-[10px] font-bold text-muted-foreground mt-0.5 mb-1">{tpl.subtitle}</div>
                  <div className="text-[10px] text-muted-foreground">{tpl.labelWidthMm}mm × {tpl.labelHeightMm}mm</div>
                  {tpl.isRoll && <div className="mt-1 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 w-fit">ROL</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowSettings(false)} className="flex-1 py-3 border border-[var(--border-color)] rounded-xl font-bold text-sm hover:bg-black/5 transition-colors">İptal</button>
          <button onClick={saveSettings} className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Ayarları Kaydet
          </button>
        </div>
      </div>
    </div>
  );

  // ── MAIN VIEW ────────────────────────────────────────────────────────────
  const renderMainView = () => (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Left controls & Product selection */}
      <div className="w-full lg:w-[360px] shrink-0 space-y-4 no-print flex flex-col">
        {/* Active template info chip */}
        <div className="flex items-center gap-4 p-4 bg-surface border border-[var(--border-color)] rounded-2xl shadow-sm relative group transition-all hover:border-primary/30">
          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800/50 border border-[var(--border-color)] rounded-xl overflow-hidden p-1.5 shrink-0 flex items-center justify-center">
            <TemplateThumbnail template={selectedTemplate} isSelected />
          </div>
          <div className="flex-1 min-w-0 pr-20">
            <div className="font-black text-sm text-foreground">{selectedTemplate.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{selectedTemplate.subtitle}</div>
          </div>
          <button onClick={() => { setTempSettings(settings); setShowSettings(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary font-bold text-xs rounded-lg hover:bg-primary hover:text-white transition-colors absolute right-4">
            <Settings className="w-3.5 h-3.5" /> Değiştir
          </button>
        </div>

        {/* Design Toggle */}
        <div className="flex bg-background border border-[var(--border-color)] rounded-xl p-1 gap-1">
          <button onClick={() => updateDesign("STANDARD")}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold rounded-lg transition-all ${templateDesign === "STANDARD" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-black/5"}`}>
            <Tag className="w-4 h-4" /> Standart Fiyat
          </button>
          <button onClick={() => updateDesign("SGK")}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold rounded-lg transition-all ${templateDesign === "SGK" ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground hover:bg-black/5"}`}>
            <ShieldCheck className="w-4 h-4" /> SGK / ÜTS
          </button>
        </div>

        {/* Barcode missing warning */}
        {missingBarcodes.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-700 rounded-2xl p-4">
            <div className="flex items-center gap-2 font-black text-red-600 dark:text-red-400 mb-2 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" /> Barkod Eksik! ({missingBarcodes.length} ürün)
            </div>
            <ul className="space-y-1 mb-2">
              {missingBarcodes.map(i => (
                <li key={i.product.id} className="text-xs text-red-700 dark:text-red-300 flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                  <span><span className="font-bold">{i.product.brand} {i.product.model}</span> — barkod yok!</span>
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-red-600/80 leading-snug">Stok Takibi → Ürün Düzenle bölümünden barkod ekleyin.</p>
          </div>
        )}

        {/* Search */}
        <div className="bg-surface border border-[var(--border-color)] rounded-2xl p-4 space-y-3">
          <div className="font-bold text-xs text-muted-foreground flex items-center gap-2"><Package className="w-4 h-4" /> Ürün Ekle</div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Marka, model veya barkod..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>
          
          <div className="bg-background border border-[var(--border-color)] shadow-inner rounded-xl overflow-hidden max-h-[240px] overflow-y-auto">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(p => (
                <button key={p.id} onClick={() => addItem(p)}
                  className="w-full p-3 border-b border-[var(--border-color)] last:border-0 hover:bg-primary/5 flex justify-between items-center transition-colors text-left group">
                  <div>
                    <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{p.brand} {p.model}</div>
                    <div className={`text-xs mt-0.5 flex items-center gap-1 ${!p.barcode ? "text-red-500 font-semibold" : "text-muted-foreground font-mono"}`}>
                      {!p.barcode ? <><AlertTriangle className="w-3 h-3" /> Barkod yok</> : p.barcode}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-surface border border-[var(--border-color)] flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <Plus className="w-4 h-4 shrink-0" />
                  </div>
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-muted-foreground">Sonuç bulunamadı.</div>
            )}
          </div>
        </div>

        {/* Selected items */}
        {selectedItems.length > 0 && (
          <div className="bg-surface border border-[var(--border-color)] rounded-2xl p-4 space-y-3 flex-1 flex flex-col">
            <div className="font-bold text-xs text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-2"><Tag className="w-4 h-4" /> Seçili Ürünler</span>
              <span className="text-primary font-black">{totalLabelsToPrint} etiket</span>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto pr-1 max-h-[200px]">
              {selectedItems.map(item => {
                const noBc = !item.product.barcode;
                return (
                  <div key={item.product.id}
                    className={`rounded-xl p-3 border ${noBc ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800" : "bg-background border-[var(--border-color)]"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate">{item.product.brand} {item.product.model}</div>
                        {noBc
                          ? <div className="text-xs text-red-500 font-semibold flex items-center gap-1 mt-0.5"><AlertTriangle className="w-3 h-3" /> Barkod yok</div>
                          : <div className="text-xs text-muted-foreground font-mono mt-0.5">{item.product.barcode}</div>
                        }
                      </div>
                      <button onClick={() => removeItem(item.product.id)} className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors shrink-0"><X className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{item.product.salePrice.toLocaleString("tr-TR")} ₺</span>
                      <div className="flex items-center bg-surface border border-[var(--border-color)] rounded-lg overflow-hidden">
                        <button onClick={() => updateQty(item.product.id, -1)} className="px-2.5 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"><Minus className="w-3 h-3" /></button>
                        <input type="text" inputMode="numeric" pattern="[0-9]*" value={item.quantity || ""} onChange={(e) => updateQty(item.product.id, parseInt(e.target.value) || 0, true, true)} onBlur={(e) => { if (item.quantity < 1) updateQty(item.product.id, 1, true); }} className="px-1 py-1 text-xs font-black w-10 text-center border-x border-[var(--border-color)] bg-transparent outline-none" />
                        <button onClick={() => updateQty(item.product.id, 1)} className="px-2.5 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="pt-3 mt-3 border-t border-[var(--border-color)] space-y-4">
              {/* Skip N Labels Input */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Etiket Yerleşimi (Kutu Seçimi)</label>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-muted-foreground w-12">Başlangıç:</span>
                    <input type="number" min="1" max={totalSlots} value={startLabelNumber} onChange={e => setStartLabelNumber(e.target.value ? parseInt(e.target.value) : "")} placeholder="1" className="w-16 px-2 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-center focus:ring-2 focus:ring-primary/50 outline-none" />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-muted-foreground w-8">Bitiş:</span>
                    <input type="number" min="1" max={totalSlots} value={endLabelNumber} onChange={e => setEndLabelNumber(e.target.value ? parseInt(e.target.value) : "")} placeholder="Oto" className="w-16 px-2 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-center focus:ring-2 focus:ring-primary/50 outline-none" />
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight block">Boş bırakılan veya koparılmış kutuları atlamak için Başlangıç'ı ayarlayın. Sağdaki Sanal A4 üzerinden de kutulara tıklayabilirsiniz.</span>
              </div>

              {/* Print Summary & Button */}
              <div className="space-y-1.5">
                {[["Kapasite", totalSlots], ["İptal / Boş", parsedStartOffset + disabledSlots.size], ["Basılacak", totalLabelsToPrint]].map(([l, v]) => (
                  <div key={String(l)} className="flex justify-between text-xs text-muted-foreground">
                    <span>{l}</span><span className="font-bold">{v}</span>
                  </div>
                ))}
                {mappedSlots.unplacedCount > 0 && (
                  <div className="flex justify-between text-xs text-red-500 font-black">
                    <span>⚠ Sığmayan (Sonraki sayfaya kalır)</span><span>{mappedSlots.unplacedCount}</span>
                  </div>
                )}
              </div>

              <button onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-lg text-base transition-all">
                <Printer className="w-5 h-5" /> Yazdır ({totalLabelsToPrint})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right: A4 grid (Always visible) */}
      <div className="flex-1 bg-black/5 dark:bg-black/20 rounded-2xl p-5 border border-[var(--border-color)] overflow-auto no-print max-h-[calc(100vh-140px)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black flex items-center gap-2 text-sm"><LayoutTemplate className="w-4 h-4 text-primary" /> Sanal A4 — {selectedTemplate.name}</h3>
          <span className="text-[10px] bg-white/50 dark:bg-black/20 px-2 py-1 rounded text-muted-foreground font-semibold">Boş bırakmak için kutucuklara tıklayın</span>
        </div>
        <div className="bg-white shadow-2xl rounded-sm mx-auto w-full min-w-[750px] max-w-[900px]" style={{ 
          display: "grid", 
          gridTemplateColumns: `repeat(${cols}, 1fr)`, 
          gridTemplateRows: selectedTemplate.isRoll ? "auto" : `repeat(${rows}, 1fr)`,
          gap: "4px", 
          padding: (() => {
            if (selectedTemplate.isRoll) return "12px";
            if (!selectedTemplate.pageMargin) return "0%";
            const p = selectedTemplate.pageMargin.split(" ").map(x => parseFloat(x));
            if (p.length === 1) return `${(p[0] / 210) * 100}%`;
            if (p.length === 2) return `${(p[0] / 297) * 100}% ${(p[1] / 210) * 100}%`;
            if (p.length === 4) return `${(p[0] / 297) * 100}% ${(p[1] / 210) * 100}% ${(p[2] / 297) * 100}% ${(p[3] / 210) * 100}%`;
            return "4%";
          })(),
          aspectRatio: selectedTemplate.isRoll ? "auto" : "210/297"
        }}>
          {mappedSlots.mapping.map((slot, index) => {
            const isDisabled = slot === "DISABLED";
            const isEmpty = slot === "EMPTY";
            const product = (!isDisabled && !isEmpty) ? slot as Product : null;
            return (
              <div key={index} onClick={() => toggleSlot(index)}
                className={`relative flex flex-col items-center justify-center p-1.5 rounded border-dashed border-2 cursor-pointer group transition-all overflow-hidden select-none
                  ${isDisabled ? "border-red-300 bg-red-50" : isEmpty ? "border-slate-200 hover:border-primary/30" : "border-emerald-300 bg-emerald-50 shadow-sm"}
                `} style={{ 
                  aspectRatio: selectedTemplate.isRoll ? `${selectedTemplate.labelWidthMm}/${selectedTemplate.labelHeightMm}` : "auto",
                  minHeight: selectedTemplate.isRoll ? 100 : 0
                }}>
                <div className="absolute top-0.5 left-1 text-[8px] font-bold text-slate-300">{index + 1}</div>
                {isDisabled && <div className="flex flex-col items-center"><X className="w-3.5 h-3.5 text-red-400" /><span className="text-[8px] font-black text-red-500">İPTAL</span></div>}
                {isEmpty && <span className="text-[9px] font-semibold text-slate-300 group-hover:text-primary/50">BOŞ</span>}
                {product && (
                  <div className="w-full h-full flex items-center justify-start gap-1 p-0.5 overflow-hidden" style={{ containerType: 'size' }}>
                    <div className="shrink-0 h-full flex items-center justify-center max-w-[40%]">
                      <QRCodeSVG value={product.barcode || product.id || "000"} size={256} className="h-full w-auto max-h-[85cqh] max-w-[85cqw]" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1 justify-center">
                      <span className="font-black text-slate-900 truncate w-full leading-[1.1]" style={{ fontSize: 'max(4px, 20cqh)' }}>{product.brand} {product.model}</span>
                      <span className="text-slate-600 font-mono leading-tight my-[1px] truncate w-full" style={{ fontSize: 'max(3px, 15cqh)' }}>{product.barcode || "—"}</span>
                      <span className="font-extrabold text-black leading-tight" style={{ fontSize: 'max(5px, 28cqh)' }}>{product.salePrice.toLocaleString("tr-TR")} ₺</span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${isDisabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {isDisabled ? (index < parsedStartOffset ? "Buradan Başla" : "Aktif Et") : "İptal Et"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Print DOM */}
      <div className="print-only">
        <div className="print-page" style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
          {mappedSlots.mapping.map((slot, index) => (
            <div key={index} className="print-slot">
              {slot !== "DISABLED" && slot !== "EMPTY" && (
                <div className="print-label-content">
                  {templateDesign === "STANDARD" ? (
                    <div className="print-standard-layout">
                      {settings.templateId !== "20x10" && (
                        <div className="print-qr"><QRCodeSVG value={(slot as Product).barcode || (slot as Product).id} size={256} level="M" includeMargin={false} /></div>
                      )}
                      <div className="print-info-col">
                        <div className="print-brand">{(slot as Product).brand} {(slot as Product).model}</div>
                        <div className="print-barcode">{(slot as Product).barcode}</div>
                        <div className="print-price">{(slot as Product).salePrice.toLocaleString("tr-TR")} ₺</div>
                      </div>
                    </div>
                  ) : (
                    <div className="print-sgk-layout">
                      <div className="print-sgk-header">ÜTS / GS1</div>
                      <div className="print-qr"><QRCodeSVG value={`01${(slot as Product).barcode}21${(slot as Product).id.slice(0, 6)}`} size={256} level="M" /></div>
                      <div className="print-barcode">01) {(slot as Product).barcode}</div>
                      <div className="print-brand">{(slot as Product).brand} {(slot as Product).model}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {showSettings && renderSettingsModal()}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Printer className="w-6 h-6 text-primary" /> Etiket Yazdır
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Şablon: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedTemplate.name}</span>
            <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
            Tasarım: <span className={`font-semibold ${templateDesign === "SGK" ? "text-indigo-600" : "text-primary"}`}>{templateDesign === "SGK" ? "SGK/ÜTS Formatı" : "Standart Fiyat Formatı"}</span>
          </p>
        </div>
      </div>

      {renderMainView()}

      {/* Print DOM (Always rendered but hidden unless printing) */}
      <div className="print-only">
        <div className="print-page" style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
          {mappedSlots.mapping.map((slot, index) => (
            <div key={index} className="print-slot">
              {slot !== "DISABLED" && slot !== "EMPTY" && (
                <div className="print-label-content">
                  {templateDesign === "STANDARD" ? (
                    <div className="print-standard-layout">
                      {settings.templateId !== "20x10" && (
                        <div className="print-qr"><QRCodeSVG value={(slot as Product).barcode || (slot as Product).id} size={settings.templateId === "20x10" ? 28 : 58} level="M" includeMargin={false} /></div>
                      )}
                      <div className="print-info-col">
                        <div className="print-brand">{(slot as Product).brand} {(slot as Product).model}</div>
                        <div className="print-barcode">{(slot as Product).barcode}</div>
                        <div className="print-price">{(slot as Product).salePrice.toLocaleString("tr-TR")} ₺</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="print-sgk-header">ÜTS / GS1</div>
                      <div className="print-qr"><QRCodeSVG value={`01${(slot as Product).barcode}21${(slot as Product).id.slice(0, 6)}`} size={settings.templateId === "20x10" ? 18 : 38} level="M" /></div>
                      <div className="print-barcode">01) {(slot as Product).barcode}</div>
                      <div className="print-brand">{(slot as Product).brand} {(slot as Product).model}</div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .print-only { display: none; }
        @media print {
          html, body { width: 100%; height: 100%; margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
          body * { visibility: hidden !important; }
          .print-only, .print-only * { visibility: visible !important; }
          .print-only { display: block !important; position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; margin: 0; padding: 0; background: white; page-break-inside: avoid; }
          @page { size: ${selectedTemplate.isRoll ? `${selectedTemplate.labelWidthMm}mm ${selectedTemplate.labelHeightMm}mm` : "A4"}; margin: 0; }
          .print-page { width: 100%; height: 100%; padding: ${selectedTemplate.pageMargin || "0"}; box-sizing: border-box; overflow: hidden; page-break-after: avoid; page-break-inside: avoid; }
          .print-slot { box-sizing: border-box; display: flex; align-items: center; justify-content: center; overflow: hidden; container-type: size; width: ${selectedTemplate.labelWidthMm}mm !important; height: ${selectedTemplate.labelHeightMm}mm !important; place-self: center; }
          .print-label-content { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 1mm 1.5mm; text-align: center; }
          
          .print-standard-layout { display: flex; flex-direction: row; align-items: center; justify-content: flex-start; width: 100%; height: 100%; gap: 1.5mm; text-align: left; }
          .print-standard-layout .print-qr { display: flex; justify-content: center; align-items: center; flex-shrink: 0; height: 100%; max-width: 40%; }
          .print-standard-layout .print-qr svg { height: 100%; width: auto; max-height: 85cqh; max-width: 100cqw; object-fit: contain; }
          
          .print-sgk-layout { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; gap: 0.5mm; }
          .print-sgk-layout .print-qr { height: 50cqh; max-width: 100%; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }
          .print-sgk-layout .print-qr svg { max-height: 100%; max-width: 100%; }

          .print-info-col { display: flex; flex-direction: column; overflow: hidden; justify-content: center; min-width: 0; flex: 1; }
          .print-brand { font-size: max(5pt, 20cqh); font-weight: 900; line-height: 1.1; margin-bottom: 0.5mm; font-family: sans-serif; color: black; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .print-barcode { font-size: max(4pt, 15cqh); font-family: monospace; line-height: 1; color: black; margin-bottom: 0.5mm; letter-spacing: -0.2px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .print-price { font-size: max(6pt, 28cqh); font-weight: 900; color: black; font-family: sans-serif; margin-top: 0.5mm; letter-spacing: -0.5px; }
          .print-sgk-header { font-size: max(4pt, 15cqh); font-weight: bold; margin-bottom: 0.5mm; border-bottom: 0.5px solid black; padding-bottom: 0.2mm; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        }
      ` }} />
    </div>
  );
}
