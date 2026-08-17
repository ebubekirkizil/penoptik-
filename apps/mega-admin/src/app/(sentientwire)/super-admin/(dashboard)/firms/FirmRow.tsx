"use client";

import { useRouter } from "next/navigation";
import { Building2, Globe, Server, Settings, Package, HardDrive, Trash2 } from "lucide-react";
import Link from "next/link";

import { deleteFirmAction } from "./actions";

export default function FirmRow({ firm, mbUsage }: { firm: any, mbUsage: string }) {
  const router = useRouter();

  return (
    <tr 
      onDoubleClick={() => router.push(`/super-admin/firms/${firm.id}`)}
      className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
      title="Firma detaylarını görmek için çift tıklayın"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 flex-shrink-0 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            {firm.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{firm.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sektör: {firm.sector}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        {firm.domain ? (
          <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
            <Globe className="w-3.5 h-3.5" />
            {firm.domain}
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5 text-xs font-medium">
            <Server className="w-3.5 h-3.5" /> Alt Alan Adı (Subdomain)
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {firm.subscriptionPlan || "Enterprise Suite"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {(() => {
              try {
                const modules = firm.activeModules ? JSON.parse(firm.activeModules) : [];
                if (!Array.isArray(modules) || modules.length === 0) return <span className="text-[10px] text-slate-400">Modül Yok</span>;
                
                return modules.map((mod: string) => {
                  let label = mod;
                  let bg = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
                  if (mod === "finance") { label = "Finans"; bg = "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"; }
                  if (mod === "inventory") { label = "Stok Takibi"; bg = "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"; }
                  if (mod === "hr") { label = "İK"; bg = "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"; }
                  
                  return (
                    <span key={mod} className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${bg}`}>
                      {label}
                    </span>
                  );
                });
              } catch (e) {
                return null;
              }
            })()}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-amber-500" />
          <span className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">
            {mbUsage} MB
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 ml-6">{firm._count.customers} Kayıt</p>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          firm.isActive 
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/10 text-red-600 dark:text-red-400"
        }`}>
          {firm.isActive ? "Aktif" : "Pasif"}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link 
            href={`/super-admin/firms/${firm.id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            title="Detay / Ayarlar"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              if (confirm("Bu firmayı silmek istediğinize emin misiniz?")) {
                await deleteFirmAction(firm.id);
              }
            }}
            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors inline-flex bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            title="Firmayı Sil"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
