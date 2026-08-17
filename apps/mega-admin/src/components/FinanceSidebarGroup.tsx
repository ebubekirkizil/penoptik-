// @ts-nocheck
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Receipt, LayoutDashboard, ListOrdered, Calendar, FileText, Settings, ChevronDown } from "lucide-react";
import { useState, useEffect, Suspense } from "react";

const financeSubItems = [
  { tab: "OVERVIEW",         icon: LayoutDashboard, label: "Genel Bakıx" },
  { tab: "TRANSACTIONS",     icon: ListOrdered,     label: "İxlemler" },
  { tab: "PLANNED_PAYMENTS", icon: Calendar,        label: "Planlı Ödemeler" },
  { tab: "TAX",              icon: FileText,        label: "Vergi Yönetimi" },
  { tab: "SETTINGS",         icon: Settings,        label: "Finans Ayarları" },
];

function FinanceSidebarGroupInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFinanceActive = pathname.startsWith("/demo/sample-optic/finance");
  const [open, setOpen] = useState(isFinanceActive);
  const activeTab = searchParams.get("tab") || "OVERVIEW";

  useEffect(() => {
    if (isFinanceActive) setOpen(true);
  }, [isFinanceActive]);

  return (
    <div>
      {/* Ana Finans Butonu */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group ${
          isFinanceActive
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:text-primary hover:bg-primary/8"
        }`}
      >
        <Receipt
          className={`w-[18px] h-[18px] flex-shrink-0 transition-transform ${
            isFinanceActive ? "text-primary" : "group-hover:scale-110"
          }`}
        />
        <span className="flex-1 text-left truncate">Finans</span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Alt Menü — Accordion */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="ml-3 mt-1 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-0.5">
          {financeSubItems.map(item => {
            const isActive = isFinanceActive && activeTab === item.tab;
            const Icon = item.icon;
            return (
              <Link
                key={item.tab}
                href={`/demo/sample-optic/finance?tab=${item.tab}`}
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

export function FinanceSidebarGroup() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground text-sm font-medium">
          <Receipt className="w-[18px] h-[18px] flex-shrink-0" />
          <span>Finans</span>
        </div>
      }
    >
      <FinanceSidebarGroupInner />
    </Suspense>
  );
}
