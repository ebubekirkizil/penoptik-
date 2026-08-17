
"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Package, Plus, Search, Settings, AlertTriangle, ArrowUpDown, Truck, List,
  X, Edit2, Trash2, ChevronDown, ChevronRight, User, Filter, Barcode,
  CheckCircle, CheckCircle2, Circle, TrendingUp, TrendingDown, Clock, Eye,
  FileText, MoreHorizontal, RefreshCw, Download, Upload,
  ShieldCheck, Calendar, Info, Tag, Layers, Glasses,
  Wallet, Banknote, CreditCard, ArrowUpRight, Receipt, Hash
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

// ─── TİPLER ───────────────────────────────────────────────────────────────────

type Category = string; // Changed to dynamic string
type MovementType = "GIRIS" | "CIKIS";
type MovementReason = "TEDARIKCIDEN_ALIM" | "IADE" | "SAYIM" | "SATIS" | "FIRE" | "DEFO" | "TRANSFER";

interface FrameDetails {
  ekartman: string; // "54□18-140"
  materyal: string; // Kemik | Metal | Titanyum | Alaxım
  renk: string;
}
interface LensDetails {
  indeks: string;   // "1.56" | "1.60" | "1.67" | "1.74"
  kaplama: string;  // Antirefle | BlueControl | Fotokromik
  sph: string;
  cyl: string;
  axis: string;
}
interface ContactDetails {
  sph: string;
  cyl: string;
  axis: string;
  bc: string;   // Base Curve
  dia: string;  // Diameter
  kutuAdet: number;
  skt: string;  // Son Kullanma Tarihi
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

const MOCK_SUPPLIERS: Supplier[] = [
  { id: "s1", name: "Safilo Türkiye",    contact: "Ahmet Demir",   phone: "0212 555 01 01", email: "satis@safilo.com.tr",   category: ["CERCEVE"],           balance: -12500, notes: "Aylık ödeme anlaxması" },
  { id: "s2", name: "Essilor Türkiye",   contact: "Zeynep Kaya",   phone: "0216 444 02 02", email: "siparis@essilor.com.tr", category: ["CAM"],               balance: 3200,   notes: "15 gün vade" },
  { id: "s3", name: "CooperVision TR",   contact: "Mehmet Şahin",  phone: "0232 333 03 03", email: "lens@coopervision.tr",   category: ["KONTAKT"],           balance: -5800,  notes: "Haftalık teslimat" },
  { id: "s4", name: "Luxottica TR",      contact: "Elif Yıldız",   phone: "0312 222 04 04", email: "b2b@luxottica.com.tr",  category: ["CERCEVE","AKSESUAR"], balance: 0,      notes: "" },
];

const MOCK_PRODUCTS: Product[] = [
  // ÇERÇEVELER
  { id: "p1",  category: "CERCEVE", name: "Ray-Ban RB5154 Clubmaster",     brand: "Ray-Ban",   model: "RB5154",  barcode: "7891234001",  costPrice: 850,   salePrice: 2200,  kdv: 20, stock: 12, criticalLimit: 3,  supplierId: "s1", createdAt: "2026-01-15", frame: { ekartman: "51□21-145", materyal: "Kemik", renk: "Siyah/Altın" } },
  { id: "p2",  category: "CERCEVE", name: "Oakley OX8046 Holbrook",        brand: "Oakley",    model: "OX8046",  barcode: "7891234002",  costPrice: 720,   salePrice: 1800,  kdv: 20, stock: 8,  criticalLimit: 3,  supplierId: "s1", createdAt: "2026-01-20", frame: { ekartman: "54□18-138", materyal: "Metal",  renk: "Saten Çelik" } },
  { id: "p3",  category: "CERCEVE", name: "Silhouette Titan Minimal",      brand: "Silhouette",model: "5515",    barcode: "7891234003",  costPrice: 1800,  salePrice: 4500,  kdv: 20, stock: 5,  criticalLimit: 2,  supplierId: "s4", createdAt: "2026-02-01", frame: { ekartman: "49□16-140", materyal: "Titanyum", renk: "Mat Gümüx" } },
  { id: "p4",  category: "CERCEVE", name: "Tom Ford FT5634-B",             brand: "Tom Ford",  model: "FT5634",  barcode: "7891234004",  costPrice: 2200,  salePrice: 5800,  kdv: 20, stock: 3,  criticalLimit: 2,  supplierId: "s1", createdAt: "2026-02-10", frame: { ekartman: "52□19-145", materyal: "Alaxım",  renk: "Kahverengi" } },
  { id: "p5",  category: "CERCEVE", name: "Buz Mavisi Çerçeve (No Brand)", brand: "Generic",   model: "BM-01",   barcode: "8691234001",  costPrice: 150,   salePrice: 450,   kdv: 20, stock: 50, criticalLimit: 10, supplierId: "s4", createdAt: "2026-03-01", frame: { ekartman: "54□18-140", materyal: "Metal",  renk: "Buz Mavisi" } },
  // OPTİK CAMLAR
  { id: "p6",  category: "CAM",     name: "Varilux Comfort Max 1.67",      brand: "Essilor",   model: "VCM167",  barcode: "7892001001",  costPrice: 1800,  salePrice: 4800,  kdv: 20, stock: 20, criticalLimit: 5,  supplierId: "s2", createdAt: "2026-01-10", lens: { indeks: "1.67", kaplama: "Antirefle+UV", sph: "-2.00", cyl: "-0.50", axis: "90" } },
  { id: "p7",  category: "CAM",     name: "Zeiss SmartLife 1.60 AR",       brand: "Zeiss",     model: "ZSL160",  barcode: "7892001002",  costPrice: 2200,  salePrice: 6200,  kdv: 20, stock: 15, criticalLimit: 4,  supplierId: "s2", createdAt: "2026-01-12", lens: { indeks: "1.60", kaplama: "Antirefle",    sph: "-3.00", cyl: "0.00",  axis: "0"  } },
  { id: "p8",  category: "CAM",     name: "Hoya Hilux 1.56 BlueControl",   brand: "Hoya",      model: "HHB156",  barcode: "7892001003",  costPrice: 600,   salePrice: 1500,  kdv: 20, stock: 35, criticalLimit: 8,  supplierId: "s2", createdAt: "2026-02-05", lens: { indeks: "1.56", kaplama: "BlueControl",  sph: "+1.50", cyl: "-1.00", axis: "45" } },
  { id: "p9",  category: "CAM",     name: "Seiko Brilliance 1.74 Prizmex", brand: "Seiko",     model: "SBP174",  barcode: "7892001004",  costPrice: 3200,  salePrice: 8500,  kdv: 20, stock: 6,  criticalLimit: 2,  supplierId: "s2", createdAt: "2026-02-20", lens: { indeks: "1.74", kaplama: "Photochromic", sph: "-5.00", cyl: "-1.50", axis: "120"} },
  { id: "p10", category: "CAM",     name: "Nikon SeeMax Premium 1.60",     brand: "Nikon",     model: "NSP160",  barcode: "7892001005",  costPrice: 2800,  salePrice: 7200,  kdv: 20, stock: 2,  criticalLimit: 3,  supplierId: "s2", createdAt: "2026-03-01", lens: { indeks: "1.60", kaplama: "Antirefle+AR", sph: "-0.75", cyl: "-0.25", axis: "180"} },
  // KONTAKT LENSLER
  { id: "p11", category: "KONTAKT", name: "Acuvue Oasys 1-Day (-2.00)",    brand: "J&J",       model: "AO1D",    barcode: "7893001001",  costPrice: 180,   salePrice: 320,   kdv: 8,  stock: 45, criticalLimit: 10, supplierId: "s3", createdAt: "2026-01-05", contact: { sph: "-2.00", cyl: "0.00",  axis: "0",   bc: "8.5", dia: "14.3", kutuAdet: 30, skt: "2027-03-01" } },
  { id: "p12", category: "KONTAKT", name: "Bausch+Lomb Ultra Aylık",       brand: "B+L",       model: "BLU-M",   barcode: "7893001002",  costPrice: 150,   salePrice: 280,   kdv: 8,  stock: 28, criticalLimit: 8,  supplierId: "s3", createdAt: "2026-01-08", contact: { sph: "-3.50", cyl: "-0.75", axis: "90",  bc: "8.6", dia: "14.2", kutuAdet: 6,  skt: "2026-09-15" } },
  { id: "p13", category: "KONTAKT", name: "CooperVision Biofinity Toric",  brand: "CooperV",   model: "BFT",     barcode: "7893001003",  costPrice: 200,   salePrice: 380,   kdv: 8,  stock: 20, criticalLimit: 5,  supplierId: "s3", createdAt: "2026-02-01", contact: { sph: "-1.25", cyl: "-1.50", axis: "180",bc: "8.7", dia: "14.5", kutuAdet: 6,  skt: "2026-08-20" } },
  { id: "p14", category: "KONTAKT", name: "Alcon Dailies AquaComfort +",   brand: "Alcon",     model: "DAC30",   barcode: "7893001004",  costPrice: 120,   salePrice: 210,   kdv: 8,  stock: 60, criticalLimit: 15, supplierId: "s3", createdAt: "2026-02-10", contact: { sph: "+0.50", cyl: "0.00",  axis: "0",   bc: "8.7", dia: "14.0", kutuAdet: 30, skt: "2027-12-31" } },
  { id: "p15", category: "KONTAKT", name: "Sauflon Clariti Aylık Sph",     brand: "Sauflon",   model: "CLA-M",   barcode: "7893001005",  costPrice: 90,    salePrice: 170,   kdv: 8,  stock: 4,  criticalLimit: 8,  supplierId: "s3", createdAt: "2026-03-01", contact: { sph: "-4.00", cyl: "0.00",  axis: "0",   bc: "8.6", dia: "14.1", kutuAdet: 6,  skt: "2026-10-30" } },
  // AKSESUARLAR
  { id: "p16", category: "AKSESUAR", name: "Soflex Çok Amaçlı Solüsyon 360ml", brand: "Soflex",  model: "SOF360", barcode: "7894001001",  costPrice: 45,    salePrice: 120,   kdv: 8,  stock: 25, criticalLimit: 5,  supplierId: "s4", createdAt: "2026-01-01", },
  { id: "p17", category: "AKSESUAR", name: "Opti-Free PureMoist 300ml",         brand: "Alcon",   model: "OFPM",   barcode: "7894001002",  costPrice: 65,    salePrice: 180,   kdv: 8,  stock: 18, criticalLimit: 4,  supplierId: "s4", createdAt: "2026-01-01", },
  { id: "p18", category: "AKSESUAR", name: "Microfibra Gözlük Bezi (10lu)",     brand: "Generic", model: "MFB10",  barcode: "7894001003",  costPrice: 15,    salePrice: 45,    kdv: 20, stock: 80, criticalLimit: 20, supplierId: "s4", createdAt: "2026-01-01", },
  { id: "p19", category: "AKSESUAR", name: "Lens Kavisi Ölçüm Cetveli",         brand: "OPTool",  model: "LKC-1",  barcode: "7894001004",  costPrice: 35,    salePrice: 95,    kdv: 20, stock: 12, criticalLimit: 3,  supplierId: "s4", createdAt: "2026-02-01", },
];

const MOCK_MOVEMENTS: StockMovement[] = [
  { id: "m1", productId: "p1",  productName: "Ray-Ban RB5154 Clubmaster",    type: "GIRIS",  quantity: 5,  reason: "TEDARIKCIDEN_ALIM", note: "Şubat siparixi",           staff: "Admin",    date: "2026-07-01" },
  { id: "m2", productId: "p6",  productName: "Varilux Comfort Max 1.67",     type: "CIKIS",  quantity: 2,  reason: "SATIS",             note: "Müxteri: Ali Yılmaz",      staff: "Elif H.",  date: "2026-07-05" },
  { id: "m3", productId: "p12", productName: "Bausch+Lomb Ultra Aylık",      type: "CIKIS",  quantity: 1,  reason: "SATIS",             note: "Müxteri: Fatma Demir",     staff: "Admin",    date: "2026-07-08" },
  { id: "m4", productId: "p11", productName: "Acuvue Oasys 1-Day (-2.00)",  type: "GIRIS",  quantity: 10, reason: "TEDARIKCIDEN_ALIM", note: "CooperVision faturası",     staff: "Admin",    date: "2026-07-10" },
  { id: "m5", productId: "p3",  productName: "Silhouette Titan Minimal",     type: "CIKIS",  quantity: 1,  reason: "FIRE",              note: "Düxme nedeniyle kırıldı",  staff: "Ahmet K.", date: "2026-07-12" },
  { id: "m6", productId: "p8",  productName: "Hoya Hilux 1.56 BlueControl", type: "GIRIS",  quantity: 15, reason: "TEDARIKCIDEN_ALIM", note: "Essilor depo çıkıxı",      staff: "Admin",    date: "2026-07-15" },
  { id: "m7", productId: "p15", productName: "Sauflon Clariti Aylık Sph",   type: "CIKIS",  quantity: 2,  reason: "DEFO",              note: "Ambalaj hasarlı",          staff: "Elif H.",  date: "2026-07-18" },
  { id: "m8", productId: "p13", productName: "CooperVision Biofinity Toric", type: "CIKIS", quantity: 3,  reason: "SATIS",             note: "Müxteri: Mehmet Yıldız",   staff: "Admin",    date: "2026-07-20" },
];

// ─── SABİTLER ─────────────────────────────────────────────────────────────────


const MOVEMENT_REASONS: Record<MovementReason, { label: string; icon: string }> = {
  TEDARIKCIDEN_ALIM: { label: "Tedarikçiden Alım", icon: "+" },
  IADE:              { label: "Müxteri İadesi",     icon: "+" },
  SAYIM:             { label: "Stok Sayımı",        icon: "+" },
  SATIS:             { label: "Satıx Çıkıxı",       icon: "-" },
  FIRE:              { label: "Fire",               icon: "-" },
  DEFO:              { label: "Defolu Ürün",        icon: "-" },
  TRANSFER:          { label: "Şube Transferi",     icon: "-" },
};

const INDEKS_OPTIONS = ["1.50", "1.56", "1.60", "1.67", "1.74"];
const KAPLAMA_OPTIONS = ["Antirefle", "BlueControl", "Fotokromik (Transitions)", "UV400", "Antirefle+UV", "Antirefle+AR", "Çıplak (Kaplama Yok)"];
const MATERYAL_OPTIONS = ["Kemik (Asetat)", "Metal", "Titanyum", "Alaxım (Alloy)", "TR90 (Plastik)"];

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

  const [products, setProducts]   = useState<Product[]>(MOCK_PRODUCTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [movements, setMovements] = useState<StockMovement[]>(MOCK_MOVEMENTS);

  // Filters
  const [searchTerm, setSearchTerm]         = useState("");
  const [filterCategory, setFilterCategory] = useState<Category | "ALL">("ALL");
  const [filterSph, setFilterSph]           = useState("");
  const [filterCyl, setFilterCyl]           = useState("");
  const [filterStock, setFilterStock]       = useState<"ALL" | "CRITICAL" | "OK">("ALL");

  // Modal states
  const [showAddModal, setShowAddModal]         = useState(false);
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

  // Add/Edit Form
  
    const [form, setForm] = useState<Partial<Product>>({
    category: "CERCEVE", kdv: 20, stock: 0, criticalLimit: 5,
    costPrice: 0, salePrice: 0, frame: {}, lens: {}, contact: {},
  });

  // Dynamic Categories State
  const [categories, setCategories] = useState<Record<string, { label: string, bg: string, text: string }>>({
    CERCEVE: { label: "Çerçeve", bg: "#8b5cf6", text: "#ffffff" },
    GUNES:   { label: "Günex Gözlüğü", bg: "#f43f5e", text: "#ffffff" },
    CAM:     { label: "Optik Cam", bg: "#3b82f6", text: "#ffffff" },
    KONTAKT: { label: "Kontakt Lens", bg: "#14b8a6", text: "#ffffff" },
    AKSESUAR:{ label: "Aksesuar", bg: "#f59e0b", text: "#ffffff" },
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeSupplierId, setActiveSupplierId] = useState<string | null>(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState<any>(null);
  const [showDebtDetailsModal, setShowDebtDetailsModal] = useState<boolean>(false);
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
    return products.filter(p => {
      if (filterCategory !== "ALL" && p.category !== filterCategory) return false;
      if (filterStock === "CRITICAL" && p.stock > p.criticalLimit) return false;
      if (filterStock === "OK"       && p.stock <= p.criticalLimit) return false;
      if (filterSph && p.lens.sph !== filterSph && p.contact.sph !== filterSph) return false;
      if (filterCyl && p.lens.cyl !== filterCyl && p.contact.cyl !== filterCyl) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.barcode.includes(q) || p.brand.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, filterCategory, filterStock, filterSph, filterCyl, searchTerm]);

  const criticalProducts = useMemo(() =>
    products.filter(p => p.stock <= p.criticalLimit),
    [products]
  );

  // ─── HANDLERS ─────────────────────────────────────────────────────────────

  const handleSaveProduct = () => {
    if (!form.name || !form.brand) return;
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...form } as Product : p));
    } else {
      const newProduct: Product = {
        id: "p" + Date.now(), barcode: generateBarcode(form.category as Category),
        createdAt: new Date().toISOString().slice(0, 10),
        ...form
      } as Product;
      setProducts(prev => [...prev, newProduct]);
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
    setProducts(prev => prev.filter(p => p.id !== deleteTarget));
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
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
    <div className="animate-in fade-in duration-500">
      {/* Category Tabs (Like Siparixler) */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
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

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
              <tr>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Ürün</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Kategori</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Maliyet / Satıx</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-center">Stok</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-right">İxlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] bg-surface dark:bg-transparent">
              {filteredProducts.map(p => {
                const catStyle = categories[p.category] || { label: p.category, bg: "#888", text: "#fff" };
                const isCritical = p.stock <= p.criticalLimit;
                return (
                  <tr key={p.id} onClick={() => { setSelectedProduct(p); setShowDetailModal(true); }} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer">
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
                          <p className="text-sm font-semibold text-emerald-600">{p.salePrice.toLocaleString("tr-TR")}  </p>
                          <p className="text-xs text-slate-400">Mal: {p.costPrice.toLocaleString("tr-TR")}  </p>
                       </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                       <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${isCritical ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-700/50 text-amber-600 dark:text-amber-400' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300'}`}>
                          {p.stock} Adet
                       </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                       <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#4f818c] hover:text-[#3a616a]">
                          Detay <ChevronRight className="w-3.5 h-3.5" />
                       </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
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
      </div>
    </div>
  );


  
  const renderCritical = () => (
    <div className="animate-in fade-in duration-500 space-y-6">
      
      <div className="card overflow-hidden">
        <div className="bg-amber-50/50 dark:bg-amber-500/5 px-5 py-3 border-b border-amber-100 dark:border-amber-900/30">
          <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">Kritik Seviyedeki Stoklar</h4>
        </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Ürün</th>
                  <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Durum</th>
                  <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-right">Mevcut / Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] bg-surface dark:bg-transparent">
                {products.filter(p => p.stock <= (p.criticalLimit || 1)).sort((a,b) => (a.stock/(a.criticalLimit || 1)) - (b.stock/(b.criticalLimit || 1))).map(p => {
                  const limit = p.criticalLimit || 1;
                  const pct = Math.round((p.stock / limit) * 100);
                  const isZero = p.stock === 0;
                  return (
                    <tr key={p.id} onClick={() => { setSelectedProduct(p); setShowDetailModal(true); }} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${isZero ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{p.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{getSupplierName(p.supplierId)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 w-1/3">
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                          <div className={`h-2 rounded-full ${isZero ? "bg-rose-500" : "bg-amber-500"}`} style={{ width: `${Math.min(100, isNaN(pct) ? 0 : pct)}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{`${isNaN(pct) ? 0 : pct}% Dolu`}</p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className={`text-sm font-bold ${isZero ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>{p.stock} Adet</p>
                        <p className="text-xs text-slate-500 mt-0.5">Limit: {p.criticalLimit}</p>
                      </td>
                    </tr>
                  );
                })}
                {products.filter(p => p.stock <= p.criticalLimit).length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500 text-sm">Kritik stok seviyesinde ürün yok.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );


  
  const renderMovements = () => (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Tüm Stok Hareketleri</h3>
        <button onClick={() => setShowMovementModal(true)}
          className="px-4 py-2 bg-[#4f818c] hover:bg-[#3a616a] text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Hareket Ekle
        </button>
      </div>

      <div className="card overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Hareket Geçmixi</h4>
          <span className="text-xs font-medium text-slate-500 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">{movements.length} Kayıt</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Tarih</th>
                <th className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Ürün</th>
                <th className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Sebep</th>
                <th className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider text-center">Miktar</th>
                <th className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Not / Personel</th>
                <th className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider text-right">İxlem</th>
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
                          İxlem Detayı <ChevronRight className="w-3.5 h-3.5" />
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
      const inTransit = Math.floor(Math.random() * 5) + 1; // Fake data
      const totalPaid = Math.floor(Math.random() * 50000) + 10000; // Fake data
      
      return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setActiveSupplierId(null)} className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1">
              &larr; Geri Dön
            </button>
            <button 
              onClick={() => { setForm(f => ({...f, supplierId: s.id})); setEditingProduct(null); setShowAddModal(true); }}
              className="px-4 py-2 bg-[#4f818c] hover:bg-[#3a616a] text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Yeni Ürün Ekle
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div 
              onDoubleClick={() => {
                setSupForm({ ...s, isEditing: true });
                setShowSupplierModal(true);
              }}
              className="card p-5 border-l-4 border-[#4f818c] cursor-pointer hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">{s.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{s.contact} &bull; {s.phone}</p>
              <div className="flex gap-2 mt-3">{s.category.map(c => <Badge key={c} cat={c} />)}</div>
            </div>
            <div 
              onDoubleClick={() => setShowDebtDetailsModal(true)}
              className="card p-5 relative overflow-hidden cursor-pointer hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group"
            >
              <p className="text-xs text-slate-500 font-bold mb-1">Tedarikçiye Kalan Borç</p>
              <p className={`text-2xl font-black relative z-10 ${s.balance < 0 ? "text-rose-600" : s.balance > 0 ? "text-emerald-600" : "text-slate-700 dark:text-slate-300"}`}>
                {s.balance > 0 ? "+" : ""}{s.balance.toLocaleString("tr-TR")}  
              </p>
            </div>
            <div className="card p-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <p className="text-xs text-slate-500 font-bold mb-1">Bugüne Kadar Ödenen</p>
              <p className="text-2xl font-black text-slate-700 dark:text-slate-200">{totalPaid.toLocaleString("tr-TR")}  </p>
            </div>
            <div 
              onClick={() => setShowInTransitModal(true)}
              className="card p-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 flex items-center justify-between group cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <p className="text-xs text-amber-600 font-bold mb-1">Yolda Olan Siparix</p>
                <p className="text-2xl font-black text-amber-700">{inTransit} Paket</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-200/50 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Geçmix Siparixler (Son 5 İxlem)</h4>
                <button onClick={() => setShowAllOrdersModal(true)} className="text-xs font-bold text-[#4f818c] hover:text-[#3a616a] transition-colors px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">Tümünü Gör</button>
              </div>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
                      <tr>
                        <th className="px-5 py-3 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Tarih</th>
                        <th className="px-5 py-3 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Tutar</th>
                        <th className="px-5 py-3 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)] bg-surface dark:bg-transparent">
                      {[
                        { date: "12 Ağu 2026", amount: "12.500  ", status: "Teslim Edildi" },
                        { date: "05 Ağu 2026", amount: "8.250  ", status: "Teslim Edildi" },
                        { date: "28 Tem 2026", amount: "15.000  ", status: "Teslim Edildi" },
                        { date: "15 Tem 2026", amount: "4.750  ", status: "Teslim Edildi" },
                        { date: "01 Tem 2026", amount: "22.100  ", status: "Teslim Edildi" },
                      ].map((order, i) => (
                        <tr key={i} onDoubleClick={() => setShowOrderDetailsModal(order)} className="cursor-pointer hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/30 transition-colors group">
                          <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200 group-hover:text-[#4f818c] transition-colors">{order.date}</td>
                          <td className="px-5 py-3 font-semibold">{order.amount}</td>
                          <td className="px-5 py-3"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold">{order.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 mt-6">Bekleyen Ödemeler / Borçlar</h4>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
                      <tr>
                        <th className="px-5 py-3 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Son Ödeme Tarihi</th>
                        <th className="px-5 py-3 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Fatura / Tutar</th>
                        <th className="px-5 py-3 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)] bg-surface dark:bg-transparent">
                      {[
                        { date: "30 Ağu 2026", invoice: "INV-2026-081", amount: "8.000  ", status: "Beklemede" },
                        { date: "15 Eyl 2026", invoice: "INV-2026-079", amount: "4.500  ", status: "Beklemede" },
                      ].map((debt, i) => (
                        <tr key={i} onDoubleClick={() => { setShowInvoiceDetails(debt.invoice); setShowDebtDetailsModal(true); }} className="cursor-pointer hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/30 transition-colors group">
                          <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200 group-hover:text-[#4f818c] transition-colors">{debt.date}</td>
                          <td className="px-5 py-3">
                            <div className="flex flex-col group-hover:text-[#4f818c] transition-colors">
                              <span className="font-semibold">{debt.amount}</span>
                              <span className="text-xs text-slate-500 font-mono">{debt.invoice}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-bold">{debt.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3">Stoğu Biten Ürünler ({outOfStock.length})</h4>
                {outOfStock.length > 0 ? (
                  <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
                          <tr>
                            <th className="px-5 py-3 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Ürün</th>
                            <th className="px-5 py-3 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Barkod</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)] bg-surface dark:bg-transparent">
                          {outOfStock.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{p.name}</td>
                              <td className="px-5 py-3 text-slate-500">{p.barcode}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="card p-6 text-center text-slate-500 flex items-center justify-center">Stoğu biten ürün bulunmuyor.</div>
                )}
              </div>
              
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3">Kritik Stok Uyarıları</h4>
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
                        <tr>
                          <th className="px-5 py-3 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Ürün</th>
                          <th className="px-5 py-3 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-right">Kalan Stok</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)] bg-surface dark:bg-transparent">
                        {supplierProducts.filter(p => p.stock > 0 && p.stock <= p.criticalLimit).length > 0 ? (
                          supplierProducts.filter(p => p.stock > 0 && p.stock <= p.criticalLimit).map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{p.name}</td>
                              <td className="px-5 py-3 text-right">
                                <span className="px-2 py-1 bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 rounded-md text-xs font-bold">{p.stock} Adet</span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={2} className="px-5 py-6 text-center text-slate-500">Kritik seviyede ürün bulunmuyor.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3">Yolda Olan Siparixler ({inTransit})</h4>
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
                        <tr>
                          <th className="px-5 py-3 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Tahmini Varıx</th>
                          <th className="px-5 py-3 font-bold text-slate-500 text-[11px] uppercase tracking-wider">İçerik</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)] bg-surface dark:bg-transparent">
                        {[
                          { date: "Bugün", content: "Optik Çerçeve (50 Adet)" },
                          { date: "Yarın", content: "Kontakt Lens (120 Adet)" },
                          { date: "24 Ağu 2026", content: "Optik Cam (80 Adet)" },
                        ].map((transit, i) => (
                          <tr key={i} onDoubleClick={() => setShowInTransitModal(true)} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                            <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{transit.date}</td>
                            <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{transit.content}</td>
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
        <div className="flex justify-end mb-4">
          <button onClick={() => { setEditingSupplier(null); setSupForm({ category: [], balance: 0 }); setShowSupplierModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#4f818c] text-white hover:bg-[#3a616a] text-sm font-bold rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Yeni Tedarikçi Ekle
          </button>
        </div>
        
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Tedarikçi Firma</th>
                  <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">İletixim Bilgileri</th>
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
                          {s.balance > 0 ? "+" : ""}{s.balance.toLocaleString("tr-TR")}  
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
      </div>
    </div>
  );
  };

  // ğŸ”²ğŸ”²ğŸ”² MODALLER ─────────────────────────────────────────────────────────────

  const ProductModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-surface rounded-3xl shadow-2xl border border-[var(--border-color)] w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-surface border-b border-[var(--border-color)] px-6 py-5 rounded-t-3xl flex items-center justify-between">
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
                  <button key={k} type="button" onClick={() => setForm(f => ({ ...f, category: k }))}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Ürün Adı *</label>
                <input value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ürün adını girin..."
                  className="w-full px-4 py-3 bg-surface border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Marka *</label>
                <input value={form.brand || ""} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="Marka"
                  className="w-full px-4 py-3 bg-surface border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Model</label>
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
                  <input value={form.frame.ekartman || ""} onChange={e => setForm(f => ({ ...f, frame: { ...f.frame, ekartman: e.target.value } }))} placeholder="54□18-140"
                    className="w-full px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition" /></div>
                <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">Materyal</label>
                  <input list="materyalList" value={form.frame.materyal || ""} onChange={e => setForm(f => ({ ...f, frame: { ...f.frame, materyal: e.target.value } }))} placeholder="Seçin veya yazın"
                    className="w-full px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition" />
                  <datalist id="materyalList">{MATERYAL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}</datalist>
                </div>
                <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">Renk</label>
                  <input value={form.frame.renk || ""} onChange={e => setForm(f => ({ ...f, frame: { ...f.frame, renk: e.target.value } }))} placeholder="Renk"
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
                  <input list="indeksList" value={form.lens.indeks || ""} onChange={e => setForm(f => ({ ...f, lens: { ...f.lens, indeks: e.target.value } }))} placeholder="Seçin veya yazın"
                    className="w-full px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition" />
                  <datalist id="indeksList">{INDEKS_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}</datalist>
                </div>
                <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">Kaplama</label>
                  <input list="kaplamaList" value={form.lens.kaplama || ""} onChange={e => setForm(f => ({ ...f, lens: { ...f.lens, kaplama: e.target.value } }))} placeholder="Seçin veya yazın"
                    className="w-full px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition" />
                  <datalist id="kaplamaList">{KAPLAMA_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}</datalist>
                </div>
                <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">SPH (Küre)</label>
                  <input value={form.lens.sph || ""} onChange={e => setForm(f => ({ ...f, lens: { ...f.lens, sph: e.target.value } }))} placeholder="-2.00"
                    className="w-full px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none" /></div>
                <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">CYL (Silindir)</label>
                  <input value={form.lens.cyl || ""} onChange={e => setForm(f => ({ ...f, lens: { ...f.lens, cyl: e.target.value } }))} placeholder="-0.50"
                    className="w-full px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none" /></div>
                <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">AXIS (Aks)</label>
                  <input value={form.lens.axis || ""} onChange={e => setForm(f => ({ ...f, lens: { ...f.lens, axis: e.target.value } }))} placeholder="90"
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
                    <input value={(form.contact as any)[k] || ""} onChange={e => setForm(f => ({ ...f, contact: { ...f.contact, [k]: k === "kutuAdet" ? +e.target.value : e.target.value } }))} placeholder={ph}
                      className="w-full px-3 py-2 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none" /></div>
                ))}
                <div className="col-span-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-muted-foreground">Son Kullanma Tarihi Var Mı</label>
                    <button type="button" onClick={() => {
                        if(form.contact.skt !== undefined) {
                           setForm(f => ({ ...f, contact: { ...f.contact, skt: undefined } }));
                        } else {
                           setForm(f => ({ ...f, contact: { ...f.contact, skt: "" } }));
                        }
                    }} className={`w-10 h-5 rounded-full p-0.5 transition-colors ${form.contact.skt !== undefined ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}>
                      <div className={`w-4 h-4 bg-surface rounded-full shadow-sm transition-transform ${form.contact.skt !== undefined ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  {form.contact.skt !== undefined && (
                    <input type="date" value={form.contact.skt || ""} onChange={e => setForm(f => ({ ...f, contact: { ...f.contact, skt: e.target.value } }))}
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
                <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">Alıx Fiyatı ( )</label>
                  <input type="number" value={form.costPrice || ""} onChange={e => setForm(f => ({ ...f, costPrice: +e.target.value }))}
                    className="w-full px-3 py-2.5 bg-surface border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">Satıx Fiyatı ( )</label>
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
                        {profit > 0 ? '+' : ''}{profit.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}  
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
              <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">Baxlangıç Stok</label>
                <input type="number" value={form.stock || 0} onChange={e => setForm(f => ({ ...f, stock: +e.target.value }))}
                  className="w-full px-3 py-2.5 bg-surface border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div>
                <label className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">
                  Kritik Stok Limiti
                  <div className="relative group cursor-help">
                    <Info className="w-3 h-3 text-slate-400" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl text-center z-[500]">
                      Stok bu sayının altına düxtüğünde sistem size siparix uyarısı verir.
                    </div>
                  </div>
                </label>
                <input type="number" value={form.criticalLimit || 5} onChange={e => setForm(f => ({ ...f, criticalLimit: +e.target.value }))}
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

  const MovementModal = () => (
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
              <p className="text-xs font-medium text-slate-500">Sisteme yeni bir stok girixi veya çıkıxı kaydedin</p>
            </div>
          </div>
          <button onClick={() => setShowMovementModal(false)} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:text-rose-500 transition-colors text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">İxlem Notu</label>
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
                <span className="text-xs font-medium opacity-80 uppercase tracking-wider">İxlem Özeti</span>
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

  const SupplierModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowSupplierModal(false)}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-surface rounded-3xl shadow-2xl border border-[var(--border-color)] w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-black text-foreground">{editingSupplier ? "Tedarikçi Düzenle" : "Yeni Tedarikçi"}</h2>
          <button onClick={() => setShowSupplierModal(false)} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-rose-100 hover:text-rose-500 transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          {[["name","Firma Adı *","Firma adı"],["contact","İlgili Kixi","Yetkili kixi"],["phone","Telefon","0212 555 00 00"],["email","E-posta","info@firma.com"]].map(([k,l,ph]) => (
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

  
  
  
  const SettingsModal = () => {
    const [localCats, setLocalCats] = useState(categories);
    const [newCatLabel, setNewCatLabel] = useState("");
    
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
          <div className="p-6 overflow-y-auto space-y-6">
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

  const MovementDetailModal = () => {
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
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-200">İxlem Detayı</h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{m.date} - {m.staff}</p>
            </div>
            <button onClick={() => setShowMovementDetailModal(false)} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:text-rose-500 transition-colors text-slate-500 shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto space-y-6">
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
                   <span className="text-slate-500 font-medium">Birim Alıx Fiyatı:</span>
                   <span className="font-bold text-slate-800 dark:text-slate-200">{product.costPrice.toLocaleString("tr-TR")}  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">Toplam Tutar:</span>
                   <span className="font-bold text-slate-800 dark:text-slate-200">{(product.costPrice * m.quantity).toLocaleString("tr-TR")}  </span>
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
                   <span className="font-medium text-slate-600 dark:text-slate-400">{(product.costPrice * m.quantity).toLocaleString("tr-TR")}  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">Normal Satıx (Toplam):</span>
                   <span className="font-medium text-slate-600 dark:text-slate-400 line-through">{(product.salePrice * m.quantity).toLocaleString("tr-TR")}  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">Uygulanan Satıx Fiyatı:</span>
                   <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">{((product.salePrice * m.quantity) * 0.9).toLocaleString("tr-TR")}  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">İndirim Oranı:</span>
                   <span className="font-bold text-rose-600 dark:text-rose-400">%10 İndirim</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-200 dark:border-slate-700">
                   <span className="text-slate-500 font-medium">Brüt Kar:</span>
                   <span className="font-black text-slate-800 dark:text-slate-200 text-base">{(((product.salePrice * m.quantity) * 0.9) - (product.costPrice * m.quantity)).toLocaleString("tr-TR")}  </span>
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
                   <span className="font-bold text-rose-800 dark:text-rose-300">{product ? (product.costPrice * m.quantity).toLocaleString("tr-TR") + "  " : "-"}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">İxlem Notu / Müxteri Bilgisi</label>
               <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 min-h-[60px]">
                 {m.note || "Herhangi bir not girilmemix."}
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

  const DetailModal = () => {
    const [optikAcik, setOptikAcik] = useState(false);
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
                <p className="text-2xl font-black text-emerald-600">{p.salePrice.toLocaleString("tr-TR")}  </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">MALİYET</p>
                <p className="text-2xl font-black text-slate-700 dark:text-slate-200">{p.costPrice.toLocaleString("tr-TR")}  </p>
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
                  <p className={`text-lg font-black ${netProfit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>{netProfit > 0 ? '+' : ''}{netProfit.toLocaleString("tr-TR")}  </p>
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
                  <p className="text-[10px] font-bold text-indigo-500/80 uppercase mb-1">KDV'li Satıx Fiyatı</p>
                  <p className="text-lg font-black text-indigo-700 dark:text-indigo-400">{kdvPrice.toLocaleString("tr-TR")}  </p>
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
                        <span className="text-sm font-bold text-foreground">{p.lens.design || "-"}</span>
                      </div>
                      <div className="grid grid-cols-2 py-3">
                        <span className="text-sm text-slate-500">İndeks</span>
                        <span className="text-sm font-bold text-foreground">{p.lens.index || "-"}</span>
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
                  <span className="text-sm font-bold text-foreground">{getSupplierName(p.supplierId) || "Belirtilmemix"}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ürün Notu</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{p.notes || "Herhangi bir not eklenmemix."}</p>
                </div>
              </div>
            </div>

            {/* Stok Hareket Geçmixi */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2"><ArrowUpDown className="w-4 h-4 text-primary" /> Stok Hareket Geçmixi</h3>
              <div className="border border-[var(--border-color)] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
                    <tr>
                      <th className="px-4 py-2 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Tarih</th>
                      <th className="px-4 py-2 font-bold text-slate-500 text-[11px] uppercase tracking-wider">İxlem</th>
                      <th className="px-4 py-2 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Adet</th>
                      <th className="px-4 py-2 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Personel</th>
                      <th className="px-4 py-2 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Not</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)] bg-surface dark:bg-transparent">
                    {pMovements.length > 0 ? pMovements.map(m => {
                       const isIn = m.type === "GIRIS";
                       const reason = MOVEMENT_REASONS[m.reason];
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

  const renderSettings = () => {
    return (
      <div className="page-container animate-in fade-in slide-in-from-bottom-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Envanter ve Depo Ayarları
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl flex flex-col">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Genel Depo Ayarları</h3>
            <div className="space-y-5 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Kritik Stok Uyarısı</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Ürünler limitin altına düxtüğünde uyar</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Otomatik Tedarik Siparixi</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Kritik stokları taslak siparixe ekle</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Varsayılan KDV Oranı (%)</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="20">%20</option>
                  <option value="10">%10</option>
                  <option value="1">%1</option>
                  <option value="0">Muaf</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Stok Değerleme Yöntemi</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="FIFO">FIFO (İlk Giren İlk Çıkar)</option>
                  <option value="LIFO">LIFO (Son Giren İlk Çıkar)</option>
                  <option value="AVCO">Ağırlıklı Ortalama (AVCO)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Depo Sorumlusu (Ad Soyad)</label>
                <input type="text" placeholder="Örn: Ahmet Yılmaz" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
            <button className="w-full mt-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-bold transition-colors">
              Ayarları Kaydet
            </button>
          </div>
          
          <div className="card p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl flex flex-col">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Kategori Yönetimi</h3>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30 group">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">OPTIK_CERCEVE</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">Aktif</span>
                  <button className="text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"><Settings className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30 group">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                  <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">GUNES_GOZLUGU</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">Aktif</span>
                  <button className="text-slate-400 hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity"><Settings className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-100 dark:border-purple-900/30 group">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                  <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">OPTIK_CAM</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">Aktif</span>
                  <button className="text-slate-400 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"><Settings className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between bg-teal-50 dark:bg-teal-900/10 p-3 rounded-lg border border-teal-100 dark:border-teal-900/30 group">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
                  <span className="text-sm font-semibold text-teal-800 dark:text-teal-300">KONTAKT</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">Pasif</span>
                  <button className="text-slate-400 hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"><Settings className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
            <button onClick={() => alert("Yeni kategori ekleme modülü açılacak...")} className="w-full mt-4 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-500 hover:text-primary hover:border-primary/50 transition-colors">
              + Yeni Kategori Ekle
            </button>
          </div>

          <div className="card p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl flex flex-col">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Hareket Sebepleri Yönetimi</h3>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/10 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 group">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[13px] font-semibold text-emerald-800 dark:text-emerald-400">Tedarikçiden Alım</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-200/50 dark:bg-emerald-900/50 px-2 py-0.5 rounded">Girix</span>
                  <button className="text-slate-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"><Settings className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between bg-cyan-50 dark:bg-cyan-900/10 p-2.5 rounded-lg border border-cyan-100 dark:border-cyan-900/30 group">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500"></div>
                  <span className="text-[13px] font-semibold text-cyan-800 dark:text-cyan-400">Müxteriden İade</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-cyan-700 bg-cyan-200/50 dark:bg-cyan-900/50 px-2 py-0.5 rounded">Girix</span>
                  <button className="text-slate-400 hover:text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity"><Settings className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-900/10 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/30 group">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <span className="text-[13px] font-semibold text-rose-800 dark:text-rose-400">Satıx Çıkıxı</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-200/50 dark:bg-rose-900/50 px-2 py-0.5 rounded">Çıkıx 1</span>
                  <button className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"><Settings className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/10 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/30 group">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span className="text-[13px] font-semibold text-amber-800 dark:text-amber-400">Fire / Zayiat</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-200/50 dark:bg-amber-900/50 px-2 py-0.5 rounded">Çıkıx 2</span>
                  <button className="text-slate-400 hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity"><Settings className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between bg-fuchsia-50 dark:bg-fuchsia-900/10 p-2.5 rounded-lg border border-fuchsia-100 dark:border-fuchsia-900/30 group">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-fuchsia-500"></div>
                  <span className="text-[13px] font-semibold text-fuchsia-800 dark:text-fuchsia-400">Tedarikçiye İade</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-fuchsia-700 bg-fuchsia-200/50 dark:bg-fuchsia-900/50 px-2 py-0.5 rounded">Çıkıx 3</span>
                  <button className="text-slate-400 hover:text-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity"><Settings className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
            <button onClick={() => alert("Yeni hareket sebebi ekleme modülü açılacak...")} className="w-full mt-4 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-500 hover:text-primary hover:border-primary/50 transition-colors">
              + Yeni Sebep Ekle
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container space-y-6 animate-in fade-in duration-500">
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
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Barkod, Ürün Adı, Marka Ara..."
                   className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-surface border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
          </div>
          {activeTab !== "SETTINGS" && (
            <button onClick={() => router.push('?tab=SETTINGS')} className="w-10 h-10 rounded-xl bg-surface border border-[var(--border-color)] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary/50 transition-all"><Settings className="w-4 h-4" /></button>
          )}
        </div>
      </div>

      {!activeSupplierId && activeTab !== "SETTINGS" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {(activeTab === "SUPPLIERS" ? [
            { label: "TOPLAM TEDARİKÇİ", value: suppliers.length, icon: Truck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-800", gradient: "from-emerald-500/10 to-green-500/10", type: "SUPPLIERS_ALL", subtitle: "Sistemde kayıtlı aktif tedarikçi" },
            { label: "TOPLAM BORÇ", value: "124.500  ", icon: TrendingDown, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-100 dark:border-rose-800", gradient: "from-rose-500/10 to-red-500/10", type: "SUPPLIERS_DEBT", subtitle: "Tedarikçilere olan açık bakiye" },
            { label: "AYLIK ALIM", value: "85.200  ", icon: ArrowUpRight, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-800", gradient: "from-blue-500/10 to-indigo-500/10", type: "SUPPLIERS_MONTHLY", subtitle: "Bu ayki toplam fatura girixi" },
            { label: "ÖDEME BEKLEYEN", value: "3", icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-800", gradient: "from-amber-500/10 to-orange-500/10", type: "SUPPLIERS_PENDING", subtitle: "Vadesi yaklaxan ödemeler" },
          ] : [
            { label: "TOPLAM SKU", value: products.length, icon: Package, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-800", gradient: "from-blue-500/10 to-indigo-500/10", type: "ALL", subtitle: "Depodaki toplam çexit sayısı" },
            { label: "KRİTİK STOK", value: products.filter(p => p.stock <= p.criticalLimit && p.stock > 0).length, icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-800", gradient: "from-amber-500/10 to-orange-500/10", type: "CRITICAL", subtitle: "Sınırın altındaki ürünler" },
            { label: "TÜKENENLER", value: products.filter(p => p.stock === 0).length, icon: X, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-100 dark:border-rose-800", gradient: "from-rose-500/10 to-red-500/10", type: "EMPTY", subtitle: "Stoğu tamamen biten ürünler" },
            { label: "STOK DEĞERİ", value: (products.reduce((acc, p) => acc + ((p.costPrice || 0) * p.stock), 0)).toLocaleString("tr-TR") + "  ", icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-800", gradient: "from-emerald-500/10 to-green-500/10", type: "VALUE", subtitle: "Alıx fiyatı üzerinden maliyet" },
          ]).map((stat, i) => (
            <div key={i} onClick={() => { 
                if(stat.type === "CRITICAL") { router.push("?tab=INVENTORY"); setFilterStock("CRITICAL"); } 
                else if(stat.type === "EMPTY") { router.push("?tab=INVENTORY"); setFilterStock("EMPTY"); } 
                else if(stat.type === "ALL") { router.push("?tab=INVENTORY"); setFilterStock("ALL"); }
                else if(stat.type.startsWith("SUPPLIERS")) { router.push("?tab=SUPPLIERS"); }
              }} 
                 className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group flex flex-col cursor-pointer">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} rounded-bl-full opacity-50 transition-transform group-hover:scale-110`}></div>
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${stat.bg} ${stat.color} ${stat.border}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{stat.label}</h3>
              </div>
              <div className="mt-auto relative z-10">
                <div className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">{stat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "INVENTORY" && renderInventory()}
      {activeTab === "CRITICAL" && renderCritical()}
      {activeTab === "MOVEMENTS" && renderMovements()}
      {activeTab === "SUPPLIERS" && renderSuppliers()}
      {activeTab === "SETTINGS" && renderSettings()}

      {showAddModal && <ProductModal />}
      {showMovementModal && <MovementModal />}
      {showSupplierModal && <SupplierModal />}
      {showSettingsModal && <SettingsModal />}
      {showDetailModal && <DetailModal />}
      {showMovementDetailModal && <MovementDetailModal />}
    </div>
  );
}
