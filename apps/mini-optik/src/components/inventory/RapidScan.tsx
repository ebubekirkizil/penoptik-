"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Camera, X, CheckCircle2, AlertTriangle, Layers, Banknote, Hash,
  Play, Square, RefreshCw, Smartphone, Barcode, Save, History,
  Filter, ChevronDown, Pause, ArrowLeft, ClipboardList, Timer,
  TrendingUp, TrendingDown, Minus as MinusIcon, Package, Sun,
  Glasses, Plus, Eye, Pencil, ChevronRight, BarChart3,
  CheckCircle, XCircle, AlertCircle, Clock, Trash2
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
  costPrice: number;
  stock: number;
  category?: string;
}

interface ScannedItem {
  id: string;
  gtin: string;
  product?: Product;
  timestamp: string;
  status: "SUCCESS" | "UNKNOWN";
  rawText: string;
}

interface ComparisonRow {
  productId: string;
  barcode: string;
  brand: string;
  model: string;
  category: string;
  systemStock: number;
  countedStock: number;
  difference: number;
  status: "MATCH" | "EXCESS" | "SHORTAGE" | "NOT_COUNTED";
}

interface StockSession {
  id: string;
  title: string;
  startedAt: string;
  completedAt?: string;
  totalDurationMs: number;
  pauseStartedAt?: string;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
  items: ScannedItem[];
  comparisonReport?: ComparisonRow[];
  filterBrand: string;
  filterType: string;
}

interface RapidScanProps {
  products: Product[];
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getProductType(product?: Product) {
  const cat = product?.category?.toUpperCase() || "";
  if (["CAM", "KONTAKT"].includes(cat)) return "TIBBİ";
  if (cat === "GUNES") return "GÜNEŞ";
  return "DİĞER";
}

function getKdv(product?: Product) {
  const cat = product?.category?.toUpperCase() || "";
  return ["CAM", "KONTAKT", "CERCEVE"].includes(cat) ? 10 : 20;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}sa ${m}dk`;
  if (m > 0) return `${m}dk ${s}sn`;
  return `${s}sn`;
}

function buildComparisonReport(items: ScannedItem[], products: Product[]): ComparisonRow[] {
  // Count occurrences per barcode
  const countMap: Record<string, number> = {};
  items.filter(i => i.status === "SUCCESS").forEach(i => {
    countMap[i.gtin] = (countMap[i.gtin] || 0) + 1;
  });

  const rows: ComparisonRow[] = products.map(p => {
    const counted = countMap[p.barcode] || 0;
    const diff = counted - p.stock;
    let status: ComparisonRow["status"];
    if (counted === 0) status = "NOT_COUNTED";
    else if (diff === 0) status = "MATCH";
    else if (diff > 0) status = "EXCESS";
    else status = "SHORTAGE";
    return {
      productId: p.id, barcode: p.barcode,
      brand: p.brand, model: p.model,
      category: p.category || "", systemStock: p.stock,
      countedStock: counted, difference: diff, status,
    };
  });

  // Also add unknown barcodes
  Object.keys(countMap).forEach(bc => {
    if (!products.find(p => p.barcode === bc)) {
      rows.push({
        productId: "UNKNOWN", barcode: bc,
        brand: "?", model: "Tanımsız Ürün", category: "",
        systemStock: 0, countedStock: countMap[bc],
        difference: countMap[bc], status: "EXCESS",
      });
    }
  });

  return rows;
}

const STORAGE_KEY = "penoptik_stock_sessions";

function loadSessions(): StockSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSessions(sessions: StockSession[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); } catch { }
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function RapidScan({ products }: RapidScanProps) {
  const [view, setView] = useState<"HOME" | "ACTIVE" | "DETAIL">("HOME");
  const [sessions, setSessions] = useState<StockSession[]>([]);
  const [activeSession, setActiveSession] = useState<StockSession | null>(null);
  const [detailSession, setDetailSession] = useState<StockSession | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // live elapsed ms
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [filterBrand, setFilterBrand] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [showReport, setShowReport] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load from localStorage
  useEffect(() => {
    let stored = loadSessions();
    const activeIndex = stored.findIndex(s => s.status === "ACTIVE");
    if (activeIndex !== -1) {
      // It was interrupted (page refresh / close), auto-pause it.
      const now = Date.now();
      const interrupted = stored[activeIndex];
      const elapsedSinceStart = now - new Date(interrupted.startedAt).getTime();
      const accumulatedMs = interrupted.totalDurationMs + Math.min(elapsedSinceStart, 300000); // Add max 5 mins to prevent huge time jumps if offline
      stored[activeIndex] = { 
        ...interrupted, 
        status: "PAUSED",
        pauseStartedAt: new Date().toISOString(),
        totalDurationMs: accumulatedMs
      };
      saveSessions(stored);
    }
    
    setSessions(stored);
    // Restore any paused session automatically to state, but keep view on HOME
    const active = stored.find(s => s.status === "PAUSED");
    if (active) {
      setActiveSession(active);
      setFilterBrand(active.filterBrand || "ALL");
      setFilterType(active.filterType || "ALL");
      setView("HOME");
    }
  }, []);

  const deleteSession = (id: string) => {
    setSessions(prev => {
      const n = prev.filter(s => s.id !== id);
      saveSessions(n);
      return n;
    });
    if (activeSession?.id === id) setActiveSession(null);
  };

  // Live timer
  useEffect(() => {
    if (view === "ACTIVE" && activeSession?.status === "ACTIVE") {
      timerRef.current = setInterval(() => {
        setElapsed(activeSession.totalDurationMs + (Date.now() - new Date(activeSession.startedAt).getTime()) -
          // subtract time spent paused
          0
        );
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [view, activeSession?.status, activeSession?.id]);

  useEffect(() => {
    isScanningRef.current = isScanning;
  }, [isScanning]);

  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanningRef.current) {
        scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(() => {});
      }
    };
  }, []);

  // ── Persist session changes ────────────────────────────────────────────────
  const updateSession = useCallback((updated: StockSession) => {
    setActiveSession(updated);
    setSessions(prev => {
      const next = prev.map(s => s.id === updated.id ? updated : s);
      const exists = prev.find(s => s.id === updated.id);
      const final = exists ? next : [updated, ...prev];
      saveSessions(final);
      return final;
    });
  }, []);

  // ── Audio ──────────────────────────────────────────────────────────────────
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = 1200;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.12);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.12);
    } catch { }
  };
  const playError = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = "sawtooth"; osc.frequency.value = 200;
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch { }
  };

  // ── GS1 Parser ─────────────────────────────────────────────────────────────
  const extractGtin = (rawText: string) => {
    const match = rawText.match(/(?:^01\)?\s*|^)(\d{13,14})/);
    if (match?.[1]) {
      let g = match[1];
      if (g.length === 14 && g.startsWith("0")) g = g.slice(1);
      return g;
    }
    return rawText;
  };

  const onScanSuccess = useCallback((decodedText: string) => {
    const gtin = extractGtin(decodedText);
    setActiveSession(prev => {
      if (!prev) return prev;
      const lastItem = prev.items[0];
      if (lastItem && lastItem.rawText === decodedText && (Date.now() - new Date(lastItem.timestamp).getTime() < 2000)) return prev;
      const found = products.find(p => p.barcode === gtin);
      const newItem: ScannedItem = {
        id: Date.now().toString(), gtin, rawText: decodedText,
        product: found, status: found ? "SUCCESS" : "UNKNOWN", timestamp: new Date().toISOString(),
      };
      if (found) { playBeep(); toast.success(`${found.brand} ${found.model}`); }
      else { playError(); toast.error("Barkod sistemde bulunamadı!"); }
      const updated: StockSession = { ...prev, items: [newItem, ...prev.items] };
      // persist
      setSessions(s => { const n = s.map(x => x.id === updated.id ? updated : x); saveSessions(n); return n; });
      return updated;
    });
  }, [products]);

  const handleManualBarcode = (code: string) => {
    if (!code.trim()) return;
    onScanSuccess(code.trim());
    setManualCode("");
  };

  // ── Scanner controls ────────────────────────────────────────────────────────
  const startCamera = () => {
    setIsScanning(true);
    setTimeout(() => {
      if (!scannerRef.current) scannerRef.current = new Html5Qrcode("stock-reader");
      scannerRef.current.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, () => {})
        .catch(err => { console.error(err); toast.error("Kamera başlatılamadı."); setIsScanning(false); });
    }, 150);
  };

  const stopCamera = async () => {
    if (!scannerRef.current) { setIsScanning(false); return; }
    try {
      if ((scannerRef.current as any).getState() === 2) await scannerRef.current.stop();
      scannerRef.current.clear();
    } catch (e) { console.warn(e); }
    finally { setIsScanning(false); }
  };

  // ── Session operations ─────────────────────────────────────────────────────

  const createSession = () => {
    if (!newTitle.trim()) { toast.error("Sayım başlığı giriniz."); return; }
    const session: StockSession = {
      id: Date.now().toString(), title: newTitle.trim(),
      startedAt: new Date().toISOString(), totalDurationMs: 0,
      status: "ACTIVE", items: [], filterBrand: "ALL", filterType: "ALL",
    };
    setNewTitle(""); setShowNewModal(false);
    setFilterBrand("ALL"); setFilterType("ALL");
    setSessions(prev => { const n = [session, ...prev]; saveSessions(n); return n; });
    setActiveSession(session);
    setView("ACTIVE");
    setTimeout(() => startCamera(), 300);
  };

  const pauseSession = async () => {
    await stopCamera();
    if (!activeSession) return;
    const now = Date.now();
    const accumulatedMs = activeSession.totalDurationMs + (now - new Date(activeSession.startedAt).getTime());
    const updated: StockSession = {
      ...activeSession, status: "PAUSED",
      pauseStartedAt: new Date().toISOString(),
      totalDurationMs: accumulatedMs,
      filterBrand, filterType,
    };
    updateSession(updated);
    setView("HOME");
    toast("Sayım duraklatıldı. Geri döndüğünüzde devam edebilirsiniz.", { icon: "⏸️" });
  };

  const resumeSession = (session: StockSession) => {
    const updated: StockSession = {
      ...session, status: "ACTIVE",
      startedAt: new Date().toISOString(),
      pauseStartedAt: undefined,
    };
    setActiveSession(updated);
    setFilterBrand(session.filterBrand || "ALL");
    setFilterType(session.filterType || "ALL");
    updateSession(updated);
    setView("ACTIVE");
    setTimeout(() => startCamera(), 300);
  };

  const finalizeSession = async () => {
    await stopCamera();
    if (!activeSession) return;
    const now = Date.now();
    const accMs = activeSession.status === "ACTIVE"
      ? activeSession.totalDurationMs + (now - new Date(activeSession.startedAt).getTime())
      : activeSession.totalDurationMs;
    const report = buildComparisonReport(activeSession.items, products);
    const updated: StockSession = {
      ...activeSession, status: "COMPLETED",
      completedAt: new Date().toISOString(),
      totalDurationMs: accMs, comparisonReport: report,
      filterBrand, filterType,
    };
    updateSession(updated);
    setDetailSession(updated);
    setView("DETAIL");
    toast.success("Sayım sonlandırıldı ve rapor oluşturuldu!");
  };

  // ── Computed ───────────────────────────────────────────────────────────────
  const activeBrands = activeSession
    ? Array.from(new Set(activeSession.items.filter(i => i.status === "SUCCESS").map(i => i.product?.brand).filter(Boolean))) as string[]
    : [];

  const filteredItems = (activeSession?.items || []).filter(item => {
    const bOk = filterBrand === "ALL" || item.product?.brand === filterBrand;
    const tOk = filterType === "ALL" || getProductType(item.product) === filterType;
    return bOk && tOk;
  });

  const groupedItems = React.useMemo(() => {
    const map = new Map<string, { product?: Product, count: number, lastScanned: number, status: string, gtin: string }>();
    filteredItems.forEach(item => {
      const key = item.gtin;
      if (!map.has(key)) {
        map.set(key, { product: item.product, count: 0, lastScanned: 0, status: item.status, gtin: key });
      }
      const current = map.get(key)!;
      current.count += 1;
      current.lastScanned = Math.max(current.lastScanned, item.timestamp);
    });
    return Array.from(map.values()).sort((a, b) => b.lastScanned - a.lastScanned);
  }, [filteredItems]);

  const validItems = (activeSession?.items || []).filter(i => i.status === "SUCCESS");
  const uniqueCount = new Set(validItems.map(i => i.gtin)).size;
  const totalValue = validItems.reduce((s, i) => s + (i.product?.salePrice || 0), 0);

  // ─── HOME VIEW ─────────────────────────────────────────────────────────────
  const pausedSessions = sessions.filter(s => s.status === "PAUSED");
  const completedSessions = sessions.filter(s => s.status === "COMPLETED");

  const renderHome = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Paused sessions banner */}
      {pausedSessions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2"><Pause className="w-4 h-4 text-amber-500" /> Yarıda Kalan Sayımlar</h3>
          {pausedSessions.map(paused => (
            <div key={paused.id} className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500" />
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <Pause className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <div className="font-black text-amber-700 dark:text-amber-400 text-lg tracking-tight mb-1">{paused.title}</div>
                  <div className="text-xs font-semibold text-amber-600/80 dark:text-amber-500/80 flex items-center gap-3">
                    <span className="flex items-center gap-1.5"><Package className="w-4 h-4" /> {paused.items.length} ürün</span>
                    <span className="w-1 h-1 rounded-full bg-amber-600/30" />
                    <span className="flex items-center gap-1.5"><Timer className="w-4 h-4" /> {formatDuration(paused.totalDurationMs)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button onClick={() => deleteSession(paused.id)}
                  className="bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 px-5 py-3.5 rounded-2xl font-bold flex items-center gap-2 shrink-0 transition-all shadow-sm active:scale-95 border border-red-200 dark:border-red-900/30">
                  <Trash2 className="w-4 h-4" /> Sil
                </button>
                <button onClick={() => resumeSession(paused)}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 shrink-0 transition-all shadow-lg shadow-amber-500/25 active:scale-95 flex-1 sm:flex-none justify-center">
                  <Play className="w-5 h-5 fill-current" /> Devam Et
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hero Banner for New Session */}
      <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border-color)] bg-gradient-to-br from-surface to-surface/50 shadow-sm p-8 sm:p-14 group">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none" />
        
        <div className="relative flex flex-col items-center text-center z-10 max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center mb-8 shadow-inner ring-1 ring-primary/20 backdrop-blur-md">
            <Barcode className="w-12 h-12 text-primary drop-shadow-sm" />
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tight mb-4">
            Akıllı Stok Sayımı
          </h2>
          <p className="text-base text-muted-foreground mb-10 leading-relaxed">
            Kameranızı veya harici barkod okuyucunuzu kullanarak mağaza envanterinizi saniyeler içinde sayın, eksik ve fazlalıkları anında tespit edip raporlayın.
          </p>
          <button onClick={() => setShowNewModal(true)}
            className="group/btn relative overflow-hidden bg-primary text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95 text-lg">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-in-out" />
            <Plus className="w-6 h-6 relative z-10" /> 
            <span className="relative z-10">Yeni Sayım Başlat</span>
          </button>
        </div>
      </div>

      {/* Past sessions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-xl flex items-center gap-2 tracking-tight">
            <History className="w-6 h-6 text-primary" /> Geçmiş Sayımlar
            <span className="text-sm font-black bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg ml-1">{completedSessions.length}</span>
          </h3>
        </div>
        
        {completedSessions.length === 0 ? (
          <div className="text-center py-20 bg-surface/50 border-2 border-dashed border-[var(--border-color)] rounded-[2rem]">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-5">
               <ClipboardList className="w-12 h-12 text-primary/40" />
            </div>
            <p className="font-black text-xl text-slate-700 dark:text-slate-300 mb-2">Henüz tamamlanan sayım yok</p>
            <p className="text-sm text-muted-foreground">Geçmiş stok sayımlarınız ve karşılaştırma raporlarınız burada listelenecektir.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {completedSessions.map(s => {
              const rep = s.comparisonReport || [];
              const ok = rep.filter(r => r.status === "MATCH").length;
              const short = rep.filter(r => r.status === "SHORTAGE").length;
              const exc = rep.filter(r => r.status === "EXCESS").length;
              
              return (
                <div key={s.id} onDoubleClick={() => { setDetailSession(s); setView("DETAIL"); }}
                  onClick={() => { setDetailSession(s); setView("DETAIL"); }}
                  className="bg-surface border border-[var(--border-color)] rounded-3xl p-6 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer transition-all duration-300 group flex flex-col h-full">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">{s.title}</div>
                      <div className="flex items-center gap-2 mt-2.5 text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg"><Clock className="w-3.5 h-3.5" /> {new Date(s.startedAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg"><Timer className="w-3.5 h-3.5" /> {formatDuration(s.totalDurationMs)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-5 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-black px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{s.items.filter(i => i.status === "SUCCESS").length} Okunan</span>
                      {ok > 0 && <span className="text-[11px] font-black px-2.5 py-1.5 rounded-lg bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">✓ {ok} Eşleşti</span>}
                      {short > 0 && <span className="text-[11px] font-black px-2.5 py-1.5 rounded-lg bg-red-100/60 dark:bg-red-900/40 text-red-700 dark:text-red-400">↓ {short} Eksik</span>}
                      {exc > 0 && <span className="text-[11px] font-black px-2.5 py-1.5 rounded-lg bg-amber-100/60 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">↑ {exc} Fazla</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ─── ACTIVE VIEW ───────────────────────────────────────────────────────────
  const renderActive = () => (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="bg-surface border border-[var(--border-color)] rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <button onClick={pauseSession} title="Geri Dön (Sayımı Duraklat)" className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-foreground transition-colors shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-black text-lg leading-tight truncate">{activeSession?.title}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <Clock className="w-3 h-3" />
            {new Date(activeSession?.startedAt || "").toLocaleDateString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            {isScanning && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1 text-red-500 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Taranıyor
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={pauseSession}
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-950 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-xl font-bold text-sm transition-all">
            <Pause className="w-4 h-4" /> Duraklat
          </button>
          <button onClick={finalizeSession}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all">
            <CheckCircle className="w-4 h-4" /> Sonlandır
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left: Camera + Stats */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-surface border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
            <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-sm"><Camera className="w-4 h-4 text-primary" /> Kamera</h3>
              {isScanning && <span className="flex h-2.5 w-2.5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" /></span>}
            </div>
            <div className="p-3 flex flex-col items-center justify-center min-h-[250px] bg-black/5">
              {isScanning ? (
                <>
                  <div id="stock-reader" className="w-full min-h-[200px] rounded-xl overflow-hidden border-2 border-primary/20 bg-black" />
                  <button onClick={stopCamera}
                    className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm shadow-md transition-all">
                    <Square className="w-3.5 h-3.5 fill-current" /> Kamerayı Kapat
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <Smartphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-xs max-w-[180px] mx-auto mb-4">Barkodları taramak için kamerayı açın.</p>
                  <button onClick={startCamera}
                    className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 mx-auto shadow-md transition-all text-sm">
                    <Play className="w-4 h-4 fill-current" /> Kamerayı Aç
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-4 text-white shadow-md">
              <div className="text-[10px] font-semibold opacity-80 flex items-center gap-1 mb-1"><Hash className="w-3 h-3" /> Toplam</div>
              <div className="text-3xl font-black">{validItems.length}</div>
              <div className="text-[10px] opacity-60 mt-0.5">Eşleşen adet</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-4 text-white shadow-md">
              <div className="text-[10px] font-semibold opacity-80 flex items-center gap-1 mb-1"><Layers className="w-3 h-3" /> Çeşit</div>
              <div className="text-3xl font-black">{uniqueCount}</div>
              <div className="text-[10px] opacity-60 mt-0.5">Farklı barkod</div>
            </div>
            <div className="col-span-2 bg-gradient-to-br from-violet-600 to-indigo-800 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
              <Banknote className="absolute right-2 top-2 w-14 h-14 opacity-10" />
              <div className="text-[10px] font-semibold opacity-80 flex items-center gap-1 mb-1"><Banknote className="w-3 h-3" /> Sayım Değeri</div>
              <div className="text-2xl font-black">{totalValue.toLocaleString("tr-TR")} ₺</div>
              <div className="text-[10px] opacity-60 mt-0.5">Satış fiyatı üzerinden</div>
            </div>
          </div>
        </div>

        {/* Right: List */}
        <div className="xl:col-span-2 bg-surface border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[500px] max-h-[720px]">
          <div className="p-4 border-b border-[var(--border-color)] space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2"><RefreshCw className="w-4 h-4 text-primary" /> Canlı Liste</h3>
              <div className="flex items-center gap-3">
                <form onSubmit={e => { e.preventDefault(); handleManualBarcode(manualCode); }} className="flex items-center gap-1 bg-background border border-[var(--border-color)] rounded-lg p-1">
                  <input type="text" value={manualCode} onChange={e => setManualCode(e.target.value)} placeholder="Manuel barkod..." className="text-xs px-2 py-1 w-32 sm:w-40 bg-transparent outline-none" />
                  <button type="submit" className="bg-primary hover:bg-primary/90 text-white p-1.5 rounded-md transition-colors"><Plus className="w-3 h-3" /></button>
                </form>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">{(activeSession?.items || []).length}</span>
              </div>
            </div>
            {(activeSession?.items || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)}
                    className="appearance-none pl-7 pr-6 py-1 text-xs font-semibold bg-background border border-[var(--border-color)] rounded-lg focus:outline-none cursor-pointer">
                    <option value="ALL">Tüm Markalar</option>
                    {activeBrands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <Filter className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
                <div className="flex bg-background border border-[var(--border-color)] rounded-lg overflow-hidden text-xs font-semibold">
                  {(["ALL", "TIBBİ", "GÜNEŞ", "DİĞER"] as const).map(t => (
                    <button key={t} onClick={() => setFilterType(t)}
                      className={`px-2.5 py-1 transition-colors ${filterType === t ? "bg-primary text-white" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"}`}>
                      {t === "ALL" ? "Tümü" : t === "TIBBİ" ? "Tıbbi" : t === "GÜNEŞ" ? "Güneş" : "Diğer"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-black/5">
            {filteredItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 py-12">
                <Barcode className="w-12 h-12 mb-2 opacity-40" />
                <p className="text-sm font-semibold">Henüz okuma yok.</p>
              </div>
            ) : (
              <>
                {/* EN SON OKUTULAN */}
                <div className="space-y-2">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-wider ml-1">Son Okutulan</div>
                  {(() => {
                    const lastItem = filteredItems[0];
                    const kdv = getKdv(lastItem.product);
                    const type = getProductType(lastItem.product);
                    return (
                      <div className="p-4 rounded-2xl border bg-primary/5 border-primary/30 shadow-sm flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${lastItem.status === "SUCCESS" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                            {lastItem.status === "SUCCESS" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                          </div>
                          <div>
                            {lastItem.status === "SUCCESS" ? (
                              <>
                                <div className="font-black text-base leading-tight text-primary">{lastItem.product?.brand} {lastItem.product?.model}</div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-xs font-mono text-muted-foreground">{lastItem.gtin}</span>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${type === "TIBBİ" ? "bg-blue-100 text-blue-700" : type === "GÜNEŞ" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                                    KDV %{kdv}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="font-black text-base text-red-600">Tanımsız Ürün</div>
                                <div className="text-xs font-mono text-red-500">{lastItem.gtin}</div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {lastItem.status === "SUCCESS" && <div className="font-black text-base text-emerald-600">{lastItem.product?.salePrice.toLocaleString("tr-TR")} ₺</div>}
                          <div className="text-xs font-semibold text-muted-foreground mt-1">{new Date(lastItem.timestamp).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* GRUPLANMIŞ LİSTE */}
                <div className="space-y-2 pt-2">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-wider ml-1 flex items-center justify-between">
                    <span>Okutulan Çeşitler & Miktarlar</span>
                    <span>{groupedItems.length} Çeşit</span>
                  </div>
                  <div className="space-y-2">
                    {groupedItems.map((group) => {
                      const kdv = getKdv(group.product);
                      const type = getProductType(group.product);
                      return (
                        <div key={group.gtin}
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all bg-surface border-[var(--border-color)] ${group.status === "UNKNOWN" ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800" : ""}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-inner">
                              <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-0.5">Adet</span>
                              <span className="text-sm font-black text-slate-700 dark:text-slate-200 leading-none">{group.count}</span>
                            </div>
                            <div>
                              {group.status === "SUCCESS" ? (
                                <>
                                  <div className="font-bold text-sm leading-tight">{group.product?.brand} {group.product?.model}</div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-mono text-muted-foreground">{group.gtin}</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${type === "TIBBİ" ? "bg-blue-100 text-blue-700" : type === "GÜNEŞ" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                                      KDV %{kdv}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="font-bold text-sm text-red-600">Tanımsız Ürün</div>
                                  <div className="text-[10px] font-mono text-red-500">{group.gtin}</div>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {group.status === "SUCCESS" && <div className="font-black text-sm text-emerald-600">{group.product?.salePrice.toLocaleString("tr-TR")} ₺</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── DETAIL VIEW ────────────────────────────────────────────────────────────
  const renderDetail = () => {
    if (!detailSession) return null;
    const rep = detailSession.comparisonReport || [];
    const match = rep.filter(r => r.status === "MATCH");
    const shortage = rep.filter(r => r.status === "SHORTAGE");
    const excess = rep.filter(r => r.status === "EXCESS");
    const notCounted = rep.filter(r => r.status === "NOT_COUNTED");
    const [repFilter, setRepFilter] = useState<"ALL" | "SHORTAGE" | "EXCESS" | "MATCH" | "NOT_COUNTED">("ALL");
    const repRows = repFilter === "ALL" ? rep : rep.filter(r => r.status === repFilter);

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => { setDetailSession(null); setView("HOME"); }}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-black leading-tight">{detailSession.title}</h2>
            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
              <Clock className="w-3 h-3" />
              {new Date(detailSession.startedAt).toLocaleDateString("tr-TR", { weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              <span>·</span>
              <Timer className="w-3 h-3" />
              {formatDuration(detailSession.totalDurationMs)}
              <span>·</span>
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-600 font-semibold">Tamamlandı</span>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Eşleşti", count: match.length, color: "emerald", icon: CheckCircle, filter: "MATCH" },
            { label: "Eksik (Fire)", count: shortage.length, color: "red", icon: TrendingDown, filter: "SHORTAGE" },
            { label: "Fazla (Fazlalık)", count: excess.length, color: "amber", icon: TrendingUp, filter: "EXCESS" },
            { label: "Sayılmadı", count: notCounted.length, color: "slate", icon: MinusIcon, filter: "NOT_COUNTED" },
          ].map(card => (
            <button key={card.filter} onClick={() => setRepFilter(prev => prev === card.filter as any ? "ALL" : card.filter as any)}
              className={`p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md
                ${repFilter === card.filter ? `border-${card.color}-400 bg-${card.color}-50 dark:bg-${card.color}-950` : "border-[var(--border-color)] bg-surface"}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 bg-${card.color}-100 dark:bg-${card.color}-900/30`}>
                <card.icon className={`w-4 h-4 text-${card.color}-600`} />
              </div>
              <div className={`text-2xl font-black text-${card.color}-600`}>{card.count}</div>
              <div className="text-xs font-semibold text-muted-foreground mt-0.5">{card.label}</div>
            </button>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-surface border border-[var(--border-color)] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <h3 className="font-black flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Stok Karşılaştırma Raporu</h3>
            <span className="text-xs text-muted-foreground">{repRows.length} kayıt</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/5 dark:bg-white/5">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-muted-foreground">Ürün</th>
                  <th className="px-4 py-2.5 text-center text-xs font-bold text-muted-foreground">Sistem Stok</th>
                  <th className="px-4 py-2.5 text-center text-xs font-bold text-muted-foreground">Sayılan</th>
                  <th className="px-4 py-2.5 text-center text-xs font-bold text-muted-foreground">Fark</th>
                  <th className="px-4 py-2.5 text-center text-xs font-bold text-muted-foreground">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {repRows.map((row, i) => (
                  <tr key={`${row.productId}-${i}`} className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${row.status === "SHORTAGE" ? "bg-red-50/50 dark:bg-red-950/20" : row.status === "EXCESS" ? "bg-amber-50/50 dark:bg-amber-950/20" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="font-bold text-sm">{row.brand} {row.model}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{row.barcode}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold">{row.systemStock}</td>
                    <td className="px-4 py-3 text-center font-bold">{row.countedStock}</td>
                    <td className="px-4 py-3 text-center font-black">
                      <span className={row.difference === 0 ? "text-emerald-600" : row.difference > 0 ? "text-amber-600" : "text-red-600"}>
                        {row.difference > 0 ? `+${row.difference}` : row.difference}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.status === "MATCH" && <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3" /> Eşleşti</span>}
                      {row.status === "SHORTAGE" && <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full bg-red-100 text-red-700"><TrendingDown className="w-3 h-3" /> Eksik</span>}
                      {row.status === "EXCESS" && <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full bg-amber-100 text-amber-700"><TrendingUp className="w-3 h-3" /> Fazla</span>}
                      {row.status === "NOT_COUNTED" && <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full bg-slate-100 text-slate-600"><MinusIcon className="w-3 h-3" /> Sayılmadı</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Raw scan list */}
        <details className="bg-surface border border-[var(--border-color)] rounded-2xl overflow-hidden">
          <summary className="p-4 font-bold cursor-pointer flex items-center gap-2 hover:bg-black/5">
            <ClipboardList className="w-4 h-4 text-primary" /> Ham Tarama Listesi ({detailSession.items.length} okutma)
          </summary>
          <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto bg-black/5">
            {detailSession.items.map(item => (
              <div key={item.id} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${item.status === "SUCCESS" ? "bg-surface border-[var(--border-color)]" : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"}`}>
                <div>
                  {item.status === "SUCCESS" ? (
                    <span className="font-bold">{item.product?.brand} {item.product?.model}</span>
                  ) : (
                    <span className="text-red-600 font-bold">Tanımsız: {item.gtin}</span>
                  )}
                  <span className="text-muted-foreground ml-2 font-mono">{item.gtin}</span>
                </div>
                <span className="text-muted-foreground">{new Date(item.timestamp).toLocaleTimeString("tr-TR")}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    );
  };

  // ─── NEW SESSION MODAL ─────────────────────────────────────────────────────
  const renderModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-[var(--border-color)] rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-lg">Yeni Stok Sayımı</h3>
          <button onClick={() => setShowNewModal(false)} className="p-2 hover:bg-black/5 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5">Sayım Başlığı *</label>
            <input
              type="text"
              autoFocus
              placeholder="Örn: Ağustos 2026 Periyodik Sayım"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createSession()}
              className="w-full px-4 py-3 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs text-muted-foreground leading-relaxed">
            <div className="font-bold text-primary mb-1">💡 Bilgi</div>
            Sayım başladığında kamera açılır. Sayımı istediğiniz zaman duraklatabildikten sonra kaldığınız yerden devam edebilirsiniz.
            Sonlandırdığınızda sistem stoğuyla karşılaştırma raporu otomatik oluşturulur.
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowNewModal(false)}
              className="flex-1 py-3 border border-[var(--border-color)] rounded-xl font-bold text-sm hover:bg-black/5 transition-colors">
              İptal
            </button>
            <button onClick={createSession}
              className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm shadow-sm transition-all">
              Başlat
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {showNewModal && renderModal()}
      {view === "HOME" && renderHome()}
      {view === "ACTIVE" && renderActive()}
      {view === "DETAIL" && renderDetail()}
    </div>
  );
}
