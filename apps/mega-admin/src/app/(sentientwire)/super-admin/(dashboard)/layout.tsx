import Link from "next/link";
import { LayoutDashboard, Building2, CreditCard, Users, Settings, ShieldAlert, LogOut, Globe, PackageOpen, Bot, Server, SmartphoneNfc, ScanLine } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileSidebar } from "./MobileSidebar";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex overflow-hidden bg-slate-50 dark:bg-[#0B1120]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 flex-shrink-0 flex-col bg-white dark:bg-[#0F172A] shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none border-r border-slate-200 dark:border-[#1E293B] z-40">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-[#1E293B] shrink-0">
          <Link href="/super-admin" className="flex items-center gap-3">
            <div className="flex-shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="SentientWire Logo" className="w-8 h-8 object-contain drop-shadow-md" />
            </div>
            <div className="flex flex-col">
              <p className="font-black text-slate-900 dark:text-white text-[15px] tracking-tight leading-none">SENTIENT<span className="text-blue-500">WIRE</span></p>
              <p className="text-slate-500 dark:text-slate-400 text-[9px] uppercase font-bold mt-1 tracking-wider">Sistem Konsolu</p>
            </div>
          </Link>
          <div className="flex-shrink-0 ml-2">
            <ThemeToggle className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-all touch-manipulation flex-shrink-0" />
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ana Menü</div>
          <NavLink href="/super-admin" icon={<LayoutDashboard className="w-5 h-5" />} label="Genel Bakıx" exact />
          <NavLink href="/super-admin/firms" icon={<Building2 className="w-5 h-5" />} label="Müxteriler (Firmalar)" />
          <NavLink href="/super-admin/all-users" icon={<Users className="w-5 h-5" />} label="Tüm Alt Kullanıcılar" />
          <NavLink href="/super-admin/packages" icon={<PackageOpen className="w-5 h-5" />} label="Dinamik Paketler" />
          
          <div className="px-3 pt-6 pb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Modüller & Test</div>
          <NavLink href="/super-admin/nfc" icon={<SmartphoneNfc className="w-5 h-5" />} label="NFC Sistem Özeti" exact />
          <NavLink href="/super-admin/nfc/cards" icon={<CreditCard className="w-5 h-5" />} label="NFC Kartlar" />
          <NavLink href="/super-admin/nfc/users" icon={<Users className="w-5 h-5" />} label="NFC Müxteriler" />
          <NavLink href="/super-admin/nfc/checker" icon={<ScanLine className="w-5 h-5" />} label="Kart Tarayıcı" />
          <NavLink href="/super-admin/features" icon={<PackageOpen className="w-5 h-5" />} label="Tüm Özellikler" />
          
          <div className="px-3 pt-6 pb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Analiz & Raporlama</div>
          <NavLink href="/super-admin/finance" icon={<CreditCard className="w-5 h-5" />} label="Muhasebe & Finans (MRR)" />
          <NavLink href="/super-admin/ai-analytics" icon={<Bot className="w-5 h-5" />} label="Yapay Zeka Danıxman" />
          
          <div className="px-3 pt-6 pb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sistem & Güvenlik</div>
          <NavLink href="/super-admin/server-monitor" icon={<Server className="w-5 h-5" />} label="Sunucu Monitörü" />
          <NavLink href="/super-admin/users" icon={<Users className="w-5 h-5" />} label="Süper Yöneticiler" />
          <NavLink href="/super-admin/tickets" icon={<ShieldAlert className="w-5 h-5" />} label="Destek Talepleri" />
          <NavLink href="/super-admin/settings" icon={<Settings className="w-5 h-5" />} label="Global Ayarlar" />
          <NavLink href="/super-admin/kvkk-logs" icon={<ShieldAlert className="w-5 h-5" />} label="KVKK Onay Logları" />
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-[#1E293B] shrink-0">
          <Link href="/super-admin/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-sm font-medium">
            <LogOut className="w-5 h-5" />
            <span>Güvenli Çıkıx</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-w-0">
        {/* Top Header Mobile */}
        <header className="md:hidden bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#1E293B] sticky top-0 z-30 px-4 h-16 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <MobileSidebar />
            <Link href="/super-admin" className="flex items-center gap-2">
            <div className="flex-shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="SentientWire Logo" className="w-7 h-7 object-contain drop-shadow-md" />
            </div>
            <p className="font-black text-slate-900 dark:text-white text-sm hidden sm:block">SENTIENT<span className="text-blue-500">WIRE</span></p>
          </Link>
          </div>
          <div className="flex items-center flex-shrink-0">
            <ThemeToggle className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-all touch-manipulation flex-shrink-0" />
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, icon, label, exact }: { href: string; icon: React.ReactNode; label: string; exact?: boolean }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all text-sm font-semibold group"
    >
      <span className="group-hover:scale-110 transition-transform flex-shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
    </Link>
  );
}
