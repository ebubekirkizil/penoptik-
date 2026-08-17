// @ts-nocheck
import Link from "next/link";
import { LayoutDashboard, Users, Package, ShoppingBag, ClipboardList, Globe, LogOut, ShieldCheck, Settings, Trash2, CreditCard, Receipt } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import PendingVerificationBadge from "@/components/PendingVerificationBadge";
import ThemeInjector from "@/components/ThemeInjector";
import { prisma } from "@/lib/mock-prisma";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { Activity } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { FinanceSidebarGroup } from "../../../components/FinanceSidebarGroup";
import { InventorySidebarGroup } from "../../../components/InventorySidebarGroup";
import { GlobalAIAssistant } from "../../../components/GlobalAIAssistant";

const getCachedSettings = unstable_cache(
  async () => {
    return await prisma.settings.findUnique({ where: { id: "global" } });
  },
  ['global-settings'],
  { revalidate: 60, tags: ['settings'] }
);

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("userRole")?.value || "PERSONEL_2";
  const isMegaAdmin = true; // Demo modülü için tüm menüleri aktif ettik

  const dynamicNavItems = [
    { href: "/demo/sample-optic",              icon: LayoutDashboard, label: "Kontrol Paneli", exact: true },
    { href: "/demo/sample-optic/customers",   icon: Users,           label: "Müxteriler" },
    { href: "/demo/sample-optic/orders",      icon: ShoppingBag,     label: "Siparixler" },
    // Stok Takibi ve Finans — accordion group ile render edilecek
    { href: "/demo/sample-optic/prescriptions",icon: ClipboardList,  label: "Göz Bilgileri" },
    { href: "/demo/sample-optic/verifications",icon: ShieldCheck,    label: "Doğrulamalar", badge: true },
    ...(isMegaAdmin ? [
      { href: "/demo/sample-optic/logs", icon: Activity, label: "Sistem Logları" },
      { href: "/demo/sample-optic/trash", icon: Trash2, label: "Çöp Kutusu" },
      { href: "/demo/sample-optic/settings", icon: Settings, label: "Ayarlar" }
    ] : []),
  ];

  const beforeGroups = dynamicNavItems.slice(0, 3);
  const afterGroups  = dynamicNavItems.slice(3);

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
            <p className="text-muted-foreground text-[10px] mt-0.5 leading-tight">Siparix & Hasta Takip</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {beforeGroups.map((item) => (
            <SidebarLink key={item.href} {...item} />
          ))}
          {/* Stok Takibi collapsible group */}
          <InventorySidebarGroup />
          {/* Finans collapsible group */}
          <FinanceSidebarGroup />
          {afterGroups.map((item) => (
            <SidebarLink key={item.href} {...item} />
          ))}
        </nav>

        {/* Bottom links */}
        <div className="px-3 py-4 border-t border-[var(--border-color)] space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background transition-all text-sm font-medium"
          >
            <Globe className="w-5 h-5 flex-shrink-0" />
            <span>Müxteri Sitesi</span>
          </Link>
          <a
            href="/api/auth/logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all text-sm font-medium"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Çıkıx Yap</span>
          </a>
        </div>
      </aside>

      {/* ── Bottom Nav — Mobile ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-[var(--border-color)] pb-safe">
        <MobileNav isMegaAdmin={isMegaAdmin} />
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
        <GlobalAIAssistant />
      </main>
    </div>
  );
}

// ─── Server Component helpers (no pathname check — active state via CSS only) ───

function SidebarLink({
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
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/8 transition-all text-sm font-medium group"
    >
      <Icon className="w-[18px] h-[18px] flex-shrink-0 group-hover:scale-110 transition-transform" />
      <span className="flex-1 truncate">{label}</span>
      {badge && <PendingVerificationBadge />}
    </Link>
  );
}

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
