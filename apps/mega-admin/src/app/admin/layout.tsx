import Link from "next/link";
import { LayoutDashboard, Users, Package, ClipboardList, Globe, LogOut, ShieldCheck, Settings, Calculator } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import PendingVerificationBadge from "@/components/PendingVerificationBadge";

import { prisma } from "@/lib/prisma";
import ThemeInjector from "@/components/ThemeInjector";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let settings = null;
  try {
    settings = await prisma.settings.findUnique({ where: { id: "global" } });
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
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-surface shadow-[4px_0_24px_rgba(0,0,0,0.02)] fixed inset-y-0 left-0 z-40">
        <div className="flex items-center gap-3 px-5 py-4 ">
          {/* Logo */}
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow-primary flex-shrink-0">
            <div className="text-[#1B242A] font-black text-base italic">P</div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-foreground text-sm leading-none">PEN <span className="text-primary">OPTİK</span></p>
            <p className="text-muted-foreground text-[10px] mt-0.5">Siparix & Hasta Takip Sistemi</p>
          </div>
          <ThemeToggle />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavLink href="/admin"              icon={<LayoutDashboard className="w-5 h-5" />} label="Kontrol Paneli" exact />
          <NavLink href="/admin/customers"    icon={<Users className="w-5 h-5" />}           label="Müxteriler" />
          <NavLink href="/admin/orders"       icon={<Package className="w-5 h-5" />}         label="Siparixler" />
          <NavLink href="/admin/prescriptions"icon={<ClipboardList className="w-5 h-5" />}   label="Göz Bilgileri (Optik)" />
          <NavLink href="/admin/verifications"icon={<ShieldCheck className="w-5 h-5" />}     label="Doğrulamalar" badge={<PendingVerificationBadge />} />
          <NavLink href="/admin/settings"     icon={<Settings className="w-5 h-5" />}        label="Ayarlar" />
        </nav>

        <div className="px-3 py-4  space-y-1 border-t border-border-color">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background transition-all text-sm">
            <Globe className="w-5 h-5" />
            <span>Müxteri Sitesi</span>
          </Link>
          <Link href="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all text-sm">
            <LogOut className="w-5 h-5" />
            <span>Çıkıx Yap</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-surface pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          <MobileNavLink href="/admin"              icon={<LayoutDashboard className="w-5 h-5" />} label="Panel" exact />
          <MobileNavLink href="/admin/customers"    icon={<Users className="w-5 h-5" />}           label="Müxteri" />
          <MobileNavLink href="/admin/orders"       icon={<Package className="w-5 h-5" />}         label="Siparix" />
          <MobileNavLink href="/admin/verifications"icon={<ShieldCheck className="w-5 h-5" />}     label="Onay" badge={<PendingVerificationBadge />} />
          <MobileNavLink href="/admin/settings"     icon={<Settings className="w-5 h-5" />}        label="Ayarlar" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-w-0 overflow-x-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-surface sticky top-0 z-30">
          <div className="px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow-primary flex-shrink-0">
                <div className="text-[#1B242A] font-black text-base italic">P</div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="font-black text-foreground text-sm leading-none">PEN <span className="text-primary">OPTİK</span></p>
                <p className="text-muted-foreground text-[10px] mt-0.5">Siparix & Hasta Takip Sistemi</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, icon, label, exact, badge }: { href: string; icon: React.ReactNode; label: string; exact?: boolean; badge?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 hover:shadow-sm transition-all text-sm font-medium group"
    >
      <span className="group-hover:scale-110 transition-transform flex-shrink-0">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {badge}
    </Link>
  );
}

function MobileNavLink({ href, icon, label, exact, badge }: { href: string; icon: React.ReactNode; label: string; exact?: boolean; badge?: React.ReactNode }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-primary transition-colors touch-manipulation">
      <div className="relative">
        {icon}
        {badge && <div className="absolute -top-1 -right-2 scale-75">{badge}</div>}
      </div>
      <span className="text-[9px] font-semibold">{label}</span>
    </Link>
  );
}

// Theme toggle as a bottom nav item on mobile
function ThemeToggleNavItem() {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5">
      <ThemeToggle />
      <span className="text-[9px] font-semibold text-muted-foreground">Tema</span>
    </div>
  );
}
