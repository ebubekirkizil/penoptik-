// @ts-nocheck
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Package, List, AlertTriangle, ArrowUpDown, Truck, ChevronDown, Settings } from "lucide-react";
import { useState, useEffect, Suspense } from "react";

const inventorySubItems = [
  { tab: "INVENTORY",  icon: List,          label: "Envanter Listesi" },
  { tab: "CRITICAL",   icon: AlertTriangle, label: "Kritik Stoklar" },
  { tab: "MOVEMENTS",  icon: ArrowUpDown,   label: "Stok Hareketleri" },
  { tab: "SUPPLIERS",  icon: Truck,         label: "Tedarikçi Yönetimi" },
  { tab: "SETTINGS",   icon: Settings,      label: "Ayarlar" },
];

function InventorySidebarGroupInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInventoryActive = pathname.startsWith("/demo/sample-optic/inventory");
  const [open, setOpen] = useState(isInventoryActive);
  const activeTab = searchParams.get("tab") || "INVENTORY";

  useEffect(() => {
    if (isInventoryActive) setOpen(true);
  }, [isInventoryActive]);

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group ${
          isInventoryActive
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:text-primary hover:bg-primary/8"
        }`}
      >
        <Package
          className={`w-[18px] h-[18px] flex-shrink-0 transition-transform ${
            isInventoryActive ? "text-primary" : "group-hover:scale-110"
          }`}
        />
        <span className="flex-1 text-left truncate">Stok Takibi</span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="ml-3 mt-1 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-0.5">
          {inventorySubItems.map(item => {
            const isActive = isInventoryActive && activeTab === item.tab;
            const Icon = item.icon;
            return (
              <Link
                key={item.tab}
                href={`/demo/sample-optic/inventory?tab=${item.tab}`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/8"
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function InventorySidebarGroup() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground text-sm font-medium">
          <Package className="w-[18px] h-[18px] flex-shrink-0" />
          <span>Stok Takibi</span>
        </div>
      }
    >
      <InventorySidebarGroupInner />
    </Suspense>
  );
}
