"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, CreditCard, Users, Settings, ShieldAlert, LogOut, PackageOpen, Bot, Server, SmartphoneNfc, ScanLine, Menu, X } from "lucide-react";

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsOpen(false);

  // Helper for links
  const NavLink = ({ href, icon, label, exact }: { href: string; icon: React.ReactNode; label: string; exact?: boolean }) => {
    const isActive = exact ? pathname === href : pathname?.startsWith(href);
    return (
      <Link
        href={href}
        onClick={closeMenu}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
          isActive
            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
            : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10"
        }`}
      >
        <span className={`transition-transform flex-shrink-0 group-hover:scale-110 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"}`}>
          {icon}
        </span>
        <span className="flex-1 truncate">{label}</span>
      </Link>
    );
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Menu size={24} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 z-[100] md:hidden backdrop-blur-sm transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* Slide-out Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-[#0F172A] shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-[#1E293B] shrink-0">
          <Link href="/super-admin" onClick={closeMenu} className="flex items-center gap-3">
            <div className="flex-shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="SentientWire Logo" className="w-8 h-8 object-contain drop-shadow-md" />
            </div>
            <div className="flex flex-col">
              <p className="font-black text-slate-900 dark:text-white text-[15px] tracking-tight leading-none">SENTIENT<span className="text-blue-500">WIRE</span></p>
              <p className="text-slate-500 dark:text-slate-400 text-[9px] uppercase font-bold mt-1 tracking-wider">Sistem Konsolu</p>
            </div>
          </Link>
          <button 
            onClick={closeMenu}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
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
          <NavLink href="/super-admin/finance" icon={<CreditCard className="w-5 h-5" />} label="Muhasebe & Finans" />
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
      </div>
    </>
  );
}
