"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LayoutDashboard, Users, Package, ClipboardList, ShieldCheck, Activity, Settings, Trash2, CreditCard } from "lucide-react";
import PendingVerificationBadge from "@/components/PendingVerificationBadge";

export function MobileNav({ isMegaAdmin }: { isMegaAdmin: boolean }) {
  const [showMore, setShowMore] = useState(false);
  
  const dynamicNavItems = [
    { href: "/demo/sample-optic",              icon: LayoutDashboard, label: "Kontrol Paneli", exact: true },
    { href: "/demo/sample-optic/customers",   icon: Users,           label: "Müşteriler" },
    { href: "/demo/sample-optic/orders",      icon: Package,         label: "Siparişler" },
    { href: "/demo/sample-optic/prescriptions",icon: ClipboardList,  label: "Göz Bilgileri" },
    { href: "/demo/sample-optic/installments", icon: CreditCard,     label: "Alacaklar" },
    { href: "/demo/sample-optic/verifications",icon: ShieldCheck,    label: "Doğrulamalar", badge: true },
    ...(isMegaAdmin ? [
      { href: "/demo/sample-optic/logs", icon: Activity, label: "Loglar" },
      { href: "/demo/sample-optic/trash", icon: Trash2, label: "Çöp" },
    ] : []),
    { href: "/demo/sample-optic/settings", icon: Settings, label: "Ayarlar" },
  ];

  // Show first 4 items in the bottom bar, and the rest in the "More" menu
  const visibleItems = dynamicNavItems.slice(0, 4);
  const moreItems = dynamicNavItems.slice(4);

  return (
    <>
      {showMore && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-end justify-center pb-[64px] animate-in fade-in duration-300">
          <div className="bg-surface border-t border-[var(--border-color)] rounded-t-3xl w-full p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-in fade-in slide-in-from-bottom-12 duration-300 ease-out">
            <div className="flex justify-between items-center mb-6 px-1">
              <h3 className="font-bold text-foreground text-lg">Diğer Menüler</h3>
              <button onClick={() => setShowMore(false)} className="p-2 bg-muted hover:bg-muted/80 transition-colors rounded-full">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className="flex flex-col items-center justify-center gap-3 p-4 bg-background border border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm"
                  >
                    <div className="relative">
                      <Icon className="w-6 h-6 text-muted-foreground" />
                      {item.badge && (
                        <div className="absolute -top-1 -right-2 scale-75">
                          <PendingVerificationBadge />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-center leading-tight">{item.label}</span>
                  </Link>
                );
              })}
              {/* Çıkış Yap Butonu */}
              <button
                onClick={() => {
                  window.location.href = "/api/auth/logout";
                }}
                className="flex flex-col items-center justify-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl hover:border-red-500/50 hover:bg-red-500/10 transition-all shadow-sm"
              >
                <div className="relative">
                  <X className="w-6 h-6 text-red-500" />
                </div>
                <span className="text-[11px] font-semibold text-center leading-tight text-red-600 dark:text-red-400">Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-around items-center h-16 px-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors min-w-[56px] py-1"
            >
              <div className="relative">
                <Icon className="w-[22px] h-[22px]" />
                {item.badge && (
                  <div className="absolute -top-1 -right-2 scale-75">
                    <PendingVerificationBadge />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-semibold leading-none">{item.label}</span>
            </Link>
          );
        })}
        {moreItems.length > 0 && (
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center gap-1 transition-colors min-w-[56px] py-1 ${showMore ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
          >
            <Menu className="w-[22px] h-[22px]" />
            <span className="text-[10px] font-semibold leading-none">Diğer</span>
          </button>
        )}
      </div>
    </>
  );
}
