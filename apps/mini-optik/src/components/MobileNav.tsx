"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ChevronRight, LogOut } from "lucide-react";
import * as LucideIcons from "lucide-react";
import PendingVerificationBadge from "@/components/PendingVerificationBadge";
import { NavItem } from "@/components/SidebarNav";

export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "/admin/finance": pathname?.startsWith("/admin/finance") || false,
    "/admin/inventory": pathname?.startsWith("/admin/inventory") || false,
  });

  const toggleMenu = (href: string) => {
    setOpenMenus((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  // Alt barda gösterilecek ilk 3 öğe ve "Diğer" menüsü
  const visibleItems = items.slice(0, 3);
  const moreItems = items.slice(3);

  // İkon render yardımcısı
  const renderIcon = (iconName: string | undefined, className: string) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Circle;
    return <Icon className={className} />;
  };

  return (
    <>
      {showMore && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-end justify-center pb-[64px] animate-in fade-in duration-300">
          <div className="bg-surface border-t border-[var(--border-color)] rounded-t-[2.5rem] w-full pt-6 px-5 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-in fade-in slide-in-from-bottom-12 duration-300 ease-out max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h3 className="font-black text-foreground text-xl">Diğer Menüler</h3>
              <button onClick={() => setShowMore(false)} className="p-2.5 bg-muted hover:bg-muted/80 transition-colors rounded-full text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-3 overflow-y-auto pb-8 custom-scrollbar flex-1 -mx-2 px-2">
              {moreItems.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isOpen = openMenus[item.href];

                return (
                  <div key={item.href} className="flex flex-col">
                    {hasSubItems ? (
                      <button
                        onClick={() => toggleMenu(item.href)}
                        className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                          isActive || isOpen
                            ? "bg-primary/5 border-primary/30 shadow-sm"
                            : "bg-background border-[var(--border-color)] hover:border-primary/40 hover:bg-primary/5"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 relative shadow-sm border ${
                          isActive || isOpen ? "bg-primary text-primary-foreground border-primary/20" : "bg-gradient-to-br from-primary/20 to-primary/5 text-primary border-primary/10 group-hover:scale-110"
                        }`}>
                          {renderIcon(item.icon, "w-6 h-6")}
                          {item.badge && <div className="absolute -top-1 -right-1 scale-90"><PendingVerificationBadge /></div>}
                        </div>
                        <div className="flex-1 text-left flex items-center justify-between">
                          <span className={`font-bold text-[16px] tracking-tight transition-colors ${isActive || isOpen ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                            {item.label}
                          </span>
                          {isOpen ? <ChevronDown className="w-5 h-5 text-primary" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                        </div>
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setShowMore(false)}
                        className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                          isActive
                            ? "bg-primary/5 border-primary/30 shadow-sm"
                            : "bg-background border-[var(--border-color)] hover:border-primary/40 hover:bg-primary/5"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 relative shadow-sm border ${
                          isActive ? "bg-primary text-primary-foreground border-primary/20" : "bg-gradient-to-br from-primary/20 to-primary/5 text-primary border-primary/10 group-hover:scale-110"
                        }`}>
                          {renderIcon(item.icon, "w-6 h-6")}
                          {item.badge && <div className="absolute -top-1 -right-1 scale-90"><PendingVerificationBadge /></div>}
                        </div>
                        <div className="flex-1 text-left">
                          <span className={`font-bold text-[16px] tracking-tight transition-colors ${isActive ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                            {item.label}
                          </span>
                        </div>
                      </Link>
                    )}

                    {/* Alt Menüler (SubItems) */}
                    {hasSubItems && isOpen && (
                      <div className="ml-6 mt-3 flex flex-col gap-2 border-l-2 border-primary/20 pl-4 animate-in slide-in-from-top-2 duration-200">
                        {item.subItems!.map(sub => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setShowMore(false)}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] ${
                                isSubActive 
                                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                                  : "hover:bg-slate-50 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground border border-transparent"
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${isSubActive ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                {renderIcon(sub.icon, "w-4 h-4")}
                              </div>
                              <span className={`text-sm ${isSubActive ? "font-bold" : "font-semibold"}`}>{sub.label}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Çıkış Yap Butonu */}
              <button
                onClick={() => {
                  window.location.href = "/api/auth/logout";
                }}
                className="group flex items-center gap-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl hover:border-red-500/40 hover:bg-red-500/10 hover:shadow-md transition-all active:scale-[0.98] mt-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-red-500/10">
                  <LogOut className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-bold text-red-600 dark:text-red-400 text-[16px] tracking-tight group-hover:text-red-500 transition-colors">Çıkış Yap</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-around items-center h-16 px-1">
        {visibleItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1.5 transition-colors min-w-[64px] h-full ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <div className="relative">
                {renderIcon(item.icon, "w-6 h-6")}
                {item.badge && (
                  <div className="absolute -top-1 -right-2 scale-75">
                    <PendingVerificationBadge />
                  </div>
                )}
              </div>
              <span className={`text-[10px] leading-none ${isActive ? "font-bold" : "font-semibold"}`}>{item.label}</span>
            </Link>
          );
        })}
        {moreItems.length > 0 && (
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center gap-1.5 transition-colors min-w-[64px] h-full ${showMore ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Menu className="w-6 h-6" />
            <span className={`text-[10px] leading-none ${showMore ? "font-bold" : "font-semibold"}`}>Diğer</span>
          </button>
        )}
      </div>
    </>
  );
}
