"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import PendingVerificationBadge from "@/components/PendingVerificationBadge";

export type NavItem = {
  href: string;
  icon: string;
  label: string;
  exact?: boolean;
  badge?: boolean;
  subItems?: { href: string; label: string; icon?: string; badge?: boolean }[];
};

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Open states for accordions
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "/admin/finance": pathname?.startsWith("/admin/finance") || false,
    "/admin/inventory": pathname?.startsWith("/admin/inventory") || false,
    "/admin/system": pathname?.startsWith("/admin/system") || false,
    "/admin/integrations": pathname?.startsWith("/admin/integrations") || false,
  });

  const toggleMenu = (href: string) => {
    setOpenMenus((prev) => ({
      [href]: !prev[href]
    }));
  };

  const isSubActiveCheck = (subHref: string) => {
    if (!pathname) return false;
    const [path, query] = subHref.split("?");
    if (path !== pathname) return false;
    if (!query) return !searchParams.toString(); // exact match for path without query
    
    const subParams = new URLSearchParams(query);
    for (const [key, value] of Array.from(subParams.entries())) {
      if (searchParams.get(key) !== value) return false;
    }
    return true;
  };

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {items.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname?.startsWith(item.href);

        const hasSubItems = item.subItems && item.subItems.length > 0;
        const isOpen = openMenus[item.href];

        return (
          <div key={item.href} className="flex flex-col space-y-1">
            {hasSubItems ? (
              <button
                onClick={() => toggleMenu(item.href)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group ${
                  isActive || isOpen
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {(() => {
                  const Icon = (LucideIcons as any)[item.icon] || LucideIcons.Circle;
                  return <Icon className="w-[18px] h-[18px] flex-shrink-0 group-hover:scale-110 transition-transform" />;
                })()}
                <span className="flex-1 text-left truncate">{item.label}</span>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 opacity-50" />
                ) : (
                  <ChevronRight className="w-4 h-4 opacity-50" />
                )}
              </button>
            ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {(() => {
                  const Icon = (LucideIcons as any)[item.icon] || LucideIcons.Circle;
                  return <Icon className="w-[18px] h-[18px] flex-shrink-0 group-hover:scale-110 transition-transform" />;
                })()}
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && <PendingVerificationBadge />}
              </Link>
            )}

            {/* Sub Items Accordion */}
            {hasSubItems && isOpen && (
              <div className="ml-6 pl-3 border-l border-[var(--border-color)] flex flex-col space-y-1 mt-1 relative">
                {item.subItems!.map((sub) => {
                  const isSubActive = isSubActiveCheck(sub.href);
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-medium relative ${
                        isSubActive
                          ? "text-primary bg-primary/10 font-bold"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                      }`}
                    >
                      {/* Visual active line indicator per item */}
                      {isSubActive && (
                        <div className="absolute -left-3 inset-y-0 my-auto w-[2px] h-5 bg-primary rounded-full shadow-sm" />
                      )}

                      {sub.icon ? (
                        (() => {
                          const SubIcon = (LucideIcons as any)[sub.icon] || LucideIcons.Circle;
                          return <SubIcon className={`w-4 h-4 flex-shrink-0 ${isSubActive ? 'text-primary drop-shadow-sm' : ''}`} />;
                        })()
                      ) : (
                        <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                          <div className={`w-1.5 h-1.5 rounded-full ${isSubActive ? "bg-primary shadow-sm" : "bg-muted-foreground/40"}`}></div>
                        </div>
                      )}
                      <span className="truncate flex-1">{sub.label}</span>
                      {sub.badge && <PendingVerificationBadge />}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
