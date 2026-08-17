// @ts-nocheck
"use client";

import { useRouter } from "next/navigation";
import { Package, Glasses, Calendar } from "lucide-react";
import Link from "next/link";

export default function CustomerRow({ customer, cfg, lastOrder, isOptic }: any) {
  const router = useRouter();

  const handleRowClick = () => {
    router.push(`/admin/customers/${customer.id}`);
  };

  return (
    <tr 
      onClick={handleRowClick}
      onDoubleClick={handleRowClick}
      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {customer.firstName} {customer.lastName}
            </p>
            <p className="text-xs text-slate-500">{customer.type === "INDIVIDUAL" ? "Bireysel Müşteri" : "Kurumsal Müşteri"}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            {customer.phone || "-"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        {cfg && lastOrder ? (
          <div className="flex flex-col gap-1 items-start">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {new Date(lastOrder.createdAt).toLocaleDateString("tr-TR")}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Sipariş Yok</span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
            <Package className="w-3.5 h-3.5 text-slate-400" /> {customer._count?.opticOrders || customer._count?.ecommerceOrders || 0} Sipariş
          </span>
          {isOptic && (
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
              <Glasses className="w-3.5 h-3.5 text-slate-400" /> {customer._count?.prescriptions || 0} Reçete
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link 
            href={`/admin/customers/${customer.id}`} 
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
          >
            Detay
          </Link>
        </div>
      </td>
    </tr>
  );
}
