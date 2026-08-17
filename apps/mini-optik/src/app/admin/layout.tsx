// @ts-nocheck
import Link from "next/link";
import { LayoutDashboard, Users, Package, ClipboardList, Globe, LogOut, ShieldCheck, Settings, Trash2, CreditCard, Wallet, Briefcase } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import PendingVerificationBadge from "@/components/PendingVerificationBadge";
import ThemeInjector from "@/components/ThemeInjector";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { Activity } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import AiChatBotWidget from "@/components/AiChatBotWidget";
import { VoiceAssistantWidget } from "@/components/VoiceAssistantWidget";
import { KVKKConsentModal } from "@/components/KVKKConsentModal";
import { SidebarNav, NavItem } from "@/components/SidebarNav";
import { 
  Calculator, 
  Landmark, 
  TrendingUp, 
  Building2, 
  FileText,
  Boxes,
  Truck
} from "lucide-react";

const getCachedSettings = unstable_cache(
  async () => {
    try {
      return await prisma.settings.findFirst({ where: { id: "global" } });
    } catch (e) {
      console.error("getCachedSettings error:", e);
      return null;
    }
  },
  ['global-settings-v3'],
  { revalidate: 60, tags: ['settings'] }
);

const getCachedFirm = unstable_cache(
  async (firmId: string) => {
    try {
      return await prisma.firm.findUnique({ where: { id: firmId } });
    } catch (e) {
      console.error("getCachedFirm error:", e);
      return null;
    }
  },
  ['firm-data'],
  { revalidate: 60, tags: ['firm'] }
);

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("userRole")?.value || "PERSONEL_2";
  const isMegaAdmin = userRole === "MEGA_ADMIN" || userRole === "FIRM_ADMIN" || userRole === "SUPER_ADMIN";

  const firmId = cookieStore.get("firmId")?.value;
  let activeModules: string[] = [];
  
  if (firmId) {
    const firm = await getCachedFirm(firmId);
    if (firm?.activeModules) {
      try {
        activeModules = JSON.parse(firm.activeModules);
      } catch (e) {}
    }
  }

  const dynamicNavItems: NavItem[] = [
    { href: "/admin",              icon: "LayoutDashboard", label: "Kontrol Paneli", exact: true },
    { href: "/admin/customers",   icon: "Users",           label: "Müşteriler" },
    { href: "/admin/orders",      icon: "ShoppingBag",         label: "Siparişler" },
    { 
      href: "/admin/inventory", 
      icon: "Package",   
      label: "Stok Takibi",
      subItems: [
        { href: "/admin/inventory?tab=INVENTORY", label: "Envanter Listesi", icon: "List" },
        { href: "/admin/inventory?tab=SMART_ALERTS", label: "Akıllı Uyarılar", icon: "Bell" },
        { href: "/admin/inventory?tab=RAPID_SCAN", label: "Stok Sayımı", icon: "Barcode" },
        { href: "/admin/inventory?tab=LABELS", label: "Etiket Yazdır", icon: "Printer" },
        { href: "/admin/inventory?tab=MOVEMENTS", label: "Stok Hareketleri", icon: "ArrowUpDown" },
        { href: "/admin/inventory?tab=SUPPLIERS", label: "Tedarikçi Yönetimi", icon: "Truck" },
        { href: "/admin/inventory?tab=SGK_UTS", label: "SGK & ÜTS Onayları", icon: "ShieldCheck" },
        { href: "/admin/inventory?tab=SETTINGS", label: "Ayarlar", icon: "Settings" }
      ]
    },
    { 
      href: "/admin/finance",     
      icon: "Wallet",          
      label: "Finans",
      subItems: [
        { href: "/admin/finance?tab=OVERVIEW", label: "Genel Bakış", icon: "LayoutGrid" },
        { href: "/admin/finance?tab=TRANSACTIONS", label: "İşlemler", icon: "List" },
        { href: "/admin/finance?tab=PLANNED_PAYMENTS", label: "Planlı Ödemeler", icon: "Calendar" },
        { href: "/admin/finance?tab=TAX", label: "Vergi Yönetimi", icon: "FileText" },
        { href: "/admin/finance?tab=SETTINGS", label: "Finans Ayarları", icon: "Settings" },
      ]
    },
    { href: "/admin/prescriptions",icon: "ClipboardList",  label: "Göz Bilgileri" },
    { href: "/admin/integrations/sgk", icon: "Server", label: "SGK İşlemleri" },
    { href: "/admin/integrations/uts", icon: "PackageSearch", label: "ÜTS İşlemleri" },
    { 
      href: "/admin/system", 
      icon: "Settings2", 
      label: "Sistem Araçları",
      subItems: [
        { href: "/admin/system/communications", label: "İletişim & Otomasyon", icon: "MessageSquare" },
        { href: "/admin/system/verifications", label: "Doğrulamalar", icon: "ShieldCheck", badge: true },
        { href: "/admin/system/logs", label: "Sistem Logları", icon: "Activity" },
        { href: "/admin/system/trash", label: "Çöp Kutusu", icon: "Trash2" },
      ]
    },
  ];

  if (activeModules.includes("hr")) dynamicNavItems.push({ href: "/admin/hr", icon: "Briefcase", label: "Personel (HR)" });

  if (isMegaAdmin) {
    dynamicNavItems.push({ href: "/admin/settings", icon: "Settings", label: "Ayarlar" });
  }

  let settings = null;
  try {
    settings = await getCachedSettings();
  } catch (error) {
    console.error("Layout settings fetch error:", error);
  }

  let adminTheme = null;
  if (settings?.themeData) {
    try {
      const parsed = JSON.parse(settings.themeData);
      adminTheme = parsed.admin;
    } catch (e) {}
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ThemeInjector theme={adminTheme} />

      {/* ── Sidebar — Desktop ── */}
      <aside className="hidden md:flex w-64 flex-col bg-surface border-r border-[var(--border-color)] fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--border-color)]">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary flex-shrink-0">
            <span className="text-white font-black text-lg italic">P</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-foreground text-sm leading-tight">
              PEN <span className="text-primary">OPTİK</span>
            </p>
            <p className="text-muted-foreground text-[10px] mt-0.5 leading-tight">Sipariş & Hasta Takip</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Nav links */}
        <SidebarNav items={dynamicNavItems} />

        {/* Bottom links */}
        <div className="px-3 py-4 border-t border-[var(--border-color)] space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background transition-all text-sm font-medium"
          >
            <Globe className="w-5 h-5 flex-shrink-0" />
            <span>Müşteri Sitesi</span>
          </Link>
          <a
            href="/api/auth/logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all text-sm font-medium"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Çıkış Yap</span>
          </a>
        </div>
      </aside>

      {/* ── Bottom Nav — Mobile ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-[var(--border-color)] pb-safe">
        <MobileNav items={dynamicNavItems} />
      </nav>

      {/* ── Main Content ── */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-w-0 overflow-x-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-surface border-b border-[var(--border-color)] sticky top-0 z-30">
          <div className="px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-sm italic">P</span>
              </div>
              <div>
                <p className="font-black text-foreground text-sm leading-none">
                  PEN <span className="text-primary">OPTİK</span>
                </p>
                <p className="text-muted-foreground text-[10px] mt-0.5">Admin Panel</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {children}
        <AiChatBotWidget />
        <KVKKConsentModal />
      </main>
    </div>
  );
}

// ─── Server Component helpers (no pathname check — active state via CSS only) ───

// ─── Server Component helpers (no pathname check — active state via CSS only) ───

// SidebarLink removed in favor of SidebarNav Client Component

function MobileNavLink({
  href,
  icon: Icon,
  label,
  exact,
  badge,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  exact?: boolean;
  badge?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors min-w-[56px] py-1"
    >
      <div className="relative">
        <Icon className="w-[22px] h-[22px]" />
        {badge && (
          <div className="absolute -top-1 -right-2 scale-75">
            <PendingVerificationBadge />
          </div>
        )}
      </div>
      <span className="text-[10px] font-semibold leading-none">{label}</span>
    </Link>
  );
}
