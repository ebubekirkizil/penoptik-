// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Loader2, Monitor, Sun, Moon, Palette, Shield, Copy, Crown, Server, Clock, HeartHandshake, Laptop, ClipboardList, Package } from "lucide-react";
import toast from "react-hot-toast";
import ThemeInjector, { ThemeColors } from "./ThemeInjector";
import StaffManagement from "./StaffManagement";
import DataManagementTab from "./DataManagementTab";

export const LIGHT_PRESETS = [
  { name: "Varsayılan (Optik Mavi)", colors: { primary: "#5c9ca8", secondary: "#c59b5d", background: "#e5e7eb", surface: "#ffffff", foreground: "#374151", mutedForeground: "#6b7280", border: "#d1d5db", chart1: "#5c9ca8", chart2: "#c59b5d", warning: "#f59e0b", success: "#10b981", danger: "#ef4444" } },
  { name: "Sıcak Kum (Bej)", colors: { primary: "#d97706", secondary: "#92400e", background: "#faf8f5", surface: "#ffffff", foreground: "#292524", mutedForeground: "#78716c", border: "#e7e5e4", chart1: "#d97706", chart2: "#92400e", warning: "#ea580c", success: "#65a30d", danger: "#dc2626" } },
  { name: "Minimalist (Siyah-Beyaz)", colors: { primary: "#111827", secondary: "#4b5563", background: "#f3f4f6", surface: "#ffffff", foreground: "#111827", mutedForeground: "#6b7280", border: "#d1d5db", chart1: "#374151", chart2: "#9ca3af", warning: "#f59e0b", success: "#10b981", danger: "#ef4444" } },
];

export const DARK_PRESETS = [
  { name: "Varsayılan (Gece Mavisi)", colors: { primary: "#7EACB5", secondary: "#F5E4C8", background: "#1B242A", surface: "#222e35", foreground: "#f1f5f9", mutedForeground: "#94a3b8", border: "#334155", chart1: "#7EACB5", chart2: "#F5E4C8", warning: "#fbbf24", success: "#34d399", danger: "#f87171" } },
  { name: "Koyu Orman (Yeşil)", colors: { primary: "#10b981", secondary: "#34d399", background: "#064e3b", surface: "#022c22", foreground: "#ecfdf5", mutedForeground: "#a7f3d0", border: "#065f46", chart1: "#10b981", chart2: "#34d399", warning: "#fcd34d", success: "#6ee7b7", danger: "#fca5a5" } },
  { name: "Yüksek Kontrast (Siyah)", colors: { primary: "#f59e0b", secondary: "#fcd34d", background: "#000000", surface: "#111827", foreground: "#ffffff", mutedForeground: "#9ca3af", border: "#374151", chart1: "#f59e0b", chart2: "#fcd34d", warning: "#fbbf24", success: "#34d399", danger: "#f87171" } },
];

export const DEFAULT_THEME: ThemeColors = {
  lightPrimary: "#5c9ca8",
  lightSecondary: "#c59b5d",
  lightBackground: "#e5e7eb",
  lightSurface: "#ffffff",
  lightForeground: "#374151",
  lightMutedForeground: "#6b7280",
  lightBorder: "#d1d5db",
  lightChart1: "#5c9ca8",
  lightChart2: "#c59b5d",
  lightWarning: "#f59e0b",
  lightSuccess: "#10b981",
  lightDanger: "#ef4444",

  lightRxUzakBg: "#eff6ff", lightRxUzakBorder: "#bfdbfe", lightRxUzakText: "#1d4ed8",
  lightRxYakinBg: "#fffbeb", lightRxYakinBorder: "#fde68a", lightRxYakinText: "#b45309",
  lightRxDaimiBg: "#ecfdf5", lightRxDaimiBorder: "#a7f3d0", lightRxDaimiText: "#047857",
  lightRxNotesBg: "#f8fafc", lightRxNotesBorder: "#e2e8f0", lightRxNotesText: "#475569",
  lightRxValueBg: "#ffffff", lightRxValueText: "#000000",
  
  darkPrimary: "#7EACB5",
  darkSecondary: "#F5E4C8",
  darkBackground: "#1B242A",
  darkSurface: "#222e35",
  darkForeground: "#f1f5f9",
  darkMutedForeground: "#94a3b8",
  darkBorder: "#334155",
  darkChart1: "#7EACB5",
  darkChart2: "#F5E4C8",
  darkWarning: "#fbbf24",
  darkSuccess: "#34d399",
  darkDanger: "#f87171",

  darkRxUzakBg: "#1e3a8a", darkRxUzakBorder: "#1e40af", darkRxUzakText: "#60a5fa",
  darkRxYakinBg: "#78350f", darkRxYakinBorder: "#92400e", darkRxYakinText: "#fbbf24",
  darkRxDaimiBg: "#064e3b", darkRxDaimiBorder: "#065f46", darkRxDaimiText: "#34d399",
  darkRxNotesBg: "#1e293b", darkRxNotesBorder: "#334155", darkRxNotesText: "#94a3b8",
  darkRxValueBg: "#0f172a", darkRxValueText: "#ffffff",
};

export type ScopeType = "admin" | "customer" | "login" | "landing";

export const STATUS_COLORS = [
  { name: "Sarı / Turuncu", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { name: "Mavi", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { name: "Yeşil", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { name: "Gri", color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20" },
  { name: "Kırmızı", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { name: "Mor", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { name: "Turkuaz", color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
];

const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(event.target?.result as string); // fallback
        }
      };
    };
  });
};

export default function SettingsForm() {
  const [tab, setTab] = useState<"system" | "theme" | "license" | "support" | "profile" | "staff" | "firm" | "statuses" | "data">("system");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);

  const [firmInfo, setFirmInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    logoUrl: "",
  });
  const [mapUrl, setMapUrl] = useState("");

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    role: "",
    password: "",
    passwordConfirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Drag-to-scroll için
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const [settings, setSettings] = useState({
    defaultTheme: "system",
    customerCanViewMeasurements: true,
    customerCanEditMeasurements: false,
    customerCanViewBalance: true,
    customerCanViewNotes: true,
    customerCanViewDoctorInfo: true,
    subscriptionPlan: "Temel Paket",
    subscriptionStatus: "Aktif",
    supportLevel: "Standart E-posta Desteği",
    hardwareSupport: false,
    subscriptionEndDate: null as string | null,
  });

  const [scope, setScope] = useState<ScopeType>("admin");
  const [themes, setThemes] = useState<{ [key in ScopeType]: ThemeColors }>({
    admin: { ...DEFAULT_THEME },
    customer: { ...DEFAULT_THEME },
    login: { ...DEFAULT_THEME },
    landing: { ...DEFAULT_THEME },
  });

  const [logoUsage, setLogoUsage] = useState({ system: true, print: true });

  const [orderStatuses, setOrderStatuses] = useState<any[]>([
    { id: "PENDING", label: "Bekleyen", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { id: "PREPARING", label: "Hazırlanıyor", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { id: "READY", label: "Teslime Hazır", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { id: "DELIVERED", label: "Teslim Edildi", color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20" }
  ]);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings", { cache: "no-store" }).then(res => res.json()),
      fetch("/api/auth/profile", { cache: "no-store" }).then(res => res.json())
    ])
      .then(([data, profileData]) => {
        setSettings({
          defaultTheme: data.defaultTheme ?? "system",
          customerCanViewMeasurements: data.customerCanViewMeasurements ?? true,
          customerCanEditMeasurements: data.customerCanEditMeasurements ?? false,
          customerCanViewBalance: data.customerCanViewBalance ?? true,
          customerCanViewNotes: data.customerCanViewNotes ?? true,
          customerCanViewDoctorInfo: data.customerCanViewDoctorInfo ?? true,
          subscriptionPlan: data.subscriptionPlan ?? "Temel Paket",
          subscriptionStatus: data.subscriptionStatus ?? "Aktif",
          supportLevel: data.supportLevel ?? "Standart E-posta Desteği",
          hardwareSupport: data.hardwareSupport ?? false,
          subscriptionEndDate: data.subscriptionEndDate ?? null,
        });

        if (data.orderStatusConfig) {
          try {
            const parsed = JSON.parse(data.orderStatusConfig);
            if (Array.isArray(parsed)) {
              setOrderStatuses(parsed);
            } else {
              // Backward compatibility for object map
              setOrderStatuses(Object.entries(parsed).map(([id, val]: [string, any]) => ({ id, ...val })));
            }
          } catch (e) {
            console.error("Order status parsing error", e);
          }
        }

        if (data.firm) {
          setFirmInfo({
            name: data.firm.name || "",
            email: data.firm.email || "",
            phone: data.firm.phone || "",
            address: data.firm.address || "",
            logoUrl: data.firm.logoUrl || "",
          });
        }

        if (profileData && !profileData.error) {
          setProfile({
            firstName: profileData.firstName || "",
            lastName: profileData.lastName || "",
            email: profileData.email || "",
            username: profileData.username || "",
            userCode: profileData.userCode || "",
            role: profileData.role || "",
            password: "",
            passwordConfirm: "",
          });
        }

        if (data.themeData && Object.keys(data.themeData).length > 0) {
          setThemes({
            admin: { ...DEFAULT_THEME, ...data.themeData.admin },
            customer: { ...DEFAULT_THEME, ...data.themeData.customer },
            login: { ...DEFAULT_THEME, ...data.themeData.login },
            landing: { ...DEFAULT_THEME, ...data.themeData.landing },
          });
          if (data.themeData.logoUsage) {
            setLogoUsage(data.themeData.logoUsage);
          }
          if (data.themeData.mapUrl) {
            setMapUrl(data.themeData.mapUrl);
          }
        } else {
          // Backward compatibility if themeData is empty but legacy colors exist
          const legacy = {
            lightPrimary: data.lightPrimary || DEFAULT_THEME.lightPrimary,
            lightSecondary: data.lightSecondary || DEFAULT_THEME.lightSecondary,
            lightBackground: data.lightBackground || DEFAULT_THEME.lightBackground,
            lightSurface: data.lightSurface || DEFAULT_THEME.lightSurface,
            lightForeground: data.lightForeground || DEFAULT_THEME.lightForeground,
            lightMutedForeground: data.lightMutedForeground || DEFAULT_THEME.lightMutedForeground,
            lightBorder: data.lightBorder || DEFAULT_THEME.lightBorder,
            lightChart1: data.lightChart1 || DEFAULT_THEME.lightChart1,
            lightChart2: data.lightChart2 || DEFAULT_THEME.lightChart2,
            lightWarning: data.lightWarning || DEFAULT_THEME.lightWarning,
            lightSuccess: data.lightSuccess || DEFAULT_THEME.lightSuccess,
            lightDanger: data.lightDanger || DEFAULT_THEME.lightDanger,

            lightRxUzakBg: data.lightRxUzakBg || DEFAULT_THEME.lightRxUzakBg,
            lightRxUzakBorder: data.lightRxUzakBorder || DEFAULT_THEME.lightRxUzakBorder,
            lightRxUzakText: data.lightRxUzakText || DEFAULT_THEME.lightRxUzakText,
            lightRxYakinBg: data.lightRxYakinBg || DEFAULT_THEME.lightRxYakinBg,
            lightRxYakinBorder: data.lightRxYakinBorder || DEFAULT_THEME.lightRxYakinBorder,
            lightRxYakinText: data.lightRxYakinText || DEFAULT_THEME.lightRxYakinText,
            lightRxDaimiBg: data.lightRxDaimiBg || DEFAULT_THEME.lightRxDaimiBg,
            lightRxDaimiBorder: data.lightRxDaimiBorder || DEFAULT_THEME.lightRxDaimiBorder,
            lightRxDaimiText: data.lightRxDaimiText || DEFAULT_THEME.lightRxDaimiText,
            lightRxNotesBg: data.lightRxNotesBg || DEFAULT_THEME.lightRxNotesBg,
            lightRxNotesBorder: data.lightRxNotesBorder || DEFAULT_THEME.lightRxNotesBorder,
            lightRxNotesText: data.lightRxNotesText || DEFAULT_THEME.lightRxNotesText,
            lightRxPdPhBg: data.lightRxPdPhBg || DEFAULT_THEME.lightRxPdPhBg,
            lightRxPdPhBorder: data.lightRxPdPhBorder || DEFAULT_THEME.lightRxPdPhBorder,
            lightRxPdPhText: data.lightRxPdPhText || DEFAULT_THEME.lightRxPdPhText,
            lightRxValueBg: data.lightRxValueBg || DEFAULT_THEME.lightRxValueBg,
            lightRxValueText: data.lightRxValueText || DEFAULT_THEME.lightRxValueText,
            
            darkPrimary: data.darkPrimary || DEFAULT_THEME.darkPrimary,
            darkSecondary: data.darkSecondary || DEFAULT_THEME.darkSecondary,
            darkBackground: data.darkBackground || DEFAULT_THEME.darkBackground,
            darkSurface: data.darkSurface || DEFAULT_THEME.darkSurface,
            darkForeground: data.darkForeground || DEFAULT_THEME.darkForeground,
            darkMutedForeground: data.darkMutedForeground || DEFAULT_THEME.darkMutedForeground,
            darkBorder: data.darkBorder || DEFAULT_THEME.darkBorder,
            darkChart1: data.darkChart1 || DEFAULT_THEME.darkChart1,
            darkChart2: data.darkChart2 || DEFAULT_THEME.darkChart2,
            darkWarning: data.darkWarning || DEFAULT_THEME.darkWarning,
            darkSuccess: data.darkSuccess || DEFAULT_THEME.darkSuccess,
            darkDanger: data.darkDanger || DEFAULT_THEME.darkDanger,

            darkRxUzakBg: data.darkRxUzakBg || DEFAULT_THEME.darkRxUzakBg,
            darkRxUzakBorder: data.darkRxUzakBorder || DEFAULT_THEME.darkRxUzakBorder,
            darkRxUzakText: data.darkRxUzakText || DEFAULT_THEME.darkRxUzakText,
            darkRxYakinBg: data.darkRxYakinBg || DEFAULT_THEME.darkRxYakinBg,
            darkRxYakinBorder: data.darkRxYakinBorder || DEFAULT_THEME.darkRxYakinBorder,
            darkRxYakinText: data.darkRxYakinText || DEFAULT_THEME.darkRxYakinText,
            darkRxDaimiBg: data.darkRxDaimiBg || DEFAULT_THEME.darkRxDaimiBg,
            darkRxDaimiBorder: data.darkRxDaimiBorder || DEFAULT_THEME.darkRxDaimiBorder,
            darkRxDaimiText: data.darkRxDaimiText || DEFAULT_THEME.darkRxDaimiText,
            darkRxNotesBg: data.darkRxNotesBg || DEFAULT_THEME.darkRxNotesBg,
            darkRxNotesBorder: data.darkRxNotesBorder || DEFAULT_THEME.darkRxNotesBorder,
            darkRxNotesText: data.darkRxNotesText || DEFAULT_THEME.darkRxNotesText,
            darkRxPdPhBg: data.darkRxPdPhBg || DEFAULT_THEME.darkRxPdPhBg,
            darkRxPdPhBorder: data.darkRxPdPhBorder || DEFAULT_THEME.darkRxPdPhBorder,
            darkRxPdPhText: data.darkRxPdPhText || DEFAULT_THEME.darkRxPdPhText,
            darkRxValueBg: data.darkRxValueBg || DEFAULT_THEME.darkRxValueBg,
            darkRxValueText: data.darkRxValueText || DEFAULT_THEME.darkRxValueText,
          };
          setThemes({
            admin: { ...legacy },
            customer: { ...legacy },
            login: { ...legacy },
            landing: { ...legacy }
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSystemChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (field: string, value: string) => {
    setThemes(prev => ({
      ...prev,
      [scope]: { ...prev[scope], [field]: value }
    }));
  };

  const applyPreset = (mode: "light" | "dark", presetIndex: number) => {
    const preset = mode === "light" ? LIGHT_PRESETS[presetIndex].colors : DARK_PRESETS[presetIndex].colors;
    const newColors = {
      [`${mode}Primary`]: preset.primary,
      [`${mode}Secondary`]: preset.secondary,
      [`${mode}Background`]: preset.background,
      [`${mode}Surface`]: preset.surface,
      [`${mode}Foreground`]: preset.foreground,
      [`${mode}MutedForeground`]: preset.mutedForeground,
      [`${mode}Border`]: preset.border,
      [`${mode}Chart1`]: preset.chart1,
      [`${mode}Chart2`]: preset.chart2,
      [`${mode}Warning`]: preset.warning,
      [`${mode}Success`]: preset.success,
      [`${mode}Danger`]: preset.danger,
    };
    
    setThemes(prev => ({
      ...prev,
      [scope]: { ...prev[scope], ...newColors }
    }));
  };

  const applyToAll = () => {
    const currentTheme = themes[scope];
    setThemes({
      admin: { ...currentTheme },
      customer: { ...currentTheme },
      login: { ...currentTheme },
      landing: { ...currentTheme }
    });
    toast.success("Seçili renkler diğer sayfalara kopyalandı!");
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const payload = {
        ...settings,
        themeData: { ...themes, logoUsage, mapUrl },
        orderStatusConfig: JSON.stringify(orderStatuses),
        firm: firmInfo,
      };

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Ayarlar kaydedilemedi");
      toast.success("Ayarlar başarıyla kaydedildi! Sayfa yenileniyor...");
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async () => {
    if (profile.password && profile.password !== profile.passwordConfirm) {
      toast.error("Şifreler birbiriyle uyuşmuyor!");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Profil güncellenemedi");
      toast.success("Profiliniz başarıyla güncellendi");
      setProfile(prev => ({ ...prev, password: "", passwordConfirm: "" }));
    } catch (e: any) {
      toast.error(e.message || "Bir hata oluştu");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentColors = themes[scope];

  return (
    <div className="bg-white dark:bg-surface shadow-sm rounded-3xl overflow-hidden border border-border-color relative">
      
      {/* CANLI ÖNİZLEME (LIVE PREVIEW) INJECTOR */}
      {/* Ayarlar sayfasında nerede olursak olalım, global değişkenleri ezen bir stil basıyoruz */}
      <ThemeInjector theme={currentColors} />

      {/* Tabs */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex border-b border-border-color overflow-x-auto scrollbar-hide whitespace-nowrap select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <button
          onClick={() => setTab("system")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 px-4 text-sm font-semibold transition-colors ${tab === "system" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Server className="w-4 h-4" /> Sistem İşleyişi
        </button>
        <button
          onClick={() => setTab("firm")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 px-4 text-sm font-semibold transition-colors ${tab === "firm" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Monitor className="w-4 h-4" /> Firma Bilgileri
        </button>
        <button
          onClick={() => setTab("statuses")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 px-4 text-sm font-semibold transition-colors ${tab === "statuses" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Package className="w-4 h-4" /> Sipariş Durumları
        </button>
        <button
          onClick={() => setTab("profile")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 px-4 text-sm font-semibold transition-colors ${tab === "profile" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Shield className="w-4 h-4" /> Profilim
        </button>
        <button
          onClick={() => setTab("theme")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 px-4 text-sm font-semibold transition-colors ${tab === "theme" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Palette className="w-4 h-4" /> Tema & Renkler
        </button>
        {profile.role === "FIRM_ADMIN" && (
          <button
            onClick={() => setTab("staff")}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 px-4 text-sm font-semibold transition-colors ${tab === "staff" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Shield className="w-4 h-4" /> Personel Yönetimi
          </button>
        )}
        <button
          onClick={() => setTab("license")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 px-4 text-sm font-semibold transition-colors ${tab === "license" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Crown className="w-4 h-4" /> Lisans & Abonelik
        </button>
        <button
          onClick={() => setTab("support")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 px-4 text-sm font-semibold transition-colors ${tab === "support" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <HeartHandshake className="w-4 h-4" /> Destek & İletişim
        </button>
        <button
          onClick={() => setTab("data")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 px-4 text-sm font-semibold transition-colors ${tab === "data" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <ClipboardList className="w-4 h-4" /> Veri Yönetimi
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {tab === "data" && <DataManagementTab />}
        {tab === "support" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-primary" /> İletişim & Destek Talebi
              </h3>
              <div className="bg-surface/30 border border-border-color p-6 rounded-2xl space-y-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Sentient Wire destek ekibine sistemle ilgili soru, talep veya hata bildiriminde bulunabilirsiniz.</p>
                <div className="space-y-4">
                  <input type="text" placeholder="Konu başlığı (Örn: Modül Talebi, Fatura Hatası...)" className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" />
                  <textarea rows={4} placeholder="Mesajınız ve detaylı açıklamanız..." className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none transition-colors"></textarea>
                  <button className="bg-primary text-primary-foreground font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-primary/20">Destek Talebi Gönder</button>
                </div>
              </div>
            </div>
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-primary text-xs">ℹ</div>
              <p className="text-xs text-muted-foreground leading-relaxed">Gönderdiğiniz tüm talepler, Mega Admin sistemimize anında iletilmektedir. Temsilcimiz en kısa sürede firmanızla iletişime geçecektir.</p>
            </div>
          </div>
        )}

        {tab === "staff" && profile.role === "FIRM_ADMIN" && (
          <StaffManagement />
        )}

        {tab === "profile" && (
          <div className="space-y-8 animate-fade-in max-w-2xl mx-auto w-full">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Profil ve Giriş Bilgileri
              </h3>
              <div className="bg-surface/30 border border-border-color p-6 rounded-2xl space-y-4 shadow-sm">
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Ad</label>
                      <input type="text" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Soyad</label>
                      <input type="text" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">E-posta</label>
                      <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Kullanıcı Adı (Opsiyonel)</label>
                      <input type="text" value={profile.username} onChange={e => setProfile({...profile, username: e.target.value})} className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Profil Kodu (Değiştirilemez)</label>
                    <input type="text" value={profile.userCode} disabled className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-sm opacity-50 cursor-not-allowed" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Yeni Şifre</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={profile.password} onChange={e => setProfile({...profile, password: e.target.value})} placeholder="Değiştirmek istemiyorsanız boş bırakın" className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Yeni Şifre (Tekrar)</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={profile.passwordConfirm} onChange={e => setProfile({...profile, passwordConfirm: e.target.value})} placeholder="Yeni Şifreyi Doğrulayın" className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors pr-10" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button onClick={saveProfile} disabled={savingProfile} className="bg-primary text-primary-foreground font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-primary/20 flex items-center gap-2">
                      {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Profili Güncelle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {tab === "firm" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-foreground">Firma Bilgileri</h3>
            <p className="text-sm text-muted-foreground">Sistem üzerinde görünecek kurumsal bilgilerinizi ayarlayın.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Firma Adı</label>
                <input
                  type="text"
                  value={firmInfo.name}
                  onChange={(e) => setFirmInfo({ ...firmInfo, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefon</label>
                <input
                  type="text"
                  value={firmInfo.phone}
                  onChange={(e) => setFirmInfo({ ...firmInfo, phone: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Adres (Görünen Metin)</label>
                <input
                  type="text"
                  placeholder="Batı Mah., İsmetpaşa Cad..."
                  value={firmInfo.address}
                  onChange={(e) => setFirmInfo({ ...firmInfo, address: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Adres Linki (Google Haritalar URL)</label>
                <input
                  type="url"
                  placeholder="https://maps.app.goo.gl/..."
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Firma Logosu</label>
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  {firmInfo.logoUrl && (
                    <div className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={firmInfo.logoUrl}
                        alt="Logo önizleme"
                        className="h-16 max-w-[160px] object-contain rounded-lg border border-border-color bg-white p-1"
                      />
                      <button
                        type="button"
                        onClick={() => setFirmInfo({ ...firmInfo, logoUrl: "" })}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                        title="Logoyu kaldır"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {/* Upload Button */}
                  <label className="flex-1 cursor-pointer">
                    <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border-color hover:border-primary/50 rounded-xl p-4 transition-colors bg-background hover:bg-primary/5">
                      <svg className="w-7 h-7 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-muted-foreground font-medium">
                        {firmInfo.logoUrl ? "Logoyu Değiştir" : "Logo Seç"}
                      </span>
                      <span className="text-xs text-muted-foreground">PNG, JPG, SVG — Otomatik küçültülür</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        try {
                          const base64 = await compressImage(file, 800, 800, 0.8);
                          setFirmInfo({ ...firmInfo, logoUrl: base64 });
                        } catch (err) {
                          toast.error("Görsel işlenirken hata oluştu.");
                        }
                      }}
                    />
                  </label>
                </div>
                
                <div className="mt-4 p-4 border border-border-color rounded-xl bg-surface space-y-3">
                  <label className="text-sm font-medium">Logonun Kullanılacağı Yerler</label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={logoUsage.system} 
                        onChange={(e) => setLogoUsage({ ...logoUsage, system: e.target.checked })} 
                        className="rounded border-gray-300 w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Sistem Genelinde (Menü, Profil)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={logoUsage.print} 
                        onChange={(e) => setLogoUsage({ ...logoUsage, print: e.target.checked })} 
                        className="rounded border-gray-300 w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Çıktılarda (Matbu Evrak / Sipariş Çıktısı)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        )}

        {tab === "statuses" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">Sipariş Durumları Özelleştirme</h3>
                <p className="text-sm text-muted-foreground mt-1">Müşteri ve sipariş ekranlarında gösterilecek durumları dinamik olarak ekleyebilir, silebilir ve sıralayabilirsiniz.</p>
              </div>
              <button
                onClick={() => {
                  const newId = `STATUS_${Date.now()}`;
                  setOrderStatuses([...orderStatuses, { id: newId, label: "Yeni Aşama", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" }]);
                  toast.success("Yeni aşama eklendi! Kaydetmek için en alttaki 'Ayarları Kaydet' butonuna basınız.");
                }}
                className="bg-primary/10 text-primary font-bold text-sm px-4 py-2 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                + Yeni Aşama Ekle
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {orderStatuses.map((status, index) => (
                <div key={status.id} className="bg-surface/30 p-5 rounded-2xl border border-border-color space-y-4 shadow-sm flex flex-col md:flex-row gap-6 items-start relative">
                  
                  {/* Sol Kısım: Sıra, Adı ve Aksiyonlar */}
                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs text-foreground">{index + 1}</span> 
                        . Aşama
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color} border ${status.border}`}>
                        {status.label}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-semibold">Durum İsmi</label>
                      <input 
                        type="text"
                        value={status.label}
                        onChange={(e) => {
                          const newStatuses = [...orderStatuses];
                          newStatuses[index].label = e.target.value;
                          setOrderStatuses(newStatuses);
                        }}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Sağ Kısım: Renk Teması Seçimi */}
                  <div className="w-full md:w-1/2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold">Renk Teması</label>
                      
                      {/* Üst Kısım Aksiyon Butonları (Sil / Sıra Değiştir) */}
                      <div className="flex items-center gap-2">
                        {index > 0 && (
                          <button 
                            onClick={() => {
                              const newStatuses = [...orderStatuses];
                              const temp = newStatuses[index - 1];
                              newStatuses[index - 1] = newStatuses[index];
                              newStatuses[index] = temp;
                              setOrderStatuses(newStatuses);
                            }}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface rounded-md transition-colors"
                            title="Yukarı Taşı"
                          >
                            ↑
                          </button>
                        )}
                        {index < orderStatuses.length - 1 && (
                          <button 
                            onClick={() => {
                              const newStatuses = [...orderStatuses];
                              const temp = newStatuses[index + 1];
                              newStatuses[index + 1] = newStatuses[index];
                              newStatuses[index] = temp;
                              setOrderStatuses(newStatuses);
                            }}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface rounded-md transition-colors"
                            title="Aşağı Taşı"
                          >
                            ↓
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            if (orderStatuses.length <= 1) {
                              toast.error("En az bir aşama bulunmalıdır.");
                              return;
                            }
                            if (confirm(`"${status.label}" aşamasını silmek istediğinize emin misiniz? Bu aşamada olan siparişler otomatik olarak en yakın aşamaya aktarılacaktır.`)) {
                              const newStatuses = orderStatuses.filter((_, i) => i !== index);
                              setOrderStatuses(newStatuses);
                              toast.success("Aşama listeden çıkarıldı! Değişiklikleri uygulamak için 'Ayarları Kaydet' butonuna basınız.");
                            }
                          }}
                          className="p-1.5 text-danger hover:text-white hover:bg-danger rounded-md transition-colors ml-2 font-semibold text-xs"
                          title="Sil"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {STATUS_COLORS.map(c => (
                        <button 
                          key={c.name}
                          onClick={() => {
                            const newStatuses = [...orderStatuses];
                            newStatuses[index].color = c.color;
                            newStatuses[index].bg = c.bg;
                            newStatuses[index].border = c.border;
                            setOrderStatuses(newStatuses);
                          }}
                          className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${status.color === c.color ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent'} ${c.bg} ${c.color} flex items-center justify-center text-[10px] font-bold`}
                          title={c.name}
                        >
                          {status.color === c.color && "✓"}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                </div>
              ))}
              
              {orderStatuses.length === 0 && (
                <div className="text-center p-8 bg-surface/50 border border-dashed border-border-color rounded-2xl">
                  <p className="text-muted-foreground">Hiç sipariş aşaması bulunmuyor. Lütfen yeni aşama ekleyin.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {tab === "system" && (
          <div className="space-y-8 animate-fade-in">
            {/* Theme Preference */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                <Monitor className="w-4 h-4 text-primary" /> Varsayılan Açılış Teması
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "light", label: "Aydınlık Mod", icon: <Sun className="w-5 h-5" /> },
                  { id: "dark", label: "Koyu Mod", icon: <Moon className="w-5 h-5" /> },
                  { id: "system", label: "Cihaz Teması", icon: <Monitor className="w-5 h-5" /> },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleSystemChange("defaultTheme", t.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${settings.defaultTheme === t.id ? "border-primary bg-primary/5 text-primary" : "border-border-color text-muted-foreground hover:border-primary/40 hover:bg-surface/50"}`}
                  >
                    {t.icon}
                    <span className="font-semibold text-sm">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-border-color" />

            {/* Permissions */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Müşteri Paneli Yetkileri
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-2xl border border-border-color bg-surface/30 hover:bg-surface/50 transition-colors cursor-pointer">
                  <div>
                    <p className="font-bold text-foreground text-sm">Göz Ölçümlerini Görüntüleme</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Müşteriler takip sayfasında kendi reçete ölçümlerini görebilirler.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.customerCanViewMeasurements}
                    onChange={(e) => handleSystemChange("customerCanViewMeasurements", e.target.checked)}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                </label>
                
                <label className="flex items-center justify-between p-4 rounded-2xl border border-border-color bg-surface/30 hover:bg-surface/50 transition-colors cursor-pointer">
                  <div>
                    <p className="font-bold text-foreground text-sm flex items-center gap-2">
                      Göz Ölçümlerini Düzenleme
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Müşteri kendi gözlük numarasını güncelleyebilir. (Revizyon onayınıza düşer).</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.customerCanEditMeasurements}
                    onChange={(e) => handleSystemChange("customerCanEditMeasurements", e.target.checked)}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl border border-border-color bg-surface/30 hover:bg-surface/50 transition-colors cursor-pointer">
                  <div>
                    <p className="font-bold text-foreground text-sm flex items-center gap-2">
                      Kalan Ödeme (Borç) Görüntüleme
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Müşteriler, takip sayfasında size olan kalan toplam ödemesini/borcunu görebilirler.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.customerCanViewBalance}
                    onChange={(e) => handleSystemChange("customerCanViewBalance", e.target.checked)}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl border border-border-color bg-surface/30 hover:bg-surface/50 transition-colors cursor-pointer">
                  <div>
                    <p className="font-bold text-foreground text-sm flex items-center gap-2">
                      Açıklama / Muayene Notu Gösterimi
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Müşteriler, ölçümlere ait özel muayene notlarını ve açıklamaları görebilir.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.customerCanViewNotes}
                    onChange={(e) => handleSystemChange("customerCanViewNotes", e.target.checked)}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl border border-border-color bg-surface/30 hover:bg-surface/50 transition-colors cursor-pointer">
                  <div>
                    <p className="font-bold text-foreground text-sm flex items-center gap-2">
                      Doktor ve Hastane Bilgisi Gösterimi
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Müşteriler, ölçümü yapan doktor ve hastane bilgisini görebilir.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.customerCanViewDoctorInfo}
                    onChange={(e) => handleSystemChange("customerCanViewDoctorInfo", e.target.checked)}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
                  <div>
                    <p className="font-bold text-foreground text-sm flex items-center gap-2">
                      🤖 Yapay Zeka Asistanı (Pen AI Bot & Reçete OCR)
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Sistemde sağ alt köşedeki akıllı yüzen AI botunun ve kamera ile reçete tarama özelliğinin aktifliği.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.isAiBotActive ?? true}
                    onChange={(e) => handleSystemChange("isAiBotActive", e.target.checked)}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <hr className="border-border-color" />

            {/* Sunucu & IP Bilgisi */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-primary" /> Sunucu IP & Resmi Entegrasyon Bilgileri
              </h3>
              <div className="bg-surface/30 border border-border-color p-5 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-background border border-border-color rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sabit Sunucu IP Adresi (SGK / Bakanlık / Whitelist)</p>
                    <p className="text-xl font-black text-primary font-mono mt-1">185.22.185.235</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText("185.22.185.235"); toast.success("IP Adresi Kopyalandı: 185.22.185.235"); }}
                    className="px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-bold transition-colors flex items-center gap-2 self-start sm:self-center"
                  >
                    <Copy className="w-4 h-4" /> IP Adresini Kopyala
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  İl Sağlık Müdürlüğü, SGK veya özel entegratör denetimlerinde firmanıza ait yazılım sunucu IP adresi istendiğinde yukarıdaki <span className="font-mono font-bold text-foreground">185.22.185.235</span> adresini bildirebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "theme" && (
          <div className="space-y-8 animate-fade-in">
            {/* Scope Switcher */}
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Özelleştirilecek Sayfayı Seçin</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "admin", label: "Admin Paneli" },
                  { id: "customer", label: "Müşteri Takip Ekranı" },
                  { id: "landing", label: "Ana Sayfa (Landing)" },
                  { id: "login", label: "Giriş/Kayıt Sayfaları" },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setScope(s.id as ScopeType)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${scope === s.id ? "border-primary bg-primary/10 text-primary" : "border-border-color text-muted-foreground hover:border-primary/50 hover:bg-surface/50"}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground italic">Şu anda <strong>{scope === 'admin' ? 'Admin Paneli' : scope === 'customer' ? 'Müşteri Ekranı' : scope === 'landing' ? 'Ana Sayfa' : 'Giriş Sayfaları'}</strong> renklerini düzenliyorsunuz.</p>
                <button onClick={applyToAll} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  <Copy className="w-3 h-3" /> Tüm sayfalara uygula
                </button>
              </div>
            </div>

            {/* Light Mode Colors */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" /> Aydınlık Mod Renkleri
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {LIGHT_PRESETS.map((preset, idx) => (
                  <button key={idx} onClick={() => applyPreset("light", idx)} className="p-3 text-left border border-border-color rounded-xl hover:border-primary/50 transition-all group">
                    <p className="text-xs font-bold text-foreground mb-2 group-hover:text-primary">{preset.name}</p>
                    <div className="flex h-6 rounded-lg overflow-hidden border border-border-color/50">
                      <div className="flex-1" style={{ backgroundColor: preset.colors.primary }}></div>
                      <div className="flex-1" style={{ backgroundColor: preset.colors.background }}></div>
                      <div className="flex-1" style={{ backgroundColor: preset.colors.surface }}></div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-border-color rounded-xl bg-slate-50 dark:bg-surface/20">
                <ColorPicker label="Ana Vurgu Rengi" value={currentColors.lightPrimary || ""} onChange={(v) => handleColorChange("lightPrimary", v)} />
                <ColorPicker label="İkincil Vurgu" value={currentColors.lightSecondary || ""} onChange={(v) => handleColorChange("lightSecondary", v)} />
                <ColorPicker label="Ana Arka Plan" value={currentColors.lightBackground || ""} onChange={(v) => handleColorChange("lightBackground", v)} />
                <ColorPicker label="Kart (Kutu) Zemini" value={currentColors.lightSurface || ""} onChange={(v) => handleColorChange("lightSurface", v)} />
                
                <ColorPicker label="Ana Metin Rengi" value={currentColors.lightForeground || ""} onChange={(v) => handleColorChange("lightForeground", v)} />
                <ColorPicker label="Soluk Metin Rengi" value={currentColors.lightMutedForeground || ""} onChange={(v) => handleColorChange("lightMutedForeground", v)} />
                <ColorPicker label="Çerçeve / Çizgi Rengi" value={currentColors.lightBorder || ""} onChange={(v) => handleColorChange("lightBorder", v)} />

                <ColorPicker label="Grafik 1 (İşletme)" value={currentColors.lightChart1 || ""} onChange={(v) => handleColorChange("lightChart1", v)} />
                <ColorPicker label="Grafik 2 (Müşteri)" value={currentColors.lightChart2 || ""} onChange={(v) => handleColorChange("lightChart2", v)} />
                <ColorPicker label="Uyarı (Doğrulama)" value={currentColors.lightWarning || ""} onChange={(v) => handleColorChange("lightWarning", v)} />
                <ColorPicker label="Başarı (Onay)" value={currentColors.lightSuccess || ""} onChange={(v) => handleColorChange("lightSuccess", v)} />
                <ColorPicker label="Hata (Silme)" value={currentColors.lightDanger || ""} onChange={(v) => handleColorChange("lightDanger", v)} />
              </div>

              {/* Light Mode - Reçete Kartı Renkleri (Gizlenebilir) */}
              <details className="mt-4 border border-border-color rounded-xl bg-slate-50 dark:bg-surface/10 overflow-hidden group">
                <summary className="p-4 font-bold text-sm cursor-pointer select-none outline-none flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Reçete Kartı Renkleri (Detaylı Ayarlar)
                  <span className="text-xs text-muted-foreground group-open:hidden">Genişlet ▼</span>
                  <span className="text-xs text-muted-foreground hidden group-open:inline">Daralt ▲</span>
                </summary>
                <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 border-t border-border-color/50 mt-2 pt-4">
                  <ColorPicker label="Uzak Kutu Arka Plan" value={currentColors.lightRxUzakBg || ""} onChange={(v) => handleColorChange("lightRxUzakBg", v)} />
                  <ColorPicker label="Uzak Çizgi Rengi" value={currentColors.lightRxUzakBorder || ""} onChange={(v) => handleColorChange("lightRxUzakBorder", v)} />
                  <ColorPicker label="Uzak Başlık Rengi" value={currentColors.lightRxUzakText || ""} onChange={(v) => handleColorChange("lightRxUzakText", v)} />
                  
                  <ColorPicker label="Yakın Kutu Arka Plan" value={currentColors.lightRxYakinBg || ""} onChange={(v) => handleColorChange("lightRxYakinBg", v)} />
                  <ColorPicker label="Yakın Çizgi Rengi" value={currentColors.lightRxYakinBorder || ""} onChange={(v) => handleColorChange("lightRxYakinBorder", v)} />
                  <ColorPicker label="Yakın Başlık Rengi" value={currentColors.lightRxYakinText || ""} onChange={(v) => handleColorChange("lightRxYakinText", v)} />

                  <ColorPicker label="Daimi Kutu Arka Plan" value={currentColors.lightRxDaimiBg || ""} onChange={(v) => handleColorChange("lightRxDaimiBg", v)} />
                  <ColorPicker label="Daimi Çizgi Rengi" value={currentColors.lightRxDaimiBorder || ""} onChange={(v) => handleColorChange("lightRxDaimiBorder", v)} />
                  <ColorPicker label="Daimi Başlık Rengi" value={currentColors.lightRxDaimiText || ""} onChange={(v) => handleColorChange("lightRxDaimiText", v)} />

                  <ColorPicker label="Açıklama Arka Plan" value={currentColors.lightRxNotesBg || ""} onChange={(v) => handleColorChange("lightRxNotesBg", v)} />
                  <ColorPicker label="Açıklama Çerçevesi" value={currentColors.lightRxNotesBorder || ""} onChange={(v) => handleColorChange("lightRxNotesBorder", v)} />
                  <ColorPicker label="Açıklama Başlık Rengi" value={currentColors.lightRxNotesText || ""} onChange={(v) => handleColorChange("lightRxNotesText", v)} />

                  <ColorPicker label="PD/PH Kutu Arka Plan" value={currentColors.lightRxPdPhBg || ""} onChange={(v) => handleColorChange("lightRxPdPhBg", v)} />
                  <ColorPicker label="PD/PH Çerçeve Rengi" value={currentColors.lightRxPdPhBorder || ""} onChange={(v) => handleColorChange("lightRxPdPhBorder", v)} />
                  <ColorPicker label="PD/PH Başlık Rengi" value={currentColors.lightRxPdPhText || ""} onChange={(v) => handleColorChange("lightRxPdPhText", v)} />

                  <ColorPicker label="Numara Kutu Zemin" value={currentColors.lightRxValueBg || ""} onChange={(v) => handleColorChange("lightRxValueBg", v)} />
                  <ColorPicker label="Numara Yazı Rengi" value={currentColors.lightRxValueText || ""} onChange={(v) => handleColorChange("lightRxValueText", v)} />
                </div>
              </details>
            </div>

            <hr className="border-border-color" />

            {/* Dark Mode Colors */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Moon className="w-5 h-5 text-slate-400" /> Koyu Mod Renkleri
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {DARK_PRESETS.map((preset, idx) => (
                  <button key={idx} onClick={() => applyPreset("dark", idx)} className="p-3 text-left border border-border-color rounded-xl hover:border-primary/50 transition-all group">
                    <p className="text-xs font-bold text-foreground mb-2 group-hover:text-primary">{preset.name}</p>
                    <div className="flex h-6 rounded-lg overflow-hidden border border-border-color/50">
                      <div className="flex-1" style={{ backgroundColor: preset.colors.primary }}></div>
                      <div className="flex-1" style={{ backgroundColor: preset.colors.background }}></div>
                      <div className="flex-1" style={{ backgroundColor: preset.colors.surface }}></div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-border-color rounded-xl bg-slate-50 dark:bg-surface/20">
                <ColorPicker label="Ana Vurgu Rengi" value={currentColors.darkPrimary || ""} onChange={(v) => handleColorChange("darkPrimary", v)} />
                <ColorPicker label="İkincil Vurgu" value={currentColors.darkSecondary || ""} onChange={(v) => handleColorChange("darkSecondary", v)} />
                <ColorPicker label="Ana Arka Plan" value={currentColors.darkBackground || ""} onChange={(v) => handleColorChange("darkBackground", v)} />
                <ColorPicker label="Kart (Kutu) Zemini" value={currentColors.darkSurface || ""} onChange={(v) => handleColorChange("darkSurface", v)} />
                
                <ColorPicker label="Ana Metin Rengi" value={currentColors.darkForeground || ""} onChange={(v) => handleColorChange("darkForeground", v)} />
                <ColorPicker label="Soluk Metin Rengi" value={currentColors.darkMutedForeground || ""} onChange={(v) => handleColorChange("darkMutedForeground", v)} />
                <ColorPicker label="Çerçeve / Çizgi Rengi" value={currentColors.darkBorder || ""} onChange={(v) => handleColorChange("darkBorder", v)} />

                <ColorPicker label="Grafik 1 (İşletme)" value={currentColors.darkChart1 || ""} onChange={(v) => handleColorChange("darkChart1", v)} />
                <ColorPicker label="Grafik 2 (Müşteri)" value={currentColors.darkChart2 || ""} onChange={(v) => handleColorChange("darkChart2", v)} />
                <ColorPicker label="Uyarı (Doğrulama)" value={currentColors.darkWarning || ""} onChange={(v) => handleColorChange("darkWarning", v)} />
                <ColorPicker label="Başarı (Onay)" value={currentColors.darkSuccess || ""} onChange={(v) => handleColorChange("darkSuccess", v)} />
                <ColorPicker label="Hata (Silme)" value={currentColors.darkDanger || ""} onChange={(v) => handleColorChange("darkDanger", v)} />
              </div>

              {/* Dark Mode - Reçete Kartı Renkleri (Gizlenebilir) */}
              <details className="mt-4 border border-border-color rounded-xl bg-slate-50 dark:bg-surface/10 overflow-hidden group">
                <summary className="p-4 font-bold text-sm cursor-pointer select-none outline-none flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Reçete Kartı Renkleri (Detaylı Ayarlar)
                  <span className="text-xs text-muted-foreground group-open:hidden">Genişlet ▼</span>
                  <span className="text-xs text-muted-foreground hidden group-open:inline">Daralt ▲</span>
                </summary>
                <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 border-t border-border-color/50 mt-2 pt-4">
                  <ColorPicker label="Uzak Kutu Arka Plan" value={currentColors.darkRxUzakBg || ""} onChange={(v) => handleColorChange("darkRxUzakBg", v)} />
                  <ColorPicker label="Uzak Çizgi Rengi" value={currentColors.darkRxUzakBorder || ""} onChange={(v) => handleColorChange("darkRxUzakBorder", v)} />
                  <ColorPicker label="Uzak Başlık Rengi" value={currentColors.darkRxUzakText || ""} onChange={(v) => handleColorChange("darkRxUzakText", v)} />
                  
                  <ColorPicker label="Yakın Kutu Arka Plan" value={currentColors.darkRxYakinBg || ""} onChange={(v) => handleColorChange("darkRxYakinBg", v)} />
                  <ColorPicker label="Yakın Çizgi Rengi" value={currentColors.darkRxYakinBorder || ""} onChange={(v) => handleColorChange("darkRxYakinBorder", v)} />
                  <ColorPicker label="Yakın Başlık Rengi" value={currentColors.darkRxYakinText || ""} onChange={(v) => handleColorChange("darkRxYakinText", v)} />

                  <ColorPicker label="Daimi Kutu Arka Plan" value={currentColors.darkRxDaimiBg || ""} onChange={(v) => handleColorChange("darkRxDaimiBg", v)} />
                  <ColorPicker label="Daimi Çizgi Rengi" value={currentColors.darkRxDaimiBorder || ""} onChange={(v) => handleColorChange("darkRxDaimiBorder", v)} />
                  <ColorPicker label="Daimi Başlık Rengi" value={currentColors.darkRxDaimiText || ""} onChange={(v) => handleColorChange("darkRxDaimiText", v)} />

                  <ColorPicker label="Açıklama Arka Plan" value={currentColors.darkRxNotesBg || ""} onChange={(v) => handleColorChange("darkRxNotesBg", v)} />
                  <ColorPicker label="Açıklama Çerçevesi" value={currentColors.darkRxNotesBorder || ""} onChange={(v) => handleColorChange("darkRxNotesBorder", v)} />
                  <ColorPicker label="Açıklama Başlık Rengi" value={currentColors.darkRxNotesText || ""} onChange={(v) => handleColorChange("darkRxNotesText", v)} />

                  <ColorPicker label="PD/PH Kutu Arka Plan" value={currentColors.darkRxPdPhBg || ""} onChange={(v) => handleColorChange("darkRxPdPhBg", v)} />
                  <ColorPicker label="PD/PH Çerçeve Rengi" value={currentColors.darkRxPdPhBorder || ""} onChange={(v) => handleColorChange("darkRxPdPhBorder", v)} />
                  <ColorPicker label="PD/PH Başlık Rengi" value={currentColors.darkRxPdPhText || ""} onChange={(v) => handleColorChange("darkRxPdPhText", v)} />

                  <ColorPicker label="Numara Kutu Zemin" value={currentColors.darkRxValueBg || ""} onChange={(v) => handleColorChange("darkRxValueBg", v)} />
                  <ColorPicker label="Numara Yazı Rengi" value={currentColors.darkRxValueText || ""} onChange={(v) => handleColorChange("darkRxValueText", v)} />
                </div>
              </details>
            </div>
          </div>
        )}

        {tab === "license" && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-primary/10 dark:bg-primary/20 border border-primary/30 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <Crown className="w-6 h-6 text-[#1B242A]" />
                </div>
                <div>
                  <h3 className="font-black text-foreground text-lg">Abonelik & Lisans Bilgileri</h3>
                  <p className="text-sm text-foreground/80 font-medium">Bu sekmede firmanıza ait yazılım lisansı ve sunucu abonelik detaylarını görebilirsiniz.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mevcut Paket */}
              <div 
                onDoubleClick={() => setShowPackageModal(true)}
                className="p-6 rounded-2xl border border-border-color bg-surface/30 flex flex-col gap-4 cursor-pointer hover:border-primary/50 hover:bg-surface/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10 group-hover:bg-primary/10 transition-colors"></div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 group-hover:text-primary transition-colors" />
                    <span className="font-semibold uppercase text-xs tracking-wider">Mevcut Paketiniz</span>
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity font-bold">ÇİFT TIKLA</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">{settings.subscriptionPlan}</p>
                  <p className="text-sm text-green-500 font-semibold mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Durum: {settings.subscriptionStatus}
                  </p>
                </div>
              </div>

              {/* Kullanım Süresi */}
              <div className="p-6 rounded-2xl border border-border-color bg-surface/30 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold uppercase text-xs tracking-wider">Kullanım Süresi</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">
                    {settings.subscriptionEndDate 
                      ? new Date(settings.subscriptionEndDate).toLocaleDateString("tr-TR") 
                      : "Sınırsız / 2 Yıl Ücretsiz"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Lisans Geçerlilik Tarihi</p>
                </div>
              </div>

              {/* Yazılım Desteği */}
              <div className="p-6 rounded-2xl border border-border-color bg-surface/30 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <HeartHandshake className="w-5 h-5" />
                  <span className="font-semibold uppercase text-xs tracking-wider">Yazılım Desteği</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{settings.supportLevel}</p>
                  <p className="text-sm text-muted-foreground mt-1">Teknik aksaklıklarda uzaktan müdahale ve güncelleme desteği.</p>
                </div>
              </div>

              {/* Donanım Desteği */}
              <div className="p-6 rounded-2xl border border-border-color bg-surface/30 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Laptop className="w-5 h-5" />
                  <span className="font-semibold uppercase text-xs tracking-wider">Donanım Desteği</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${settings.hardwareSupport ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {settings.hardwareSupport ? 'AKTİF' : 'PASİF'}
                  </span>
                  <p className="text-sm text-muted-foreground">Sistem donanımları (Kamera, Barkod okuyucu vb.)</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-surface/50 border border-border-color rounded-xl text-sm text-muted-foreground text-center italic">
              Lisans güncellemeleri, paket yükseltmeleri veya ekstra destek talepleriniz için sistem yöneticiniz (Penoptik Yazılım Müşteri Temsilciniz) ile iletişime geçiniz.
            </div>
          </div>
        )}

        {tab !== "profile" && (
          <div className="flex justify-center sm:justify-end pt-4 border-t border-border-color mt-6">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="w-full sm:w-auto justify-center px-6 py-3 gradient-primary text-[#1B242A] rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Kaydediliyor..." : "Ayarları Kaydet ve Uygula"}
            </button>
          </div>
        )}
        
        {showPackageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setShowPackageModal(false)}>
            <div className="bg-white dark:bg-surface w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border-color" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-border-color flex justify-between items-center bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                    <Crown className="w-5 h-5 text-[#1B242A]" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-foreground">{settings.subscriptionPlan} Detayları</h3>
                    <p className="text-xs text-muted-foreground font-medium">Sahip olduğunuz ayrıcalıklar</p>
                  </div>
                </div>
                <button onClick={() => setShowPackageModal(false)} className="text-muted-foreground hover:text-foreground text-sm font-bold bg-surface px-3 py-1.5 rounded-lg border border-border-color hover:border-primary/50 transition-colors">
                  Kapat
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">Sınırsız Müşteri ve Kayıt Yönetimi</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Müşterilerinizi, reçetelerini ve detaylı göz ölçümlerini hiçbir sınır olmadan ömür boyu kaydedin.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">Gelişmiş Sipariş ve Kayıt Takibi</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Sipariş süreçlerinizi adım adım izleyin, müşteri kayıtlarını kolayca ve hatasız yönetin.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">Özelleştirilebilir Tema (White-Label)</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Panelinizi ve müşteri ekranlarını tamamen kendi marka renklerinizle baştan tasarlayın ve fark yaratın.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">7/24 Kesintisiz Bulut Altyapısı</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Değerli verileriniz yüksek güvenlikli bulut sunucularımızda otomatik yedeklenir ve korunur.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <input 
          type="color" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0 p-0"
        />
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 w-full bg-transparent border border-border-color rounded text-xs px-2 py-1.5 focus:border-primary focus:outline-none uppercase font-mono"
        />
      </div>
    </div>
  );
}
