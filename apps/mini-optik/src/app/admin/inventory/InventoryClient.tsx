
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Package, Plus, Search, Settings, AlertTriangle, ArrowUpDown, Truck, List,
  X, Edit2, Trash2, ChevronDown, ChevronRight, User, Filter, Barcode,
  CheckCircle, CheckCircle2, Circle, TrendingUp, TrendingDown, Clock, Eye,
  FileText, MoreHorizontal, RefreshCw, Download, Upload,
  ShieldCheck, Calendar, Info, Tag, Layers, Glasses,
  Wallet, Banknote, CreditCard, ArrowUpRight, Receipt, Hash, Zap
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import InventorySettings from "./InventorySettings";
import RapidScan from "@/components/inventory/RapidScan";
import LabelPrinter from "@/components/inventory/LabelPrinter";
import BulkActionsPanel from "@/components/inventory/BulkActionsPanel";
import SmartAlerts from "@/components/inventory/SmartAlerts";
import QRScannerModal from "@/components/inventory/QRScannerModal";

// ─── TİPLER ───────────────────────────────────────────────────────────────────

type Category = string; // Changed to dynamic string
type MovementType = "GIRIS" | "CIKIS";
type MovementReason = "TEDARIKCIDEN_ALIM" | "IADE" | "SAYIM" | "SATIS" | "FIRE" | "DEFO" | "TRANSFER";

interface FrameDetails {
  ekartman?: string; // "54□18-140"
  materyal?: string; // Kemik | Metal | Titanyum | Alaşım
  renk?: string;
}
interface LensDetails {
  indeks?: string;   // "1.56" | "1.60" | "1.67" | "1.74"
  kaplama?: string;  // Antirefle | BlueControl | Fotokromik
  sph?: string;
  cyl?: string;
  axis?: string;
}
interface ContactDetails {
  sph?: string;
  cyl?: string;
  axis?: string;
  bc?: string;   // Base Curve
  dia?: string;  // Diameter
  kutuAdet?: number;
  skt?: string;  // Son Kullanma Tarihi
}

interface Product {
  id: string;
  category: Category;
  name: string;
  brand: string;
  model: string;
  barcode: string;
  costPrice: number;
  salePrice: number;
  kdv: number;
  stock: number;
  criticalLimit: number;
  supplierId: string;
  notes: string;
  createdAt: string;
  frame: FrameDetails;
  lens: LensDetails;
  contact: ContactDetails;
}

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  reason: MovementReason;
  note: string;
  staff: string;
  date: string;
}

interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  category: Category[];
  balance: number; // Borç (+) / Alacak (-)
  notes: string;
}

// ─── MOCK VERİ ────────────────────────────────────────────────────────────────

const MOCK_MOVEMENTS: StockMovement[] = [];

interface SgkUtsTransfer {
  id: string;
  sender: string;
  date: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  items: {
    productName: string;
    brand: string;
    barcode: string;
    quantity: number;
    costPrice: number;
    category: Category;
  }[];
}

const MOCK_SGK_TRANSFERS: SgkUtsTransfer[] = [
  {
    id: "TR-10023",
    sender: "Ege Optik Tedarik A.Ş.",
    date: "2026-08-12",
    status: "PENDING",
    items: [
      { productName: "Hoya BlueControl 1.56", brand: "Hoya", barcode: "86900000001", quantity: 10, costPrice: 450, category: "CAM" },
      { productName: "Acuvue Oasys 8.4", brand: "Johnson", barcode: "86900000002", quantity: 5, costPrice: 320, category: "KONTAKT" }
    ]
  },
  {
    id: "TR-10024",
    sender: "Optoline Gözlük San.",
    date: "2026-08-11",
    status: "APPROVED",
    items: [
      { productName: "RayBan Aviator Classic", brand: "RayBan", barcode: "86900000003", quantity: 2, costPrice: 1200, category: "CERCEVE" }
    ]
  }
];

// ─── SABİTLER ─────────────────────────────────────────────────────────────────


const MOVEMENT_REASONS: Record<MovementReason, { label: string; icon: string }> = {
  TEDARIKCIDEN_ALIM: { label: "Tedarikçiden Alım", icon: "+" },
  IADE:              { label: "Müşteri İadesi",     icon: "+" },
  SAYIM:             { label: "Stok Sayımı",        icon: "+" },
  SATIS:             { label: "Satış Çıkışı",       icon: "-" },
  FIRE:              { label: "Fire",               icon: "-" },
  DEFO:              { label: "Defolu Ürün",        icon: "-" },
  TRANSFER:          { label: "Şube Transferi",     icon: "-" },
};

const INDEKS_OPTIONS = ["1.50", "1.56", "1.60", "1.67", "1.74"];
const KAPLAMA_OPTIONS = ["Antirefle", "BlueControl", "Fotokromik (Transitions)", "UV400", "Antirefle+UV", "Antirefle+AR", "Çıplak (Kaplama Yok)"];
const MATERYAL_OPTIONS = ["Kemik (Asetat)", "Metal", "Titanyum", "Alaşım (Alloy)", "TR90 (Plastik)"];

// ─── YARDIMCI FONKSİYONLAR ────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  const now = new Date(); now.setHours(0,0,0,0);
  const d = new Date(dateStr); d.setHours(0,0,0,0);
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

function generateBarcode(cat: Category): string {
  const prefix = { CERCEVE: "789100", CAM: "789200", KONTAKT: "789300", AKSESUAR: "789400" }[cat] || "789500";
  return prefix + Math.floor(Math.random() * 10000).toString().padStart(4, "0");
}

// ─── ANA BİLEŞEN ─────────────────────────────────────────────────────────────

export default function InventoryClient({ initialTab }: { initialTab: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || initialTab || "INVENTORY";

  const [products, setProducts]   = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Veritabanından ürünleri çekme
  useEffect(() => {
    Promise.all([
      fetch('/api/inventory/products').then(res => res.json()),
      fetch('/api/settings/inventory').then(res => res.json()),
      fetch('/api/inventory/suppliers').then(res => res.json())
    ]).then(([productsData, settingsData, suppliersData]) => {
      if (Array.isArray(suppliersData)) {
        setSuppliers(suppliersData);
      }
      if (Array.isArray(productsData)) {
        setProducts(productsData);
      }
      if (settingsData.success && settingsData.inventorySettings?.categories) {
        const TAILWIND_COLORS: Record<string, string> = {
          blue: "#3b82f6", amber: "#f59e0b", purple: "#8b5cf6",
          teal: "#14b8a6", rose: "#f43f5e", emerald: "#10b981", slate: "#64748b"
        };
        const activeCats = settingsData.inventorySettings.categories.filter((c: any) => c.isActive);
        if (activeCats.length > 0) {
          const newCats: Record<string, any> = {};
          activeCats.forEach((c: any) => {
            // "OPTIK_CERCEVE" -> "OPTIK CERCEVE" (UI label)
            let lbl = c.name;
            if (lbl === "CERCEVE") lbl = "Çerçeve";
            else if (lbl === "GUNES") lbl = "Güneş Gözlüğü";
            else if (lbl === "CAM") lbl = "Optik Cam";
            else if (lbl === "KONTAKT") lbl = "Kontakt Lens";
            else lbl = lbl.replace(/_/g, " ");

            newCats[c.name] = { label: lbl, bg: TAILWIND_COLORS[c.color] || "#64748b", text: "#ffffff" };
          });
          setCategories(newCats);
        }
      }
      setIsLoading(false);
    }).catch(err => {
      console.error("Error fetching data:", err);
      setIsLoading(false);
    });
  }, []);

  // Handle URL Actions
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setShowAddModal(true);
    }
  }, [searchParams]);


  // Filters
  const [searchTerm, setSearchTerm]         = useState("");
  const [filterCategory, setFilterCategory] = useState<Category | "ALL">("ALL");
  const [filterSph, setFilterSph]           = useState("");
  const [filterCyl, setFilterCyl]           = useState("");
  const [filterStock, setFilterStock]       = useState<"ALL" | "CRITICAL" | "OK" | "EMPTY">("ALL");
  const [filterBrand, setFilterBrand]       = useState<string>("ALL");
  const [filterMinStock, setFilterMinStock] = useState<string>("");
  const [filterMaxStock, setFilterMaxStock] = useState<string>("");
  const [sortConfig, setSortConfig]         = useState<{key: string, direction: 'asc'|'desc'} | null>(null);

  // Bulk Actions State
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal]         = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showDetailModal, setShowDetailModal]   = useState(false);
  const [showMovementDetailModal, setShowMovementDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingProduct, setEditingProduct]     = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct]   = useState<Product | null>(null);
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);
  const [editingSupplier, setEditingSupplier]   = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget]         = useState<string | null>(null);
  const [deleteReason, setDeleteReason]         = useState<"SIL" | "ZAYIAT" | "IADE">("SIL");
  const [expandedRowId, setExpandedRowId]       = useState<string | null>(null);

  // Add/Edit Form

  const handleQRScanSuccess = async (text: string) => {
    try {
      const parts = text.split("+");
      const barcode = parts[0] || "";
      const dateDesc = parts[1] || "";
      const sku = parts[2] || "";
      const name = parts[3] || "";
      const vendor = parts[4] || "";

      const existingProduct = products.find(p => p.barcode === barcode || (sku && (p as any).sku === sku));
      
      if (existingProduct) {
        if (window.confirm(`"${existingProduct.name}" zaten stokta var (Mevcut: ${existingProduct.stock}). Stoğu 1 artırayım mı?`)) {
          const updatedProducts = products.map(p => {
            if (p.id === existingProduct.id) return { ...p, stock: p.stock + 1 };
            return p;
          });
          setProducts(updatedProducts);
          
          try {
            const res = await fetch("/api/inventory/movements", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: existingProduct.id,
                quantity: 1,
                type: "GIRIS",
                reason: "TEDARIKCIDEN_ALIM",
                note: "QR ile hızlı eklendi"
              })
            });
            if (res.ok) alert("Stok başarıyla eklendi.");
          } catch (e) {
            console.error(e);
          }
        }
      } else {
        setEditingProduct(null);
        setForm({
          name,
          barcode,
          sku,
          brand: vendor,
          vendor,
          category: "CERCEVE",
          kdv: 20, 
          stock: 1, 
          criticalLimit: 5,
          costPrice: 0, 
          salePrice: 0, 
          frame: {}, 
          lens: {}, 
          contact: {},
          notes: dateDesc ? `QR Tarih/Etiket: ${dateDesc}` : ""
        } as any);
        setShowAddModal(true);
      }
    } catch (e) {
      console.error(e);
      alert("Geçersiz QR kod formatı.");
    }
  };

  
    const [form, setForm] = useState<Partial<Product>>({
    category: "CERCEVE", kdv: 20, stock: 0, criticalLimit: 5,
    costPrice: 0, salePrice: 0, frame: {}, lens: {}, contact: {},
  });

  // Dynamic Categories State
  const [categories, setCategories] = useState<Record<string, { label: string, bg: string, text: string }>>({
    CERCEVE: { label: "Çerçeve", bg: "#8b5cf6", text: "#ffffff" },
    GUNES:   { label: "Güneş Gözlüğü", bg: "#f43f5e", text: "#ffffff" },
    CAM:     { label: "Optik Cam", bg: "#3b82f6", text: "#ffffff" },
    KONTAKT: { label: "Kontakt Lens", bg: "#14b8a6", text: "#ffffff" },
    AKSESUAR:{ label: "Aksesuar", bg: "#f59e0b", text: "#ffffff" },
  });
  
  const [localCats, setLocalCats] = useState(categories);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [optikAcik, setOptikAcik] = useState(false);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeSupplierId, setActiveSupplierId] = useState<string | null>(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState<any>(null);
  const [showDebtDetailsModal, setShowDebtDetailsModal] = useState<any>(null);
  const [showSupplierDetailsModal, setShowSupplierDetailsModal] = useState<any>(null);
  const [showInTransitModal, setShowInTransitModal] = useState<boolean>(false);
  const [confirmReceiveId, setConfirmReceiveId] = useState<string | null>(null);
  const [showAllOrdersModal, setShowAllOrdersModal] = useState<boolean>(false);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState<string | null>(null);
  
  // Payment Modal State
  const [showPaymentEntryModal, setShowPaymentEntryModal] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("NAKIT");

  // Movement Form
  const [movForm, setMovForm] = useState({
    productId: "", quantity: 1, type: "GIRIS" as MovementType, reason: "TEDARIKCIDEN_ALIM" as MovementReason, note: "",
  });

  // Supplier Form
  const [supForm, setSupForm] = useState<Partial<Supplier>>({ category: [], balance: 0 });

  // ─── COMPUTED ─────────────────────────────────────────────────────────────

  const totalStockValue   = useMemo(() => products.reduce((s, p) => s + p.costPrice * p.stock, 0), [products]);
  const criticalCount     = useMemo(() => products.filter(p => p.stock <= p.criticalLimit).length, [products]);
  
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      if (filterCategory !== "ALL" && p.category !== filterCategory) return false;
      if (filterBrand !== "ALL" && p.brand !== filterBrand) return false;
      if (filterStock === "CRITICAL" && p.stock > p.criticalLimit) return false;
      if (filterStock === "OK"       && p.stock <= p.criticalLimit) return false;
      if (filterStock === "EMPTY"    && p.stock !== 0) return false;
      if (filterMinStock !== "" && p.stock < parseInt(filterMinStock)) return false;
      if (filterMaxStock !== "" && p.stock > parseInt(filterMaxStock)) return false;
      if (filterSph && p.lens.sph !== filterSph && p.contact.sph !== filterSph) return false;
      if (filterCyl && p.lens.cyl !== filterCyl && p.contact.cyl !== filterCyl) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.barcode.includes(q) || p.brand.toLowerCase().includes(q);
      }
      return true;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        let valA: any = a[sortConfig.key as keyof Product];
        let valB: any = b[sortConfig.key as keyof Product];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [products, filterCategory, filterBrand, filterMinStock, filterMaxStock, filterStock, filterSph, filterCyl, searchTerm, sortConfig]);

  const uniqueBrands = useMemo(() => {
    const brands = new Set(products.map(p => p.brand).filter(Boolean));
    return Array.from(brands).sort();
  }, [products]);

  const criticalProducts = useMemo(() =>
    products.filter(p => p.stock <= p.criticalLimit),
    [products]
  );

  // ─── HANDLERS ─────────────────────────────────────────────────────────────

  const handleSaveProduct = async () => {
    if (!form.name || !form.brand) return;
    try {
      if (editingProduct) {
        // UPDATE: PATCH to API
        const res = await fetch(`/api/inventory/products`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingProduct.id, ...form }),
        });
        if (res.ok) {
          setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...form } as Product : p));
        }
      } else {
        // CREATE: POST to API
        const res = await fetch("/api/inventory/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const saved = await res.json();
          setProducts(prev => [saved, ...prev]);
        } else {
          // Fallback: local only
          const newProduct: Product = {
            id: "p" + Date.now(), barcode: generateBarcode(form.category as Category),
            createdAt: new Date().toISOString().slice(0, 10),
            ...form
          } as Product;
          setProducts(prev => [newProduct, ...prev]);
        }
      }
    } catch {
      // Fallback: local only
      const newProduct: Product = {
        id: "p" + Date.now(), barcode: generateBarcode(form.category as Category),
        createdAt: new Date().toISOString().slice(0, 10),
        ...form
      } as Product;
      setProducts(prev => [newProduct, ...prev]);
    }
    setShowAddModal(false);
    setEditingProduct(null);
    setForm({ category: "CERCEVE", kdv: 20, stock: 0, criticalLimit: 5, costPrice: 0, salePrice: 0, frame: {}, lens: {}, contact: {} });
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({ ...p });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    
    // Zayiat veya İade durumu varsa ÜTS'ye loglayalım (mock)
    if (deleteReason === "ZAYIAT" || deleteReason === "IADE") {
       console.log(`ÜTS Bildirimi: ${deleteReason} işlemi kuyruğa eklendi.`);
       // MOCK: add to queue logic here if needed
    }

    if (deleteTarget === "BULK") {
       setProducts(prev => prev.filter(p => !selectedItems.includes(p.id)));
       setSelectedItems([]);
    } else {
       setProducts(prev => prev.filter(p => p.id !== deleteTarget));
    }
    
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
    setDeleteReason("SIL");
  };

  const handleSaveMovement = () => {
    if (!movForm.productId || movForm.quantity < 1) return;
    const product = products.find(p => p.id === movForm.productId);
    if (!product) return;

    const isGiris = movForm.type === "GIRIS" || ["TEDARIKCIDEN_ALIM","IADE","SAYIM"].includes(movForm.reason);
    const newMov: StockMovement = {
      id: "m" + Date.now(), productId: movForm.productId, productName: product.name,
      type: isGiris ? "GIRIS" : "CIKIS", quantity: movForm.quantity, reason: movForm.reason,
      note: movForm.note, staff: "Admin", date: new Date().toISOString().slice(0, 10),
    };
    const delta = isGiris ? movForm.quantity : -movForm.quantity;
    setProducts(prev => prev.map(p => p.id === movForm.productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
    setMovements(prev => [newMov, ...prev]);
    setShowMovementModal(false);
    setMovForm({ productId: "", quantity: 1, type: "GIRIS", reason: "TEDARIKCIDEN_ALIM", note: "" });
  };

  const handleSaveSupplier = () => {
    if (!supForm.name) return;
    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...supForm } as Supplier : s));
    } else {
      setSuppliers(prev => [...prev, { id: "s" + Date.now(), ...supForm, category: supForm.category || [], balance: supForm.balance || 0 } as Supplier]);
    }
    setShowSupplierModal(false);
    setEditingSupplier(null);
    setSupForm({ category: [], balance: 0 });
  };

  // ─── ORTAK UI ─────────────────────────────────────────────────────────────

  const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || "—";

  const Badge = ({ cat }: { cat: Category }) => {
    const c = categories[cat] || { label: cat, bg: "#888", text: "#fff" };
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold" style={{ backgroundColor: c.bg, color: c.text }}>
        {c.label}
      </span>
    );
  };

  const StockBadge = ({ stock, limit }: { stock: number; limit: number }) => {
    const isCritical = stock <= limit;
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${isCritical ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"}`}>
        {stock} Adet
      </span>
    );
  };

  // ─── SEKME İÇERİKLERİ ─────────────────────────────────────────────────────

  
  const renderInventory = () => (
    <div className="">
      {/* Category Tabs (Like Siparişler) */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
          <button 
            onClick={() => setFilterCategory("ALL")}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filterCategory === "ALL" ? "bg-[#4f818c] text-white" : "bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm"}`}
          >
            Tümü <span className={`ml-1 text-xs ${filterCategory === "ALL" ? "text-white/80" : "bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md"}`}>{products.length}</span>
          </button>
          {Object.keys(categories).map(k => (
            <button 
              key={k}
              onClick={() => setFilterCategory(k as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filterCategory === k ? "bg-[#4f818c] text-white" : "bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm"}`}
            >
              {categories[k].label} <span className={`ml-1 text-xs ${filterCategory === k ? "text-white/80" : "bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md"}`}>{products.filter(p => p.category === k).length}</span>
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => setShowQRScanner(true)}
          className="w-full md:w-auto px-4 py-2.5 md:py-1.5 rounded-xl md:rounded-full text-sm font-bold bg-blue-600 text-white flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap shrink-0"
        >
          <Barcode className="w-5 h-5 md:w-4 md:h-4" /> QR'la Ekle
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-[var(--border-color)] rounded-2xl p-1.5 mb-6 shadow-sm flex flex-col md:flex-row items-center gap-1.5">
        
        <div className="flex-1 w-full relative flex items-center bg-slate-50/80 dark:bg-slate-800/30 rounded-xl px-4 py-2.5 border border-transparent focus-within:border-primary/30 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-4 focus-within:ring-primary/5 transition-all group">
          <Filter className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors mr-3 flex-shrink-0"/>
          <select 
            value={filterBrand} onChange={e => setFilterBrand(e.target.value)}
            className="w-full bg-transparent border-none text-sm focus:outline-none appearance-none font-semibold text-slate-700 dark:text-slate-300 py-0.5 cursor-pointer"
          >
            <option value="ALL">Tüm Markalar</option>
            {uniqueBrands.map(b => <option key={b as string} value={b as string}>{b as string}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none flex-shrink-0" />
        </div>

        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

        <div className="flex-1 w-full relative flex items-center bg-slate-50/80 dark:bg-slate-800/30 rounded-xl px-4 py-2.5 border border-transparent focus-within:border-primary/30 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-4 focus-within:ring-primary/5 transition-all group gap-2">
          <Layers className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors flex-shrink-0"/>
          <input type="number" placeholder="Min Stok" value={filterMinStock} onChange={e => setFilterMinStock(e.target.value)} className="w-full bg-transparent border-none text-sm focus:outline-none font-semibold text-slate-700 dark:text-slate-300 text-center placeholder-slate-400" />
          <span className="text-slate-300 font-medium">-</span>
          <input type="number" placeholder="Max Stok" value={filterMaxStock} onChange={e => setFilterMaxStock(e.target.value)} className="w-full bg-transparent border-none text-sm focus:outline-none font-semibold text-slate-700 dark:text-slate-300 text-center placeholder-slate-400" />
        </div>

        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

        <div className="flex-1 w-full relative flex items-center bg-slate-50/80 dark:bg-slate-800/30 rounded-xl px-4 py-2.5 border border-transparent focus-within:border-primary/30 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-4 focus-within:ring-primary/5 transition-all group">
          <ArrowUpDown className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors mr-3 flex-shrink-0"/>
          <select 
            value={sortConfig ? `${sortConfig.key}_${sortConfig.direction}` : ""} 
            onChange={e => {
              if(!e.target.value) setSortConfig(null);
              else {
                const [k, d] = e.target.value.split("_");
                setSortConfig({ key: k, direction: d as 'asc'|'desc' });
              }
            }}
            className="w-full bg-transparent border-none text-sm focus:outline-none appearance-none font-semibold text-slate-700 dark:text-slate-300 py-0.5 cursor-pointer"
          >
            <option value="">Sıralama (Akıllı)</option>
            <option value="stock_asc">Stok Miktarı (Azdan Çoğa)</option>
            <option value="stock_desc">Stok Miktarı (Çoktan Aza)</option>
            <option value="salePrice_desc">Fiyat (Pahalıdan Ucuza)</option>
            <option value="salePrice_asc">Fiyat (Ucuzdan Pahalıya)</option>
            <option value="name_asc">Ürün Adı (A-Z)</option>
            <option value="name_desc">Ürün Adı (Z-A)</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none flex-shrink-0" />
        </div>
        
        
        <div className="w-full md:w-auto pr-1 pl-1 md:pl-2 pb-1 md:pb-0">
          <button onClick={() => setShowBulkActions(!showBulkActions)} className={`w-full md:w-auto px-4 py-2.5 font-bold text-sm rounded-xl transition-colors whitespace-nowrap flex items-center justify-center gap-2 ${showBulkActions ? 'bg-indigo-600 text-white shadow-sm' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20'}`}>
            <List className="w-4 h-4" /> Toplu İşlemler
          </button>
        </div>
        {(filterCategory !== "ALL" || filterBrand !== "ALL" || filterMinStock !== "" || filterMaxStock !== "" || sortConfig !== null || filterStock !== "ALL" || searchTerm !== "") && (
          <div className="w-full md:w-auto pr-1 pl-1 md:pl-2 pb-1 md:pb-0 animate-in fade-in zoom-in duration-200">
            <button onClick={() => {
              setFilterCategory("ALL"); setFilterBrand("ALL"); setFilterMinStock(""); setFilterMaxStock(""); setSortConfig(null); setFilterStock("ALL"); setSearchTerm("");
            }} className="w-full md:w-auto px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm rounded-xl transition-colors whitespace-nowrap flex items-center justify-center gap-2">
              <X className="w-4 h-4 opacity-50" /> Temizle
            </button>
          </div>
        )}

      </div>

      <div className="card overflow-hidden">
        
        {showBulkActions && (
          <div className="bg-indigo-50/50 dark:bg-indigo-900/10 px-5 py-4 flex flex-col md:flex-row items-center justify-between border-b border-indigo-100 dark:border-indigo-800/30 gap-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-4">
              <button onClick={() => {
                if (selectedItems.length === filteredProducts.length) setSelectedItems([]);
                else setSelectedItems(filteredProducts.map(p => p.id));
              }} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                {selectedItems.length === filteredProducts.length ? "Seçimi Temizle" : "Tümünü Seç"}
              </button>
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 rounded-full">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">{selectedItems.length}</span>
                  <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Seçili</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button disabled={selectedItems.length === 0} onClick={() => setShowBulkModal(true)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-500" /> Fiyat Güncelle
              </button>
              <button disabled={selectedItems.length === 0} onClick={() => {
                router.push("/admin/inventory?tab=LABELS");
              }} className="px-4 py-2 bg-indigo-600 border border-indigo-600 rounded-lg text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <Barcode className="w-4 h-4" /> Etiket Yazdır
              </button>
              <button disabled={selectedItems.length === 0} onClick={() => {
                setDeleteTarget("BULK");
                setShowDeleteConfirm(true);
              }} className="px-4 py-2 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/30 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Toplu Sil
              </button>
            </div>
          </div>
        )}

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
              <tr>
                <th className="px-5 py-3.5 w-12">
                  <input type="checkbox" 
                    checked={filteredProducts.length > 0 && selectedItems.length === filteredProducts.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedItems(filteredProducts.map(p => p.id));
                      else setSelectedItems([]);
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Ürün</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Kategori</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Maliyet / Satış</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-center">Stok</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] bg-surface dark:bg-transparent">
              {filteredProducts.map(p => {
                const catStyle = categories[p.category] || { label: p.category, bg: "#888", text: "#fff" };
                const isCritical = p.stock <= p.criticalLimit;
                const isExpanded = expandedRowId === p.id;
                return (
                  <React.Fragment key={p.id}>
                  <tr 
                    className={`hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer ${selectedItems.includes(p.id) ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''} ${isExpanded ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return;
                      if ((e.target as HTMLElement).closest('button')) return;
                      setExpandedRowId(isExpanded ? null : p.id);
                    }}
                    onDoubleClick={(e) => {
                      if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return;
                      if ((e.target as HTMLElement).closest('button')) return;
                      handleOpenEdit(p);
                    }}
                  >
                    <td className="px-5 py-4 w-12">
                      <input type="checkbox"
                        checked={selectedItems.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedItems(prev => [...prev, p.id]);
                          else setSelectedItems(prev => prev.filter(id => id !== p.id));
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-sm flex-shrink-0 group-hover:bg-[#4f818c] group-hover:text-white transition-colors">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                            {p.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{p.brand} • {p.barcode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold shadow-sm" style={{ backgroundColor: catStyle.bg, color: catStyle.text }}>
                        {catStyle.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                       <div className="space-y-1">
                          <p className="text-sm font-semibold text-emerald-600">{p.salePrice.toLocaleString("tr-TR")} ₺</p>
                          <p className="text-xs text-slate-400">Mal: {p.costPrice.toLocaleString("tr-TR")} ₺</p>
                       </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                       <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${isCritical ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-700/50 text-amber-600 dark:text-amber-400' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300'}`}>
                          {p.stock} Adet
                       </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                       <div 
                           onClick={(e) => { 
                               e.stopPropagation(); 
                               setSelectedProduct(p); 
                               setShowDetailModal(true); 
                           }} 
                           className="inline-flex items-center gap-1 text-xs font-semibold text-[#4f818c] hover:text-[#3a616a] cursor-pointer"
                       >
                          Detay <ChevronRight className="w-3.5 h-3.5" />
                       </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-slate-50/80 dark:bg-slate-800/20 border-b border-[var(--border-color)]">
                      <td colSpan={6} className="px-5 py-2">
                        <div className="flex items-center justify-end gap-3">
                            <span className="flex items-center gap-3 mr-auto pl-2">
                              <div className="bg-white p-1 rounded border shadow-sm dark:border-slate-700">
                                <QRCodeSVG value={p.barcode || "0"} size={36} />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700 dark:text-slate-300">{p.model || p.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{p.barcode}</span>
                              </div>
                            </span>
                            <button onClick={() => { setEditingProduct(p); setForm(p); setShowAddModal(true); }} className="px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                              <Edit2 className="w-3 h-3" /> Düzenle
                            </button>
                            <button onClick={() => { setDeleteTarget(p.id); setShowDeleteConfirm(true); }} className="px-4 py-1.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                              <Trash2 className="w-3 h-3" /> Sil
                            </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center mb-4">
                       <Package className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Kayıt Bulunamadı</p>
                    <p className="text-sm text-slate-500 mt-1">Arama kriterlerinize uygun ürün yok.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBIL KART GORUNUMU (Envanter) */}
        <div className="md:hidden flex flex-col gap-3 mt-4">
          {filteredProducts.map(p => {
            const catStyle = categories[p.category] || { label: p.category, bg: "#888", text: "#fff" };
            const isCritical = p.stock <= p.criticalLimit;
            
            return (
              <div 
                key={p.id}
                onClick={() => { setSelectedProduct(p); setShowDetailModal(true); }}
                className={`flex flex-col gap-3 p-4 rounded-xl border transition-all cursor-pointer ${selectedItems.includes(p.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
              >
                <div className="flex items-start gap-3">
                  <div onClick={(e) => e.stopPropagation()} className="pt-1">
                    <input type="checkbox"
                      checked={selectedItems.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedItems(prev => [...prev, p.id]);
                        else setSelectedItems(prev => prev.filter(id => id !== p.id));
                      }}
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-base flex-shrink-0">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 truncate">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{p.brand} • {p.barcode}</p>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold shadow-sm" style={{ backgroundColor: catStyle.bg, color: catStyle.text }}>
                      {catStyle.label}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${isCritical ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 text-amber-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      {p.stock} Adet
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Satış</p>
                      <p className="text-sm font-black text-emerald-600">{p.salePrice.toLocaleString("tr-TR")} ₺</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Maliyet</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{p.costPrice.toLocaleString("tr-TR")} ₺</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingProduct(p); setForm(p); setShowAddModal(true); }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          
          {filteredProducts.length === 0 && (
            <div className="py-10 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center mb-3">
                 <Package className="w-6 h-6 text-slate-400" />
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Kayıt Bulunamadı</p>
              <p className="text-xs text-slate-500 mt-1">Arama kriterlerinize uygun ürün yok.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  
  const renderMovements = () => (
    <div className=" space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Tüm Stok Hareketleri</h3>
        <button onClick={() => setShowMovementModal(true)}
          className="px-4 py-2 bg-[#4f818c] hover:bg-[#3a616a] text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Hareket Ekle
        </button>
      </div>

      <div className="card overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Hareket Geçmişi</h4>
          <span className="text-xs font-medium text-slate-500 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">{movements.length} Kayıt</span>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Tarih</th>
                <th className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Ürün</th>
                <th className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Sebep</th>
                <th className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider text-center">Miktar</th>
                <th className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Not / Personel</th>
                <th className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] bg-surface dark:bg-transparent">
              {movements.map(m => {
                const isIn = m.type === "GIRIS";
                const reason = MOVEMENT_REASONS[m.reason];
                return (
                  <tr key={m.id} onDoubleClick={() => { setSelectedMovement(m); setShowMovementDetailModal(true); }} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer">
                    <td className="px-5 py-4 text-slate-500 font-medium">{m.date}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{m.productName}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${isIn ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400"}`}>
                        {reason.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-sm font-black ${isIn ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {isIn ? "+" : "-"}{m.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300">{m.note || "—"}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{m.staff}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                       <button onClick={(e) => { e.stopPropagation(); setSelectedMovement(m); setShowMovementDetailModal(true); }} className="inline-flex items-center gap-1 text-xs font-semibold text-[#4f818c] hover:text-[#3a616a]">
                          İşlem Detayı <ChevronRight className="w-3.5 h-3.5" />
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MOBIL KART GORUNUMU (Stok Hareketleri) */}
        <div className="md:hidden flex flex-col gap-3 mt-4">
          {movements.map(m => {
            const isIn = m.type === "GIRIS";
            const reason = MOVEMENT_REASONS[m.reason];
            return (
              <div 
                key={m.id} 
                onClick={() => { setSelectedMovement(m); setShowMovementDetailModal(true); }}
                className="flex flex-col p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm cursor-pointer hover:border-[#4f818c] transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">{m.productName}</h4>
                    <p className="text-xs text-slate-500 font-medium">{m.date}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className={`text-lg font-black block ${isIn ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {isIn ? "+" : "-"}{m.quantity}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 mt-1 rounded text-[10px] font-bold border ${isIn ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-rose-50 border-rose-200 text-rose-600"}`}>
                      {reason.label}
                    </span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-medium">Personel: <span className="text-slate-700 dark:text-slate-300 font-bold">{m.staff}</span></span>
                    {m.note && <span className="text-slate-500 italic truncate mt-0.5">{m.note}</span>}
                  </div>
                  <button className="flex-shrink-0 w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {movements.length === 0 && (
            <div className="py-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 font-medium text-sm">Hareket bulunamadı</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );


  const renderSuppliers = () => {
    if (activeSupplierId) {
      const s = suppliers.find(sup => sup.id === activeSupplierId);
      if (!s) return null;
      
      const supplierProducts = products.filter(p => p.supplierId === s.id);
      const outOfStock = supplierProducts.filter(p => p.stock === 0);
      const criticalStock = supplierProducts.filter(p => p.stock > 0 && p.stock <= (p.criticalLimit || 5));
      const currentStockCount = supplierProducts.reduce((sum, p) => sum + p.stock, 0);
      const inTransit = Math.floor(Math.random() * 5) + 1; // Fake data
      const totalPaid = Math.floor(Math.random() * 80000) + 20000; // Fake data
      const totalBought = s.balance + totalPaid; // Simple fake calc
      
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveSupplierId(null)} className="w-10 h-10 rounded-xl bg-surface border border-[var(--border-color)] flex items-center justify-center text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">{s.name} <span className="text-muted-foreground font-semibold text-lg opacity-50">Detayları</span></h2>
                <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1"><User className="w-4 h-4" /> {s.contact}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span>{s.phone}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => { setForm(f => ({...f, supplierId: s.id})); setEditingProduct(null); setShowAddModal(true); }}
              className="px-5 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-2xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" /> Tedarikçiden Ürün Ekle
            </button>
          </div>
          
          {/* BENTO GRID STATS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Main Balance Card */}
            <div 
              onDoubleClick={() => setShowDebtDetailsModal(true)}
              className="md:col-span-4 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-[2rem] p-6 relative overflow-hidden shadow-lg cursor-pointer group hover:-translate-y-1 transition-all duration-300"
            >
              <Wallet className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10">
                <p className="text-sm font-semibold text-slate-400 flex items-center gap-2 mb-2"><Wallet className="w-4 h-4" /> Kalan Borç</p>
                <p className={`text-4xl font-black ${s.balance < 0 ? "text-rose-400" : s.balance > 0 ? "text-emerald-400" : "text-white"} mb-6`}>
                  {s.balance > 0 ? "+" : ""}{s.balance.toLocaleString("tr-TR")} ₺
                </p>
                
                <div className="flex gap-2 flex-wrap">
                  {s.category.map(c => <Badge key={c} cat={c} />)}
                </div>
              </div>
            </div>

            {/* Paid & Bought Stats */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-surface border border-[var(--border-color)] rounded-[2rem] p-6 shadow-sm flex flex-col justify-center relative overflow-hidden hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Banknote className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 text-slate-100 dark:text-slate-800 pointer-events-none" />
                <p className="text-sm font-bold text-muted-foreground mb-1 relative z-10">Bugüne Kadar Ödenen</p>
                <p className="text-3xl font-black text-foreground relative z-10">{totalPaid.toLocaleString("tr-TR")} ₺</p>
              </div>
              <div className="bg-surface border border-[var(--border-color)] rounded-[2rem] p-6 shadow-sm flex flex-col justify-center relative overflow-hidden hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Package className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 text-slate-100 dark:text-slate-800 pointer-events-none" />
                <p className="text-sm font-bold text-muted-foreground mb-1 relative z-10">Toplam Mal Alımı</p>
                <p className="text-3xl font-black text-foreground relative z-10">{totalBought.toLocaleString("tr-TR")} ₺</p>
              </div>
              
              {/* Stock Overview */}
              <div className="bg-surface border border-[var(--border-color)] rounded-[2rem] p-6 shadow-sm flex items-center justify-between col-span-1 sm:col-span-2">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Layers className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">Mevcut Stok Adedi</p>
                    <p className="text-2xl font-black text-foreground">{currentStockCount} Adet</p>
                  </div>
                </div>
                <div className="h-12 w-px bg-border mx-4 hidden sm:block" />
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${criticalStock.length > 0 ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400" : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"}`}>
                    {criticalStock.length > 0 ? <AlertTriangle className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">Kritik Stok Uyarısı</p>
                    <p className="text-2xl font-black text-foreground">{criticalStock.length} Ürün</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-foreground">Geçmiş Siparişler (Son 5 İşlem)</h4>
                  <button onClick={() => setShowAllOrdersModal(true)} className="text-xs font-bold text-primary hover:text-primary/80 transition-colors px-3 py-1.5 bg-primary/10 rounded-lg">Tümünü Gör</button>
                </div>
                <div className="bg-surface border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
                        <tr>
                          <th className="px-5 py-3.5 font-bold text-muted-foreground text-[11px] uppercase tracking-wider">Tarih</th>
                          <th className="px-5 py-3.5 font-bold text-muted-foreground text-[11px] uppercase tracking-wider">Tutar</th>
                          <th className="px-5 py-3.5 font-bold text-muted-foreground text-[11px] uppercase tracking-wider">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)] bg-transparent">
                        {[
                          { id: "ORD-001", date: "12 Ağu 2026", amount: "12.500 ₺", status: "Teslim Edildi", utsStatus: "ONAYLANDI", category: "Tıbbi Cihaz", items: [{name: "Optik Çerçeve", count: 15}] },
                          { id: "ORD-002", date: "05 Ağu 2026", amount: "8.250 ₺", status: "Teslim Edildi", utsStatus: "BEKLIYOR", category: "Tıbbi Cihaz", items: [{name: "Kontakt Lens", count: 50}] },
                          { id: "ORD-003", date: "28 Tem 2026", amount: "15.000 ₺", status: "Teslim Edildi", utsStatus: "YOK", category: "Aksesuar", items: [{name: "Gözlük Kılıfı", count: 100}] },
                          { id: "ORD-004", date: "15 Tem 2026", amount: "4.750 ₺", status: "Teslim Edildi", utsStatus: "ONAYLANDI", category: "Tıbbi Cihaz", items: [{name: "Güneş Gözlüğü", count: 8}] },
                          { id: "ORD-005", date: "01 Tem 2026", amount: "22.100 ₺", status: "Teslim Edildi", utsStatus: "ONAYLANDI", category: "Tıbbi Cihaz", items: [{name: "Optik Cam", count: 120}] },
                        ].map((order, i) => (
                          <tr key={i} onClick={() => setShowOrderDetailsModal(order)} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                            <td className="px-5 py-3.5 font-medium text-foreground group-hover:text-primary transition-colors">{order.date}</td>
                            <td className="px-5 py-3.5 font-semibold text-foreground">{order.amount}</td>
                            <td className="px-5 py-3.5">
                              <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold">{order.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-foreground mb-3">Bekleyen Ödemeler / Borçlar</h4>
                <div className="bg-surface border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
                        <tr>
                          <th className="px-5 py-3.5 font-bold text-muted-foreground text-[11px] uppercase tracking-wider">Son Ödeme Tarihi</th>
                          <th className="px-5 py-3.5 font-bold text-muted-foreground text-[11px] uppercase tracking-wider">Fatura / Tutar</th>
                          <th className="px-5 py-3.5 font-bold text-muted-foreground text-[11px] uppercase tracking-wider">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)] bg-transparent">
                        {[
                          { date: "30 Ağu 2026", amount: "8.000 ₺", invoice: "INV-2026-081", status: "Beklemede" },
                          { date: "15 Eyl 2026", amount: "4.500 ₺", invoice: "INV-2026-079", status: "Beklemede" },
                        ].map((debt, i) => (
                          <tr key={i} onClick={() => { setShowDebtDetailsModal(debt); }} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                            <td className="px-5 py-3.5 font-medium text-foreground group-hover:text-primary transition-colors">{debt.date}</td>
                            <td className="px-5 py-3.5">
                              <div className="flex flex-col group-hover:text-primary transition-colors">
                                <span className="font-semibold">{debt.amount}</span>
                                <span className="text-xs text-muted-foreground font-mono">{debt.invoice}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5"><span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold">{debt.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-foreground mb-3">Stoğu Biten Ürünler ({outOfStock.length})</h4>
                {outOfStock.length > 0 ? (
                  <div className="bg-surface border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
                          <tr>
                            <th className="px-5 py-3.5 font-bold text-muted-foreground text-[11px] uppercase tracking-wider">Ürün</th>
                            <th className="px-5 py-3.5 font-bold text-muted-foreground text-[11px] uppercase tracking-wider">Barkod</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)] bg-transparent">
                          {outOfStock.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-5 py-3.5 font-medium text-foreground">{p.name}</td>
                              <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">{p.barcode}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface border border-[var(--border-color)] rounded-2xl p-6 text-center text-muted-foreground flex items-center justify-center font-medium">Stoğu biten ürün bulunmuyor.</div>
                )}
              </div>
              
              <div>
                <h4 className="font-bold text-foreground mb-3">Kritik Stok Uyarıları</h4>
                <div className="bg-surface border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
                        <tr>
                          <th className="px-5 py-3.5 font-bold text-muted-foreground text-[11px] uppercase tracking-wider">Ürün</th>
                          <th className="px-5 py-3.5 font-bold text-muted-foreground text-[11px] uppercase tracking-wider text-right">Kalan Stok</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)] bg-transparent">
                        {criticalStock.length > 0 ? (
                          criticalStock.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-5 py-3.5 font-medium text-foreground">{p.name}</td>
                              <td className="px-5 py-3.5 text-right">
                                <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-bold">{p.stock} Adet</span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={2} className="px-5 py-6 text-center text-muted-foreground font-medium">Kritik seviyede ürün bulunmuyor.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-foreground mb-3">Yolda Olan Siparişler ({inTransit})</h4>
                <div className="bg-surface border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
                        <tr>
                          <th className="px-5 py-3.5 font-bold text-muted-foreground text-[11px] uppercase tracking-wider">Tahmini Varış</th>
                          <th className="px-5 py-3.5 font-bold text-muted-foreground text-[11px] uppercase tracking-wider">İçerik</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)] bg-transparent">
                        {[
                          { date: "Bugün", content: "Optik Çerçeve (50 Adet)" },
                          { date: "Yarın", content: "Kontakt Lens (120 Adet)" },
                          { date: "24 Ağu 2026", content: "Optik Cam (80 Adet)" },
                        ].map((transit, i) => (
                          <tr key={i} onClick={() => setShowInTransitModal(true)} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                            <td className="px-5 py-3.5 font-medium text-foreground">{transit.date}</td>
                            <td className="px-5 py-3.5 text-muted-foreground">{transit.content}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
        
        <div className="card overflow-hidden border-transparent md:border-slate-200 dark:md:border-slate-800 bg-transparent md:bg-white dark:md:bg-slate-900 shadow-none md:shadow-sm">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Tedarikçi Firma</th>
                  <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">İletişim Bilgileri</th>
                  <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Kategoriler</th>
                  <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-right">Cari Bakiye</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] bg-surface dark:bg-transparent">
                {suppliers.map(s => {
                  const productCount = products.filter(p => p.supplierId === s.id).length;
                  return (
                    <tr key={s.id} onDoubleClick={() => setActiveSupplierId(s.id)} className="cursor-pointer hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-[#4f818c] group-hover:text-white transition-colors">
                          <Truck className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{s.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{s.contact} • {productCount} Ürün</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{s.phone}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {s.category.map(c => <Badge key={c} cat={c} />)}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <p className={`text-sm font-black ${s.balance < 0 ? "text-rose-600" : s.balance > 0 ? "text-emerald-600" : "text-slate-500"}`}>
                          {s.balance > 0 ? "+" : ""}{s.balance.toLocaleString("tr-TR")} ₺
                        </p>
                        <button onClick={() => { setEditingSupplier(s); setSupForm({ ...s }); setShowSupplierModal(true); }} className="text-xs font-bold text-[#4f818c] hover:text-[#3a616a] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit2 className="w-3 h-3" /> Düzenle
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MOBIL KART GORUNUMU (Tedarikçiler) */}
        <div className="md:hidden flex flex-col gap-3">
          {suppliers.map(s => {
            const productCount = products.filter(p => p.supplierId === s.id).length;
            return (
              <div 
                key={s.id} 
                onClick={() => setActiveSupplierId(s.id)}
                className="flex flex-col p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm cursor-pointer hover:border-[#4f818c] transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">{s.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{s.contact}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className={`text-lg font-black block ${s.balance < 0 ? "text-rose-600" : s.balance > 0 ? "text-emerald-600" : "text-slate-500"}`}>
                      {s.balance > 0 ? "+" : ""}{s.balance.toLocaleString("tr-TR")} ₺
                    </p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Cari Bakiye</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5 mb-3">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"><span className="text-xs text-slate-400 w-12">Tel:</span> {s.phone}</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 truncate"><span className="text-xs text-slate-400 w-12">E-posta:</span> {s.email}</p>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {s.category.map(c => <Badge key={c} cat={c} />)}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {productCount} Ürün
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button onClick={(e) => { e.stopPropagation(); setEditingSupplier(s); setSupForm({ ...s }); setShowSupplierModal(true); }} className="text-xs font-bold text-[#4f818c] bg-[#4f818c]/10 px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Edit2 className="w-3.5 h-3.5" /> Düzenle
                  </button>
                </div>
              </div>
            );
          })}
          {suppliers.length === 0 && (
            <div className="py-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 font-medium text-sm">Tedarikçi bulunamadı</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  };

  // ğŸ”²ğŸ”²ğŸ”² MODALLER ─────────────────────────────────────────────────────────────

  const renderProductModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-surface rounded-3xl shadow-2xl border border-[var(--border-color)] w-full max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-surface border-b border-[var(--border-color)] px-6 py-5 rounded-t-3xl flex items-center justify-between z-10">
          <h2 className="text-lg font-black text-foreground">{editingProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</h2>
          <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-rose-100 hover:text-rose-500 transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-5">
          {/* Kategori */}
          <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center text-xs">1</span>
              Kategori Seçimi
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.keys(categories).map(k => {
                const c = categories[k];
                return (
                  <button key={k} type="button" onClick={() => setForm(f => {
                    let newKdv = f.kdv;
                    if (["CAM", "CERCEVE", "KONTAKT"].includes(k)) newKdv = 10;
                    if (["GUNES", "AKSESUAR"].includes(k)) newKdv = 20;
                    return { ...f, category: k, kdv: newKdv };
                  })}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${form.category === k ? "border-[#4f818c] bg-[#4f818c]/10 text-[#4f818c] shadow-sm" : "border-slate-200 dark:border-slate-700 text-muted-foreground hover:border-slate-300 dark:hover:border-slate-600 bg-surface"}`}>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Temel Bilgiler */}
          <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center text-xs">2</span>
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Ürün Adı *</label>
                <input value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ürün adını girin..."
                  className="w-full px-4 py-3 bg-surface border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center justify-between">
                  <span>Seri Numarası</span>
                  <span className="text-[9px] font-medium text-slate-400 normal-case">(Barkod)</span>
                </label>
                <input value={form.barcode || ""} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} placeholder="Örn: 869..."
                  className="w-full px-4 py-3 bg-surface border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition font-mono" />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center justify-between">
                  <span>Marka *</span>
                </label>
                <input value={form.brand || ""} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="Marka"
                  className="w-full px-4 py-3 bg-surface border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center justify-between">
                  <span>Model</span>
                </label>
                <input value={form.model || ""} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="Model kodu"
                  className="w-full px-4 py-3 bg-surface border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
              </div>
            </div>
          </div>

          {/* Kategori-spesifik alanlar */}
          {(form.category === "CERCEVE" || form.category === "GUNES") && (
            <details className="group bg-violet-50/50 dark:bg-violet-500/5 border border-violet-100 dark:border-violet-800/30 rounded-2xl open:pb-4">
              <summary className="p-4 flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <h4 className="text-xs font-bold text-violet-600 uppercase tracking-wide">Çerçeve & Ürün Detayları</h4>
                <ChevronDown className="w-4 h-4 text-violet-600 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-4 grid grid-cols-3 gap-3">
                <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">Ekartman</label>
                  <input value={form.frame?.ekartman || ""} onChange={e => setForm(f => ({ ...f, frame: { ...(f.frame || {}), ekartman: e.target.value } }))} placeholder="54□18-140"
                    className="w-full px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition" /></div>
                <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">Materyal</label>
                  <input list="materyalList" value={form.frame?.materyal || ""} onChange={e => setForm(f => ({ ...f, frame: { ...(f.frame || {}), materyal: e.target.value } }))} placeholder="Seçin veya yazın"
                    className="w-full px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition" />
                  <datalist id="materyalList">{MATERYAL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}</datalist>
                </div>
                <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">Renk</label>
                  <input value={form.frame?.renk || ""} onChange={e => setForm(f => ({ ...f, frame: { ...(f.frame || {}), renk: e.target.value } }))} placeholder="Renk"
                    className="w-full px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none" /></div>
              </div>
            </details>
          )}

          {form.category === "CAM" && (
            <details className="group bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-800/30 rounded-2xl open:pb-4">
              <summary className="p-4 flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wide">Cam Detayları</h4>
                <ChevronDown className="w-4 h-4 text-blue-600 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-4 grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">İndeks</label>
                  <input list="indeksList" value={form.lens?.indeks || ""} onChange={e => setForm(f => ({ ...f, lens: { ...(f.lens || {}), indeks: e.target.value } }))} placeholder="Seçin veya yazın"
                    className="w-full px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition" />
                  <datalist id="indeksList">{INDEKS_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}</datalist>
                </div>
                <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">Kaplama</label>
                  <input list="kaplamaList" value={form.lens?.kaplama || ""} onChange={e => setForm(f => ({ ...f, lens: { ...(f.lens || {}), kaplama: e.target.value } }))} placeholder="Seçin veya yazın"
                    className="w-full px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition" />
                  <datalist id="kaplamaList">{KAPLAMA_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}</datalist>
                </div>
                <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">SPH (Küre)</label>
                  <input value={form.lens?.sph || ""} onChange={e => setForm(f => ({ ...f, lens: { ...(f.lens || {}), sph: e.target.value } }))} placeholder="-2.00"
                    className="w-full px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none" /></div>
                <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">CYL (Silindir)</label>
                  <input value={form.lens?.cyl || ""} onChange={e => setForm(f => ({ ...f, lens: { ...(f.lens || {}), cyl: e.target.value } }))} placeholder="-0.50"
                    className="w-full px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none" /></div>
                <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">AXIS (Aks)</label>
                  <input value={form.lens?.axis || ""} onChange={e => setForm(f => ({ ...f, lens: { ...(f.lens || {}), axis: e.target.value } }))} placeholder="90"
                    className="w-full px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none" /></div>
              </div>
            </details>
          )}

          {form.category === "KONTAKT" && (
            <details className="group bg-teal-50/50 dark:bg-teal-500/5 border border-teal-100 dark:border-teal-800/30 rounded-2xl open:pb-4">
              <summary className="p-4 flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wide">Kontakt Lens Detayları</h4>
                <ChevronDown className="w-4 h-4 text-teal-600 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-4 grid grid-cols-3 gap-3">
                {[["sph","SPH (Küre)","-2.00"],["cyl","CYL (Silindir)","-0.50"],["axis","AXIS (Aks)","90"],["bc","BC (Temel Eğri)","8.6"],["dia","DIA (Çap)","14.2"],["kutuAdet","Kutu Adedi","30"]].map(([k,l,ph]) => (
                  <div key={k}><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">{l}</label>
                    <input value={((form.contact || {}) as any)[k] || ""} onChange={e => setForm(f => ({ ...f, contact: { ...(f.contact || {}), [k]: k === "kutuAdet" ? +e.target.value : e.target.value } }))} placeholder={ph}
                      className="w-full px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none" /></div>
                ))}
                <div className="col-span-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-muted-foreground">Son Kullanma Tarihi Var Mı</label>
                    <button type="button" onClick={() => {
                        if(form.contact?.skt !== undefined) {
                           setForm(f => ({ ...f, contact: { ...(f.contact as ContactDetails), skt: undefined } as any }));
                        } else {
                           setForm(f => ({ ...f, contact: { ...(f.contact as ContactDetails), skt: "" } }));
                        }
                    }} className={`w-10 h-5 rounded-full p-0.5 transition-colors ${form.contact?.skt !== undefined ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}>
                      <div className={`w-4 h-4 bg-surface rounded-full shadow-sm transition-transform ${form.contact?.skt !== undefined ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  {form.contact?.skt !== undefined && (
                    <input type="date" value={form.contact?.skt || ""} onChange={e => setForm(f => ({ ...f, contact: { ...(f.contact as ContactDetails), skt: e.target.value } }))}
                      className="w-full px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
                  )}
                </div>
              </div>
            </details>
          )}

          {/* Fiyatlandırma ve Stok */}
          <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center text-xs">3</span>
              Fiyatlandırma & Stok
            </h3>
            
            {/* Fiyatlandırma */}
            <div className="mb-5">
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">Alış Fiyatı (₺)</label>
                  <input type="number" value={form.costPrice || ""} onChange={e => setForm(f => ({ ...f, costPrice: +e.target.value }))}
                    className="w-full px-3 py-2.5 bg-surface border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">Satış Fiyatı (₺)</label>
                  <input type="number" value={form.salePrice || ""} onChange={e => setForm(f => ({ ...f, salePrice: +e.target.value }))}
                    className="w-full px-3 py-2.5 bg-surface border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">
                    KDV (%)
                    <div className="relative group cursor-help">
                      <Info className="w-3 h-3 text-slate-400" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl text-center z-[500]">
                        KDV oranını manuel olarak girebilirsiniz. Kâr hesaplaması KDV'den bağımsız olarak yapılır.
                      </div>
                    </div>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
                    <input 
                      type="number" 
                      value={form.kdv || 20} 
                      onChange={e => setForm(f => ({ ...f, kdv: +e.target.value }))}
                      className="w-full pl-8 pr-3 py-2.5 bg-surface border border-[var(--border-color)] rounded-xl text-sm focus:outline-none" 
                    />
                  </div>
                </div>
              </div>
              
              {/* Kâr Miktarı Görüntüleme */}
              {form.salePrice && form.costPrice ? (
                (() => {
                  const profit = (form.salePrice || 0) - (form.costPrice || 0);
                  const margin = (form.costPrice || 0) > 0 ? Math.round((profit / form.costPrice) * 100) : 0;
                  const isProfit = profit >= 0;
                  return (
                    <div className={`mt-3 p-3 border rounded-xl flex justify-between items-center text-sm ${isProfit ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-800/30' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-800/30'}`}>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Net Kâr Miktarı:</span>
                      <span className={`font-black ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {profit > 0 ? '+' : ''}{profit.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺
                        {form.costPrice! > 0 && (
                          <span className={`text-xs ml-2 opacity-80`}>
                            ({profit > 0 ? '+' : ''}%{margin})
                          </span>
                        )}
                      </span>
                    </div>
                  )
                })()
              ) : null}
            </div>

            {/* Stok */}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">Başlangıç Stok</label>
                <input type="text" inputMode="numeric" pattern="[0-9]*" value={form.stock === 0 ? "" : (form.stock ?? "")} placeholder="0" onChange={e => setForm(f => ({ ...f, stock: e.target.value === "" ? 0 : parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2.5 bg-surface border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div>
                <label className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">
                  Kritik Stok Limiti
                  <div className="relative group cursor-help">
                    <Info className="w-3 h-3 text-slate-400" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl text-center z-[500]">
                      Stok bu sayının altına düştüğünde sistem size sipariş uyarısı verir.
                    </div>
                  </div>
                </label>
                <input type="text" inputMode="numeric" pattern="[0-9]*" value={form.criticalLimit === 0 ? "" : (form.criticalLimit ?? 5)} placeholder="5" onChange={e => setForm(f => ({ ...f, criticalLimit: e.target.value === "" ? 0 : parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2.5 bg-surface border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            </div>
          </div>
          {/* Diğer Bilgiler */}
          <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-900/50 text-orange-600 flex items-center justify-center text-xs">4</span>
              Diğer Bilgiler
            </h3>
            
            {/* Tedarikçi */}
            <div className="mb-4">
              <label className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">
                Tedarikçi
                <div className="relative group cursor-help">
                  <Info className="w-3 h-3 text-slate-400" />
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-[500]">
                    İsteğe bağlıdır. İsterseniz listeden bir tedarikçi seçebilir veya yeni bir isim yazabilirsiniz.
                  </div>
                </div>
              </label>
              <input 
                list="suppliersList"
              value={form.supplierId || ""} 
              onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))}
              placeholder="Tedarikçi adı yazın veya seçin..."
              className="w-full px-3 py-2.5 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" 
            />
            <datalist id="suppliersList">
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </datalist>
          </div>

          {/* Not */}
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">Not</label>
            <textarea value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="İsteğe bağlı not..."
              className="w-full px-3 py-2.5 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-foreground rounded-xl text-sm font-bold hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors">İptal</button>
            <button onClick={handleSaveProduct} className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-colors">
              {editingProduct ? "Güncelle" : "Ürünü Ekle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMovementModal = () => (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6" onClick={() => setShowMovementModal(false)}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/20 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
              <ArrowUpDown className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-200">Stok Hareketi Ekle</h2>
              <p className="text-xs font-medium text-slate-500">Sisteme yeni bir stok girişi veya çıkışı kaydedin</p>
            </div>
          </div>
          <button onClick={() => setShowMovementModal(false)} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:text-rose-500 transition-colors text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Ürün Seçimi */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-500" /> Ürün Seçimi <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input list="products-list" placeholder="Ürün Ara (İsim veya Barkod)" 
                     className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200"
                     onChange={e => {
                       const val = e.target.value;
                       const matched = products.find(p => p.name === val || p.barcode === val);
                       if(matched) setMovForm({...movForm, productId: matched.id});
                     }}
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <datalist id="products-list">
                {products.map(p => <option key={p.id} value={p.name}>{p.barcode}</option>)}
              </datalist>
            </div>
          </div>

          {/* Hareket Sebebi */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hareket Sebebi <span className="text-rose-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.entries(MOVEMENT_REASONS) as [MovementReason, any][]).map(([k,v]) => {
                const isSelected = movForm.reason === k;
                const isPositive = ["TEDARIKCIDEN_ALIM","IADE","SAYIM"].includes(k);
                
                return (
                  <button key={k} type="button" 
                    onClick={() => setMovForm(f => ({ ...f, reason: k, type: isPositive ? "GIRIS" : "CIKIS" }))}
                    className={`p-3 rounded-xl border-2 text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 text-center group ${
                      isSelected 
                        ? (isPositive ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-sm" : "border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 shadow-sm") 
                        : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/30 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-black transition-transform group-hover:scale-110 ${
                      isSelected 
                        ? (isPositive ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400")
                        : (isPositive ? "bg-slate-100 dark:bg-slate-800 text-emerald-500/50" : "bg-slate-100 dark:bg-slate-800 text-rose-500/50")
                    }`}>
                      {v.icon}
                    </span>
                    <span className="leading-tight">{v.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Miktar */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Miktar <span className="text-rose-500">*</span></label>
              <div className="relative">
                <input type="number" min={1} value={movForm.quantity} 
                  onChange={e => setMovForm(f => ({ ...f, quantity: Math.max(1, +e.target.value) }))}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200" />
                <Hash className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Not */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">İşlem Notu</label>
              <div className="relative">
                <input value={movForm.note} 
                  onChange={e => setMovForm(f => ({ ...f, note: e.target.value }))} 
                  placeholder="İsteğe bağlı not..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200" />
                <FileText className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Özet */}
          {movForm.productId && movForm.reason && (
            <div className={`p-4 rounded-xl border flex items-center justify-between ${movForm.type === "GIRIS" ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400"}`}>
              <div className="flex flex-col">
                <span className="text-xs font-medium opacity-80 uppercase tracking-wider">İşlem Özeti</span>
                <span className="font-bold text-base">{MOVEMENT_REASONS[movForm.reason].label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">{movForm.type === "GIRIS" ? "+" : "-"}{movForm.quantity}</span>
                <span className="text-sm font-bold opacity-80">Adet</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-800/20 rounded-b-3xl">
          <button onClick={() => setShowMovementModal(false)} className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm bg-white dark:bg-slate-900">
            İptal Et
          </button>
          <button onClick={handleSaveMovement} className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Hareketi Kaydet
          </button>
        </div>
      </div>
    </div>
  );

  const renderSupplierModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowSupplierModal(false)}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-surface rounded-3xl shadow-2xl border border-[var(--border-color)] w-full max-w-md max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-black text-foreground">{editingSupplier ? "Tedarikçi Düzenle" : "Yeni Tedarikçi"}</h2>
          <button onClick={() => setShowSupplierModal(false)} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-rose-100 hover:text-rose-500 transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          {[["name","Firma Adı *","Firma adı"],["contact","İlgili Kişi","Yetkili kişi"],["phone","Telefon","0212 555 00 00"],["email","E-posta","info@firma.com"]].map(([k,l,ph]) => (
            <div key={k}><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">{l}</label>
              <input value={(supForm as any)[k] || ""} onChange={e => setSupForm(f => ({ ...f, [k]: e.target.value }))} placeholder={ph}
                className="w-full px-3 py-2.5 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
          ))}
          <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(categories).map(k => (
                <button key={k} type="button" onClick={() => setSupForm(f => ({ ...f, category: (f.category || []).includes(k as any) ? (f.category || []).filter(c => c !== k) : [...(f.category||[]), k as any] }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${(supForm.category||[]).includes(k) ? "border-primary bg-primary/5 text-primary" : "border-slate-200 dark:border-slate-700 text-muted-foreground"}`}>
                  {categories[k].label}
                </button>
              ))}
            </div>
          </div>
          <div className="px-6 py-5 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button onClick={() => setShowSupplierModal(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">İptal</button>
            <button onClick={handleSaveSupplier} className="px-4 py-2 bg-[#4f818c] text-white rounded-xl text-sm font-bold hover:bg-[#3a616a] transition-colors">Kaydet</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── ANA RENDER ───────────────────────────────────────────────────────────

  
  
  
  const renderSettingsModal = () => {
    // Reset localCats when opening (optional, could be handled in setShowSettingsModal)
    // localCats and newCatLabel are now at top level

    const handleSave = () => {
      setCategories(localCats);
      setShowSettingsModal(false);
    };

    const handleAdd = () => {
      if(!newCatLabel) return;
      const key = newCatLabel.toUpperCase().replace(/[^A-Z0-9]/g, "_");
      setLocalCats(prev => ({
        ...prev,
        [key]: { label: newCatLabel, bg: "#4f818c", text: "#ffffff" }
      }));
      setNewCatLabel("");
    };

    const handleRemove = (k: string) => {
      const copy = { ...localCats };
      delete copy[k];
      setLocalCats(copy);
    };

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setShowSettingsModal(false)}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-surface rounded-3xl shadow-2xl border border-[var(--border-color)] w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
          <div className="px-6 py-5 border-b border-[var(--border-color)] flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <h2 className="text-lg font-black text-foreground">Ayarlar</h2>
            <button onClick={() => setShowSettingsModal(false)} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-rose-100 hover:text-rose-500 transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-6 overflow-y-auto space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Kategoriler</h3>
              <div className="space-y-2 mb-4">
                {Object.keys(localCats).map(k => (
                  <div key={k} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-background">
                    <input value={localCats[k].label} onChange={e => setLocalCats(prev => ({...prev, [k]: {...prev[k], label: e.target.value}}))} className="flex-1 bg-transparent px-2 py-1 text-sm font-bold outline-none" />
                    <input type="color" value={localCats[k].bg} onChange={e => setLocalCats(prev => ({...prev, [k]: {...prev[k], bg: e.target.value}}))} className="w-8 h-8 p-0 border-0 rounded cursor-pointer" />
                    <input type="color" value={localCats[k].text} onChange={e => setLocalCats(prev => ({...prev, [k]: {...prev[k], text: e.target.value}}))} className="w-8 h-8 p-0 border-0 rounded cursor-pointer" />
                    <button onClick={() => handleRemove(k)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)} placeholder="Yeni Kategori Adı" className="flex-1 px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none" />
                <button onClick={handleAdd} className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-sm font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors">Ekle</button>
              </div>
            </div>
          </div>
          <div className="p-5 border-t border-[var(--border-color)] bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
            <button onClick={() => setShowSettingsModal(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">İptal</button>
            <button onClick={handleSave} className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all">Kaydet</button>
          </div>
        </div>
      </div>
    );
  };

  const renderMovementDetailModal = () => {
    if (!selectedMovement) return null;
    const m = selectedMovement;
    const product = products.find(p => p.id === m.productId);
    const reason = MOVEMENT_REASONS[m.reason];
    const isIn = m.type === "GIRIS";

    const isPurchase = m.reason === "TEDARIKCIDEN_ALIM";
    const isSale = m.reason === "SATIS";
    const isDefect = m.reason === "FIRE" || m.reason === "DEFO";

    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" onClick={() => setShowMovementDetailModal(false)}>
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-200">İşlem Detayı</h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{m.date} - {m.staff}</p>
            </div>
            <button onClick={() => setShowMovementDetailModal(false)} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:text-rose-500 transition-colors text-slate-500 shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-start gap-4">
               <div className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-xl font-black text-xl border ${isIn ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-500' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-500'}`}>
                 {isIn ? "+" : "-"}{m.quantity}
               </div>
               <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{m.productName}</h3>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border mt-2 ${isIn ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-500' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-500'}`}>
                    {reason.label}
                  </span>
               </div>
            </div>

            {isPurchase && product && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">Birim Alış Fiyatı:</span>
                   <span className="font-bold text-slate-800 dark:text-slate-200">{product.costPrice.toLocaleString("tr-TR")} ₺</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">Toplam Tutar:</span>
                   <span className="font-bold text-slate-800 dark:text-slate-200">{(product.costPrice * m.quantity).toLocaleString("tr-TR")} ₺</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">Kargo Durumu:</span>
                   <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-900/30">Kargoda (Teslim Bekleniyor)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">Tedarikçi:</span>
                   <span className="font-medium text-slate-700 dark:text-slate-300">{suppliers.find(s=>s.id === product.supplierId)?.name || "-"}</span>
                </div>
              </div>
            )}

            {isSale && product && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">Maliyet:</span>
                   <span className="font-medium text-slate-600 dark:text-slate-400">{(product.costPrice * m.quantity).toLocaleString("tr-TR")} ₺</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">Normal Satış (Toplam):</span>
                   <span className="font-medium text-slate-600 dark:text-slate-400 line-through">{(product.salePrice * m.quantity).toLocaleString("tr-TR")} ₺</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">Uygulanan Satış Fiyatı:</span>
                   <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">{((product.salePrice * m.quantity) * 0.9).toLocaleString("tr-TR")} ₺</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">İndirim Oranı:</span>
                   <span className="font-bold text-rose-600 dark:text-rose-400">%10 İndirim</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-200 dark:border-slate-700">
                   <span className="text-slate-500 font-medium">Brüt Kar:</span>
                   <span className="font-black text-slate-800 dark:text-slate-200 text-base">{(((product.salePrice * m.quantity) * 0.9) - (product.costPrice * m.quantity)).toLocaleString("tr-TR")} ₺</span>
                </div>
              </div>
            )}

            {isDefect && (
              <div className="bg-rose-50 dark:bg-rose-500/5 p-4 rounded-xl border border-rose-100 dark:border-rose-500/20 space-y-3">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-rose-600/70 dark:text-rose-400/70 font-medium">Bildiren Personel:</span>
                   <span className="font-bold text-rose-800 dark:text-rose-300">{m.staff}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-rose-600/70 dark:text-rose-400/70 font-medium">Zarar:</span>
                   <span className="font-bold text-rose-800 dark:text-rose-300">{product ? (product.costPrice * m.quantity).toLocaleString("tr-TR") + " ₺" : "-"}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">İşlem Notu / Müşteri Bilgisi</label>
               <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 min-h-[60px]">
                 {m.note || "Herhangi bir not girilmemiş."}
               </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 rounded-b-2xl flex justify-end shrink-0">
            <button onClick={() => setShowMovementDetailModal(false)} className="px-6 py-2.5 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-sm text-sm">
              Kapat
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderOrderDetailsModal = () => {
    if (!showOrderDetailsModal) return null;
    const order = showOrderDetailsModal;
    
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowOrderDetailsModal(null)}>
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#1E293B] z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">Sipariş Detayı</h3>
                <p className="text-sm font-medium text-muted-foreground">{order.id} &bull; {order.date}</p>
              </div>
            </div>
            <button onClick={() => setShowOrderDetailsModal(null)} className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:text-rose-600 transition-colors text-muted-foreground"><X className="w-5 h-5" /></button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-muted-foreground mb-1">TUTAR</p>
                <p className="text-lg font-black text-foreground">{order.amount}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-muted-foreground mb-1">DURUM</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">{order.status}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 col-span-2">
                <p className="text-xs font-bold text-muted-foreground mb-1">ÜTS / SGK DURUMU</p>
                <div className="mt-1 flex items-center gap-2">
                  {order.utsStatus === 'ONAYLANDI' ? (
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> ÜTS Onaylı</span>
                  ) : order.utsStatus === 'BEKLIYOR' ? (
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1"><Clock className="w-4 h-4" /> ÜTS Onayı Bekliyor</span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1">Tıbbi Cihaz Değil</span>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-3">Sipariş İçeriği</h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 font-bold text-muted-foreground text-[11px] uppercase tracking-wider">Ürün</th>
                      <th className="px-4 py-3 font-bold text-muted-foreground text-[11px] uppercase tracking-wider text-right">Adet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {order.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-right font-bold">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {order.utsStatus === 'BEKLIYOR' && (
              <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> ÜTS Teslim Onayı Bekleniyor</h4>
                  <p className="text-sm text-indigo-700 dark:text-indigo-400/80 mt-1">Bu siparişteki tıbbi cihazların firmanıza devrini onaylamak için ÜTS'ye bildirim yapmanız gerekmektedir.</p>
                </div>
                <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                  <button onClick={() => {
                      toast.success("ÜTS Teslim Onayı verildi.");
                      setShowOrderDetailsModal({...order, utsStatus: 'ONAYLANDI'});
                    }} 
                    className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                  >
                    ÜTS'den Onayla
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDebtDetailsModal = () => {
    if (!showDebtDetailsModal) return null;
    const debt = showDebtDetailsModal;
    if(debt === true) return null; // fallback
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowDebtDetailsModal(null)}>
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Borç Detayı</h3>
              </div>
            </div>
            <button onClick={() => setShowDebtDetailsModal(null)} className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:text-rose-600 transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-6">
            <p className="text-center text-muted-foreground text-sm">Fatura No: <strong className="text-foreground">{debt.invoice}</strong></p>
            <p className="text-center text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">{debt.amount}</p>
            <p className="text-center text-sm font-bold text-muted-foreground mt-1">Son Ödeme: {debt.date}</p>
            
            <button onClick={() => {
              toast.success("Ödeme işlemi kaydedildi.");
              setShowDebtDetailsModal(null);
            }} className="w-full mt-6 px-4 py-3 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-md">
              Ödemeyi Gerçekleştir
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderDetailModal = () => {
    if(!selectedProduct) return null;
    const p = selectedProduct;
    const cat = categories[p.category] || { label: p.category, bg: "#888", text: "#fff" };
    const pMovements = movements.filter(m => m.productId === p.id);
    const kdvPrice = p.salePrice * (1 + (p.kdv||20)/100);
    const netProfit = (p.salePrice || 0) - (p.costPrice || 0);

    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative bg-surface rounded-3xl shadow-2xl border border-[var(--border-color)] w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="px-6 py-5 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">{p.name}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{p.brand} &bull; Barkod: {p.barcode}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setShowDetailModal(false); handleOpenEdit(p); }} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><Edit2 className="w-4 h-4" /> Düzenle</button>
              <button onClick={() => setShowDetailModal(false)} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-rose-100 hover:text-rose-500 transition-colors text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Stat Kartları */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">MEVCUT STOK</p>
                <p className="text-2xl font-black text-foreground">{p.stock} <span className="text-sm font-medium text-muted-foreground">Adet</span></p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">SATIŞ FİYATI</p>
                <p className="text-2xl font-black text-emerald-600">{p.salePrice.toLocaleString("tr-TR")} ₺</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">MALİYET</p>
                <p className="text-2xl font-black text-slate-700 dark:text-slate-200">{p.costPrice.toLocaleString("tr-TR")} ₺</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">KATEGORİ</p>
                <p className="text-lg font-black" style={{ color: cat.bg }}>{cat.label}</p>
              </div>
            </div>

            {/* Finans & Kar Detayları */}
            <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2"><Receipt className="w-4 h-4" /> Finansal Analiz</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-indigo-500/80 uppercase mb-1">Net Kar (KDV Hariç)</p>
                  <p className={`text-lg font-black ${netProfit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>{netProfit > 0 ? '+' : ''}{netProfit.toLocaleString("tr-TR")} ₺</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-500/80 uppercase mb-1">Kar Oranı</p>
                  <p className="text-lg font-black text-indigo-700 dark:text-indigo-400">%{(p.costPrice > 0 ? Math.round(netProfit/p.costPrice*100) : 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-500/80 uppercase mb-1">KDV Oranı</p>
                  <p className="text-lg font-black text-indigo-700 dark:text-indigo-400">%{p.kdv || 20}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-500/80 uppercase mb-1">KDV'li Satış Fiyatı</p>
                  <p className="text-lg font-black text-indigo-700 dark:text-indigo-400">{kdvPrice.toLocaleString("tr-TR")} ₺</p>
                </div>
              </div>
            </div>

            {/* Optik Detayları (Açılır/Kapanır) */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <button onClick={() => setOptikAcik(!optikAcik)} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> Ürün (Optik) Detayları</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{optikAcik ? 'Gizle' : 'Göster'}</span>
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors ${optikAcik ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${optikAcik ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
              </button>
              
              <div className={`transition-all duration-300 ease-in-out ${optikAcik ? 'max-h-96 border-t border-slate-200 dark:border-slate-700' : 'max-h-0'}`}>
                <div className="p-4 space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
                  {p.frame && (
                    <>
                      <div className="grid grid-cols-2 py-3">
                        <span className="text-sm text-slate-500">Ekartman</span>
                        <span className="text-sm font-bold text-foreground">{p.frame.ekartman || "-"}</span>
                      </div>
                      <div className="grid grid-cols-2 py-3">
                        <span className="text-sm text-slate-500">Materyal</span>
                        <span className="text-sm font-bold text-foreground">{p.frame.materyal || "-"}</span>
                      </div>
                      <div className="grid grid-cols-2 py-3">
                        <span className="text-sm text-slate-500">Renk</span>
                        <span className="text-sm font-bold text-foreground">{p.frame.renk || "-"}</span>
                      </div>
                    </>
                  )}
                  {p.lens && (
                    <>
                      <div className="grid grid-cols-2 py-3">
                        <span className="text-sm text-slate-500">Tasarım</span>
                        <span className="text-sm font-bold text-foreground">{p.lens.kaplama || "-"}</span>
                      </div>
                      <div className="grid grid-cols-2 py-3">
                        <span className="text-sm text-slate-500">İndeks</span>
                        <span className="text-sm font-bold text-foreground">{p.lens.indeks || "-"}</span>
                      </div>
                    </>
                  )}
                  {p.contact && (
                    <>
                      <div className="grid grid-cols-2 py-3">
                        <span className="text-sm text-slate-500">SPH / CYL / AXIS</span>
                        <span className="text-sm font-bold text-foreground">{p.contact.sph||"-"} / {p.contact.cyl||"-"} / {p.contact.axis||"-"}</span>
                      </div>
                      <div className="grid grid-cols-2 py-3">
                        <span className="text-sm text-slate-500">BC / DIA</span>
                        <span className="text-sm font-bold text-foreground">{p.contact.bc||"-"} / {p.contact.dia||"-"}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Ekstra Detaylar & Notlar */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2"><List className="w-4 h-4 text-primary" /> Sistem Bilgileri & Notlar</h3>
              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kritik Stok Uyarı Değeri</span>
                  <span className="text-sm font-bold text-amber-600">{p.criticalLimit} Adet</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tedarikçi Firma</span>
                  <span className="text-sm font-bold text-foreground">{getSupplierName(p.supplierId) || "Belirtilmemiş"}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ürün Notu</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{p.notes || "Herhangi bir not eklenmemiş."}</p>
                </div>
              </div>
            </div>

            {/* Stok Hareket Geçmişi */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2"><ArrowUpDown className="w-4 h-4 text-primary" /> Stok Hareket Geçmişi</h3>
              <div className="border border-[var(--border-color)] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
                    <tr>
                      <th className="px-4 py-2 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Tarih</th>
                      <th className="px-4 py-2 font-bold text-slate-500 text-[11px] uppercase tracking-wider">İşlem</th>
                      <th className="px-4 py-2 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Adet</th>
                      <th className="px-4 py-2 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Personel</th>
                      <th className="px-4 py-2 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Not</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)] bg-surface dark:bg-transparent">
                    {pMovements.length > 0 ? pMovements.map(m => {
                       const isIn = m.type === "GIRIS";
                       const reason = MOVEMENT_REASONS[m.reason] || { label: m.reason };
                       return (
                        <tr key={m.id} className="hover:bg-slate-50 dark:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 text-slate-500 font-medium">{m.date}</td>
                          <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${isIn ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400"}`}>{reason.label}</span></td>
                          <td className={`px-4 py-3 font-black ${isIn ? "text-emerald-600" : "text-rose-600"}`}>{isIn ? "+" : "-"}{m.quantity}</td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{m.staff}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{m.note || "—"}</td>
                        </tr>
                       )
                    }) : (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Bu ürüne ait stok hareketi bulunmuyor.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const renderSgkUts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">SGK / ÜTS Entegrasyon Paneli</h3>
          <p className="text-sm text-slate-500">Toptancıdan tarafınıza kesilen ve ÜTS'den düşümü yapılan ürünlerin onay ekranı.</p>
        </div>
        <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200">Bağlantı: Bekleniyor</span>
      </div>

      <div className="card overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
              <tr>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Tarih & Toptancı</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">İçerik (Ürünler)</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Durum</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] bg-surface dark:bg-transparent">
              {MOCK_SGK_TRANSFERS.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{t.sender}</div>
                    <div className="text-xs text-slate-500 mt-1">{t.date} • {t.id}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-2">
                      {t.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold">{item.quantity}</span>
                          <span className="font-medium">{item.productName}</span>
                          <span className="text-slate-400">({item.barcode})</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {t.status === "PENDING" ? (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold">Onay Bekliyor</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">Stoka Alındı</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {t.status === "PENDING" && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => alert("Ürünleri stoka almak için fiyat belirleme modalı açılacak.")} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm">Onayla</button>
                        <button className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors">Reddet</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBIL KART GORUNUMU (SGK/ÜTS) */}
        <div className="md:hidden flex flex-col gap-3 p-1">
          {MOCK_SGK_TRANSFERS.map(t => (
            <div key={t.id} className="flex flex-col p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">{t.sender}</h4>
                  <p className="text-xs text-slate-500 font-medium">{t.date} &bull; {t.id}</p>
                </div>
                <div className="flex-shrink-0">
                  {t.status === "PENDING" ? (
                    <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold">Onay Bekliyor</span>
                  ) : (
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold">Stoka Alındı</span>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 space-y-2 mb-3">
                {t.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shadow-sm">{item.quantity}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate flex-1">{item.productName}</span>
                  </div>
                ))}
              </div>
              
              {t.status === "PENDING" && (
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors">Reddet</button>
                  <button onClick={() => alert("Ürünleri stoka almak için fiyat belirleme modalı açılacak.")} className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm">Onayla</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => {
    return <InventorySettings />;
  };

  return (
    <div className="page-container space-y-6 ">
      {activeTab !== "LABELS" && activeTab !== "RAPID_SCAN" && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
              <Package className="w-7 h-7 text-primary" /> Stok Takibi
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Mağaza envanteri, kategori bazlı ürünler, tedarikçiler ve stok hareketleri
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab !== "SETTINGS" && (
              <div className="relative group">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Barkod, Ürün Adı, Marka Ara..."
                       className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-surface border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
            )}
            {activeTab === "INVENTORY" && (
              <>
                <button
                  onClick={() => { setEditingProduct(null); setForm({}); setShowAddModal(true); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Yeni Ürün</span>
                  <span className="sm:hidden">Ekle</span>
                </button>
              </>
            )}
            {activeTab === "SUPPLIERS" && !activeSupplierId && (
              <button
                onClick={() => { setEditingSupplier(null); setSupForm({ category: [], balance: 0 }); setShowSupplierModal(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Yeni Tedarikçi</span>
                <span className="sm:hidden">Ekle</span>
              </button>
            )}
            {activeTab !== "SETTINGS" && (
              <button onClick={() => router.push('?tab=SETTINGS')} className="w-10 h-10 rounded-xl bg-surface border border-[var(--border-color)] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary/50 transition-all"><Settings className="w-4 h-4" /></button>
            )}
          </div>
        </div>
      )}

      {!activeSupplierId && activeTab !== "SETTINGS" && activeTab !== "LABELS" && activeTab !== "RAPID_SCAN" && activeTab !== "SMART_ALERTS" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {(activeTab === "SUPPLIERS" ? [
            { label: "TOPLAM TEDARİKÇİ", value: suppliers.length, icon: Truck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-800/30", type: "SUPPLIERS_ALL", subtitle: "Aktif tedarikçiler" },
            { label: "TOPLAM BORÇ", value: "—", icon: TrendingDown, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-100 dark:border-rose-800/30", type: "SUPPLIERS_DEBT", subtitle: "Açık bakiye" },
            { label: "AYLIK ALIM", value: "—", icon: ArrowUpRight, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-800/30", type: "SUPPLIERS_MONTHLY", subtitle: "Bu ayki girişler" },
            { label: "ÖDEME BEKLEYEN", value: "—", icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-800/30", type: "SUPPLIERS_PENDING", subtitle: "Vadesi yaklaşan" },
          ] : [
            { label: "TOPLAM SKU", value: products.length, icon: Package, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-800/30", type: "ALL", subtitle: "Kayıtlı çeşit" },
            { label: "KRİTİK STOK", value: products.filter(p => p.stock <= p.criticalLimit && p.stock > 0).length, icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-800/30", type: "CRITICAL", subtitle: "Sınırın altında" },
            { label: "TÜKENENLER", value: products.filter(p => p.stock === 0).length, icon: X, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-100 dark:border-rose-800/30", type: "EMPTY", subtitle: "Stoğu biten" },
            { label: "STOK DEĞERİ", value: (products.reduce((acc, p) => acc + ((p.costPrice || 0) * p.stock), 0)).toLocaleString("tr-TR") + " ₺", icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-800/30", type: "VALUE", subtitle: "Maliyet üzerinden" },
          ]).map((stat, i) => (
            <div key={i} onClick={() => { 
                if(stat.type === "CRITICAL") { router.push("?tab=INVENTORY"); setFilterStock("CRITICAL"); } 
                else if(stat.type === "EMPTY") { router.push("?tab=INVENTORY"); setFilterStock("EMPTY"); } 
                else if(stat.type === "ALL") { router.push("?tab=INVENTORY"); setFilterStock("ALL"); }
                else if(stat.type.startsWith("SUPPLIERS")) { router.push("?tab=SUPPLIERS"); }
              }} 
                 className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group flex flex-col cursor-pointer">
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.bg.replace('bg-', 'from-').replace('/10', '/10').replace('/50', '/50')} to-transparent rounded-bl-full opacity-50 transition-transform group-hover:scale-110`}></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{stat.label}</h3>
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center border ${stat.border}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
          <p className="relative z-10 text-3xl font-black text-foreground">{stat.value}</p>
          <p className="relative z-10 text-xs font-medium mt-2 flex items-center gap-1 text-slate-500 dark:text-slate-400">
             {stat.subtitle}
          </p>
        </div>
          ))}
        </div>
      )}

      {activeTab === "INVENTORY" && renderInventory()}
      {activeTab === "MOVEMENTS" && renderMovements()}
      {activeTab === "SUPPLIERS" && renderSuppliers()}
      {activeTab === "SGK_UTS" && renderSgkUts()}
      {activeTab === "SETTINGS" && renderSettings()}
      {activeTab === "RAPID_SCAN" && <RapidScan products={products} />}
      {activeTab === "LABELS" && <LabelPrinter products={products} />}
      {activeTab === "SMART_ALERTS" && <SmartAlerts products={products} />}

      {showBulkModal && <BulkActionsPanel products={products} selectedItemIds={selectedItems} onClose={() => setShowBulkModal(false)} onComplete={() => {setShowBulkModal(false); window.location.reload();}} />}
      {showAddModal && renderProductModal()}
      {showMovementModal && renderMovementModal()}
      {showSupplierModal && renderSupplierModal()}
      {showSettingsModal && renderSettingsModal()}
      {showOrderDetailsModal && renderOrderDetailsModal()}
      {showDebtDetailsModal && renderDebtDetailsModal()}
      {showDetailModal && renderDetailModal()}
      {showMovementDetailModal && renderMovementDetailModal()}
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
             <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 flex items-center justify-center shrink-0">
                 <AlertTriangle className="w-6 h-6" />
               </div>
               <div>
                 <h2 className="text-xl font-black text-slate-800 dark:text-slate-200">Ürün(ler) Siliniyor</h2>
                 <p className="text-sm text-slate-500 mt-1">
                   {deleteTarget === "BULK" ? `${selectedItems.length} adet ürünü` : "Bu ürünü"} silmek üzeresiniz. Lütfen işlem türünü seçin:
                 </p>
               </div>
             </div>

             <div className="space-y-3 mb-6">
                <button 
                  onClick={() => setDeleteReason("SIL")}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${deleteReason === "SIL" ? "border-slate-800 bg-slate-50 dark:border-slate-200 dark:bg-slate-800" : "border-slate-200 dark:border-slate-700 opacity-70"}`}>
                   <h3 className="font-bold text-slate-800 dark:text-slate-200">Sadece Sistemden Sil</h3>
                   <p className="text-xs text-slate-500 mt-1">Ürün tamamen silinir. ÜTS bildirimi yapılmaz. Hatalı kayıtlar için önerilir.</p>
                </button>
                <button 
                  onClick={() => setDeleteReason("ZAYIAT")}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${deleteReason === "ZAYIAT" ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10" : "border-slate-200 dark:border-slate-700 opacity-70"}`}>
                   <h3 className="font-bold text-rose-700 dark:text-rose-400">Zayiat Bildirimi Yap (ÜTS)</h3>
                   <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-1">Kırılan / kaybolan ürünler için ÜTS'ye Zayiat Bildirimi olarak kuyruğa eklenir.</p>
                </button>
                <button 
                  onClick={() => setDeleteReason("IADE")}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${deleteReason === "IADE" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : "border-slate-200 dark:border-slate-700 opacity-70"}`}>
                   <h3 className="font-bold text-emerald-700 dark:text-emerald-400">Tedarikçiye İade (ÜTS)</h3>
                   <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">Tedarikçi iadesi olarak işaretlenir. ÜTS verme bildirimi için kuyruğa eklenir.</p>
                </button>
             </div>

             <div className="flex gap-3">
               <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Vazgeç</button>
               <button onClick={confirmDelete} className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors shadow-sm">
                 İşlemi Onayla
               </button>
             </div>
          </div>
        </div>
      )}
          <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanSuccess={handleQRScanSuccess}
      />
    </div>
  );
}
