// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Monitor, Sun, Moon, Palette, Shield, Copy, Crown, Server, Clock, HeartHandshake, Laptop } from "lucide-react";
import toast from "react-hot-toast";
import ThemeInjector, { ThemeColors } from "./ThemeInjector";
import StaffManagement from "./StaffManagement";

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

export default function SettingsForm() {
  const [tab, setTab] = useState<"system" | "theme" | "license" | "support" | "profile" | "staff">("system");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);

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
        themeData: themes
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
      <div className="flex border-b border-border-color overflow-x-auto scrollbar-hide whitespace-nowrap">
        <button
          onClick={() => setTab("system")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 px-4 text-sm font-semibold transition-colors ${tab === "system" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Shield className="w-4 h-4" /> Sistem & Yetkiler
        </button>
        <button
          onClick={() => setTab("profile")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 px-4 text-sm font-semibold transition-colors ${tab === "profile" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Shield className="w-4 h-4" /> Profil & Şifre
        </button>
        <button
          onClick={() => setTab("theme")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 px-4 text-sm font-semibold transition-colors ${tab === "theme" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Palette className="w-4 h-4" /> Tema & Renkler
        </button>
        <button
          onClick={() => setTab("staff")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 px-4 text-sm font-semibold transition-colors ${tab === "staff" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Shield className="w-4 h-4" /> Personel Yönetimi
        </button>
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
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {tab === "support" && (
          <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-primary" /> İletişim & Destek Talebi
              </h3>
              <div className="bg-surface/30 border border-border-color p-6 rounded-2xl shadow-sm">
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                   <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                   </div>
                   <div>
                      <p className="text-sm font-bold text-foreground">Yapay Zeka Destekli Çözümler</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Sistem kullanımıyla ilgili temel sorularınız için ekranın sağ alt köşesindeki yapay zeka asistanımızı kullanabilirsiniz. Yazılımsal hata, özel geliştirme veya detaylı destek talepleriniz için ise aşağıdaki formu doldurarak SentientWire ekibine doğrudan ulaşabilirsiniz.
                      </p>
                   </div>
                </div>

                <div className="space-y-4">
                  <input type="text" placeholder="Konu başlığı (Örn: Modül Talebi, Fatura Hatası...)" className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" />
                  <textarea rows={5} placeholder="Mesajınız ve detaylı açıklamanız..." className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none transition-colors"></textarea>
                  
                  <div className="p-4 border border-dashed border-border-color rounded-xl bg-background flex flex-col gap-2 items-center justify-center text-center hover:bg-surface/50 transition-colors cursor-pointer relative overflow-hidden">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    <div>
                      <p className="text-sm font-bold text-foreground">Ekran Görüntüsü / Dosya Ekle</p>
                      <p className="text-xs text-muted-foreground mt-1">Sorunu daha hızlı çözebilmemiz için varsa hata görselini buraya yükleyin.</p>
                    </div>
                  </div>

                  <button className="w-full sm:w-auto bg-primary text-primary-foreground font-bold text-sm px-8 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-primary/20">Talebi Gönder</button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-primary text-xs font-bold">i</div>
              <p className="text-xs text-muted-foreground leading-relaxed">Gönderdiğiniz tüm talepler anında SentientWire sistemimize iletilmektedir. Talebiniz incelendikten sonra yapay zeka destek birimimiz veya yetkili temsilcimiz en kısa sürede sizinle iletişime geçecektir.</p>
            </div>
          </div>
        )}

        {tab === "staff" && (
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
                  <ColorPicker label="Uzak Kutu Arka Plan" value={currentColors.lightRxUzakBg || "#EFF6FF"} onChange={(v) => handleColorChange("lightRxUzakBg", v)} />
                  <ColorPicker label="Uzak Çizgi Rengi" value={currentColors.lightRxUzakBorder || "#BFDBFE"} onChange={(v) => handleColorChange("lightRxUzakBorder", v)} />
                  <ColorPicker label="Uzak Başlık Rengi" value={currentColors.lightRxUzakText || "#1D4ED8"} onChange={(v) => handleColorChange("lightRxUzakText", v)} />
                  
                  <ColorPicker label="Yakın Kutu Arka Plan" value={currentColors.lightRxYakinBg || "#FEFBEB"} onChange={(v) => handleColorChange("lightRxYakinBg", v)} />
                  <ColorPicker label="Yakın Çizgi Rengi" value={currentColors.lightRxYakinBorder || "#FDE68A"} onChange={(v) => handleColorChange("lightRxYakinBorder", v)} />
                  <ColorPicker label="Yakın Başlık Rengi" value={currentColors.lightRxYakinText || "#B45309"} onChange={(v) => handleColorChange("lightRxYakinText", v)} />

                  <ColorPicker label="Daimi Kutu Arka Plan" value={currentColors.lightRxDaimiBg || "#ECFDF5"} onChange={(v) => handleColorChange("lightRxDaimiBg", v)} />
                  <ColorPicker label="Daimi Çizgi Rengi" value={currentColors.lightRxDaimiBorder || "#A7F3D0"} onChange={(v) => handleColorChange("lightRxDaimiBorder", v)} />
                  <ColorPicker label="Daimi Başlık Rengi" value={currentColors.lightRxDaimiText || "#047857"} onChange={(v) => handleColorChange("lightRxDaimiText", v)} />

                  <ColorPicker label="Açıklama Arka Plan" value={currentColors.lightRxNotesBg || "#F8FAFC"} onChange={(v) => handleColorChange("lightRxNotesBg", v)} />
                  <ColorPicker label="Açıklama Çerçevesi" value={currentColors.lightRxNotesBorder || "#E2E8F0"} onChange={(v) => handleColorChange("lightRxNotesBorder", v)} />
                  <ColorPicker label="Açıklama Başlık Rengi" value={currentColors.lightRxNotesText || "#475569"} onChange={(v) => handleColorChange("lightRxNotesText", v)} />

                  <ColorPicker label="PD/PH Kutu Arka Plan" value={currentColors.lightRxPdPhBg || "#FFFFFF"} onChange={(v) => handleColorChange("lightRxPdPhBg", v)} />
                  <ColorPicker label="PD/PH Çerçeve Rengi" value={currentColors.lightRxPdPhBorder || "#E2E8F0"} onChange={(v) => handleColorChange("lightRxPdPhBorder", v)} />
                  <ColorPicker label="PD/PH Başlık Rengi" value={currentColors.lightRxPdPhText || "#0F172A"} onChange={(v) => handleColorChange("lightRxPdPhText", v)} />

                  <ColorPicker label="Numara Kutu Zemin" value={currentColors.lightRxValueBg || "#FFFFFF"} onChange={(v) => handleColorChange("lightRxValueBg", v)} />
                  <ColorPicker label="Numara Yazı Rengi" value={currentColors.lightRxValueText || "#0F172A"} onChange={(v) => handleColorChange("lightRxValueText", v)} />
                </div>
              </details>

              {/* Light Mode - Yapay Zeka Renkleri */}
              <details className="mt-4 border border-border-color rounded-xl bg-slate-50 dark:bg-surface/10 overflow-hidden group">
                <summary className="p-4 font-bold text-sm cursor-pointer select-none outline-none flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Yapay Zeka Asistanı Renkleri (Aydınlık Mod)
                  <span className="text-xs text-muted-foreground group-open:hidden">Genişlet ▼</span>
                  <span className="text-xs text-muted-foreground hidden group-open:inline">Daralt ▲</span>
                </summary>
                <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-5 gap-4 border-t border-border-color/50 mt-2 pt-4">
                  <ColorPicker label="Dış Kapak (Ana Tema)" value={currentColors.lightAiChatCover || "#6366F1"} onChange={(v) => handleColorChange("lightAiChatCover", v)} />
                  <ColorPicker label="Chat Arka Plan" value={currentColors.lightAiChatBg || "#F8FAFC"} onChange={(v) => handleColorChange("lightAiChatBg", v)} />
                  <ColorPicker label="Mesaj Metni" value={currentColors.lightAiChatText || "#1E293B"} onChange={(v) => handleColorChange("lightAiChatText", v)} />
                  <ColorPicker label="Asistan Rengi" value={currentColors.lightAiChatPrimary || "#3B82F6"} onChange={(v) => handleColorChange("lightAiChatPrimary", v)} />
                  <ColorPicker label="Baloncuk Rengi" value={currentColors.lightAiChatBubble || "#E2E8F0"} onChange={(v) => handleColorChange("lightAiChatBubble", v)} />
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
                  <ColorPicker label="Uzak Kutu Arka Plan" value={currentColors.darkRxUzakBg || "#1E3A8A"} onChange={(v) => handleColorChange("darkRxUzakBg", v)} />
                  <ColorPicker label="Uzak Çizgi Rengi" value={currentColors.darkRxUzakBorder || "#1E40AF"} onChange={(v) => handleColorChange("darkRxUzakBorder", v)} />
                  <ColorPicker label="Uzak Başlık Rengi" value={currentColors.darkRxUzakText || "#BFDBFE"} onChange={(v) => handleColorChange("darkRxUzakText", v)} />
                  
                  <ColorPicker label="Yakın Kutu Arka Plan" value={currentColors.darkRxYakinBg || "#78350F"} onChange={(v) => handleColorChange("darkRxYakinBg", v)} />
                  <ColorPicker label="Yakın Çizgi Rengi" value={currentColors.darkRxYakinBorder || "#92400E"} onChange={(v) => handleColorChange("darkRxYakinBorder", v)} />
                  <ColorPicker label="Yakın Başlık Rengi" value={currentColors.darkRxYakinText || "#FDE68A"} onChange={(v) => handleColorChange("darkRxYakinText", v)} />

                  <ColorPicker label="Daimi Kutu Arka Plan" value={currentColors.darkRxDaimiBg || "#064E3B"} onChange={(v) => handleColorChange("darkRxDaimiBg", v)} />
                  <ColorPicker label="Daimi Çizgi Rengi" value={currentColors.darkRxDaimiBorder || "#065F46"} onChange={(v) => handleColorChange("darkRxDaimiBorder", v)} />
                  <ColorPicker label="Daimi Başlık Rengi" value={currentColors.darkRxDaimiText || "#A7F3D0"} onChange={(v) => handleColorChange("darkRxDaimiText", v)} />

                  <ColorPicker label="Açıklama Arka Plan" value={currentColors.darkRxNotesBg || "#0F172A"} onChange={(v) => handleColorChange("darkRxNotesBg", v)} />
                  <ColorPicker label="Açıklama Çerçevesi" value={currentColors.darkRxNotesBorder || "#1E293B"} onChange={(v) => handleColorChange("darkRxNotesBorder", v)} />
                  <ColorPicker label="Açıklama Başlık Rengi" value={currentColors.darkRxNotesText || "#CBD5E1"} onChange={(v) => handleColorChange("darkRxNotesText", v)} />

                  <ColorPicker label="PD/PH Kutu Arka Plan" value={currentColors.darkRxPdPhBg || "#020617"} onChange={(v) => handleColorChange("darkRxPdPhBg", v)} />
                  <ColorPicker label="PD/PH Çerçeve Rengi" value={currentColors.darkRxPdPhBorder || "#1E293B"} onChange={(v) => handleColorChange("darkRxPdPhBorder", v)} />
                  <ColorPicker label="PD/PH Başlık Rengi" value={currentColors.darkRxPdPhText || "#F8FAFC"} onChange={(v) => handleColorChange("darkRxPdPhText", v)} />

                  <ColorPicker label="Numara Kutu Zemin" value={currentColors.darkRxValueBg || "#020617"} onChange={(v) => handleColorChange("darkRxValueBg", v)} />
                  <ColorPicker label="Numara Yazı Rengi" value={currentColors.darkRxValueText || "#F8FAFC"} onChange={(v) => handleColorChange("darkRxValueText", v)} />
                </div>
              </details>

              {/* Dark Mode - Yapay Zeka Renkleri */}
              <details className="mt-4 border border-border-color rounded-xl bg-slate-50 dark:bg-surface/10 overflow-hidden group">
                <summary className="p-4 font-bold text-sm cursor-pointer select-none outline-none flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Yapay Zeka Asistanı Renkleri (Koyu Mod)
                  <span className="text-xs text-muted-foreground group-open:hidden">Genişlet ▼</span>
                  <span className="text-xs text-muted-foreground hidden group-open:inline">Daralt ▲</span>
                </summary>
                <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-5 gap-4 border-t border-border-color/50 mt-2 pt-4">
                  <ColorPicker label="Dış Kapak (Ana Tema)" value={currentColors.darkAiChatCover || "#4F46E5"} onChange={(v) => handleColorChange("darkAiChatCover", v)} />
                  <ColorPicker label="Chat Arka Plan" value={currentColors.darkAiChatBg || "#0F172A"} onChange={(v) => handleColorChange("darkAiChatBg", v)} />
                  <ColorPicker label="Mesaj Metni" value={currentColors.darkAiChatText || "#F8FAFC"} onChange={(v) => handleColorChange("darkAiChatText", v)} />
                  <ColorPicker label="Asistan Rengi" value={currentColors.darkAiChatPrimary || "#3B82F6"} onChange={(v) => handleColorChange("darkAiChatPrimary", v)} />
                  <ColorPicker label="Baloncuk Rengi" value={currentColors.darkAiChatBubble || "#1E293B"} onChange={(v) => handleColorChange("darkAiChatBubble", v)} />
                </div>
              </details>
            </div>
          </div>
        )}

        {tab === "license" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-primary/10 dark:bg-primary/20 border border-primary/30 p-5 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Crown className="w-6 h-6 text-[#1B242A]" />
                </div>
                <div>
                  <h3 className="font-black text-foreground text-xl">SentientWire Lisans ve Abonelik Merkezi</h3>
                  <p className="text-sm text-foreground/80 font-medium">Sahip olduğunuz ayrıcalıkları, ödeme geçmişinizi ve paket detaylarınızı yönetin.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Sol Sütun: Paket Özeti */}
              <div className="lg:col-span-1 space-y-6">
                <div className="p-6 rounded-2xl border border-border-color bg-white dark:bg-surface shadow-sm flex flex-col gap-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Mevcut Paketiniz</span>
                      <span className="text-[10px] font-bold bg-green-500/10 text-green-600 px-2 py-1 rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Aktif</span>
                    </div>
                    <h4 className="text-3xl font-black text-foreground text-primary">{settings.subscriptionPlan}</h4>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-border-color">
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-muted-foreground">Kullanım Süresi</span>
                       <span className="font-bold text-foreground">{settings.subscriptionEndDate ? new Date(settings.subscriptionEndDate).toLocaleDateString("tr-TR") : "Sınırsız / Ömür Boyu"}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-muted-foreground">Yazılım Desteği</span>
                       <span className="font-bold text-foreground">7/24 Kesintisiz</span>
                     </div>
                  </div>

                  <button 
                    onClick={() => setShowPackageModal(true)}
                    className="w-full mt-2 bg-background border-2 border-primary/20 hover:border-primary text-primary font-bold text-sm px-4 py-3 rounded-xl transition-all"
                  >
                    Paket Detaylarını İncele
                  </button>
                  <button className="w-full bg-primary text-primary-foreground font-bold text-sm px-4 py-3 rounded-xl hover:opacity-90 transition-all shadow-md">
                    Paketi Yükselt / Değiştir
                  </button>
                </div>
              </div>

              {/* Sağ Sütun: Detaylı Bilgiler (Sekmeli) */}
              <div className="lg:col-span-2">
                 <div className="p-6 rounded-2xl border border-border-color bg-white dark:bg-surface shadow-sm h-full flex flex-col">
                    <h4 className="font-bold text-foreground mb-4">Abonelik Detayları ve Haklarınız</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                       <div className="p-4 rounded-xl bg-background border border-border-color">
                          <p className="text-xs text-muted-foreground font-bold mb-1 uppercase">Tanımlanan Abonelik</p>
                          <p className="text-sm font-semibold text-foreground">SentientWire Mega Pro (Aylık)</p>
                       </div>
                       <div className="p-4 rounded-xl bg-background border border-border-color">
                          <p className="text-xs text-muted-foreground font-bold mb-1 uppercase">Tanımlanan İndirimler</p>
                          <p className="text-sm font-semibold text-emerald-600">%15 Sadakat İndirimi (Aktif)</p>
                       </div>
                    </div>

                    <h4 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wider text-muted-foreground">Geçmiş İşlemler / Faturalar</h4>
                    <div className="flex-1 rounded-xl border border-border-color bg-background overflow-hidden">
                       <table className="w-full text-sm text-left">
                          <thead className="bg-surface border-b border-border-color text-muted-foreground">
                            <tr>
                              <th className="px-4 py-3 font-semibold">Tarih</th>
                              <th className="px-4 py-3 font-semibold">İşlem / Paket</th>
                              <th className="px-4 py-3 font-semibold text-right">Tutar</th>
                              <th className="px-4 py-3 font-semibold text-center">Durum</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-color">
                            <tr className="hover:bg-surface/50 transition-colors">
                              <td className="px-4 py-3">15 Tem 2026</td>
                              <td className="px-4 py-3">Aylık Abonelik Yenileme</td>
                              <td className="px-4 py-3 text-right font-mono">1.250,00 ₺</td>
                              <td className="px-4 py-3 text-center"><span className="text-xs font-bold bg-green-500/10 text-green-600 px-2 py-1 rounded-lg">Ödendi</span></td>
                            </tr>
                            <tr className="hover:bg-surface/50 transition-colors">
                              <td className="px-4 py-3">15 Haz 2026</td>
                              <td className="px-4 py-3">Aylık Abonelik Yenileme</td>
                              <td className="px-4 py-3 text-right font-mono">1.250,00 ₺</td>
                              <td className="px-4 py-3 text-center"><span className="text-xs font-bold bg-green-500/10 text-green-600 px-2 py-1 rounded-lg">Ödendi</span></td>
                            </tr>
                            <tr className="hover:bg-surface/50 transition-colors text-muted-foreground">
                              <td className="px-4 py-3 col-span-4 text-center italic py-4" colSpan={4}>Önceki ödemeleriniz arşive taşınmıştır.</td>
                            </tr>
                          </tbody>
                       </table>
                    </div>
                 </div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">!</span>
              Lisans güncellemeleri, özel paket teklifleri ve fatura işlemleriniz için SentientWire müşteri temsilciniz ile iletişime geçebilirsiniz.
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
            <div className="bg-white dark:bg-surface w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-border-color" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-border-color flex justify-between items-center bg-primary/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                    <Crown className="w-6 h-6 text-[#1B242A]" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-foreground">{settings.subscriptionPlan} Detayları</h3>
                    <p className="text-sm text-muted-foreground font-medium">Sahip olduğunuz modüller ve ayrıcalıklar</p>
                  </div>
                </div>
                <button onClick={() => setShowPackageModal(false)} className="text-muted-foreground hover:text-foreground text-sm font-bold bg-surface px-4 py-2 rounded-xl border border-border-color hover:border-primary/50 transition-colors">
                  Kapat
                </button>
              </div>
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-border-color bg-surface/30">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                    <div>
                      <p className="font-bold text-sm text-foreground">Sınırsız Müşteri Yönetimi (CRM)</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Sınırsız kayıt ekleme, geçmiş sipariş takibi, özel notlar ve iletişim paneli.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-border-color bg-surface/30">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                    <div>
                      <p className="font-bold text-sm text-foreground">Gelişmiş Sipariş ve Stok</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Barkodlu ürün tanımlama, otomatik stok düşümü ve depo/şube yönetimi.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-border-color bg-surface/30">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                    <div>
                      <p className="font-bold text-sm text-foreground">Finans ve Ön Muhasebe</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Gelir/Gider takibi, açık hesap borç yönetimi, tahsilat raporları.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-border-color bg-surface/30">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                    <div>
                      <p className="font-bold text-sm text-foreground">Özelleştirilebilir Tema (White-Label)</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Sistemi kendi markanızın renkleriyle tamamen özelleştirebilirsiniz.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-border-color bg-surface flex justify-end gap-3">
                 <button className="px-6 py-2.5 rounded-xl border border-border-color text-sm font-bold text-foreground hover:bg-background transition-colors">Paket Kıyaslaması</button>
                 <button className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">Paketi Yükselt</button>
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
