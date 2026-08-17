import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import Link from "next/link";
import FirmRow from "./FirmRow";
export const dynamic = "force-dynamic";

export default async function FirmsPage() {
  const firms = await prisma.firm.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { customers: true, users: true },
      },
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Müxteriler & Firmalar</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Sistemi kullanan optik, e-ticaret ve tüm firmaların detaylı listesi.</p>
        </div>
        <Link href="/super-admin/firms/new" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Yeni Firma
        </Link>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Firma Adı & Sektör</th>
                <th className="px-6 py-4 font-semibold">Domain</th>
                <th className="px-6 py-4 font-semibold">Abonelik Paketi / Modüller</th>
                <th className="px-6 py-4 font-semibold">Kullanılan Alan (Supabase)</th>
                <th className="px-6 py-4 font-semibold">Durum</th>
                <th className="px-6 py-4 font-semibold text-right">İxlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {firms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Sistemde henüz kayıtlı hiçbir firma bulunmuyor.
                  </td>
                </tr>
              ) : (
                firms.map((firm) => {
                  // Simulate Supabase MB usage based on record count (e.g. 0.45 MB per record base + fixed base 1.2 MB)
                  const mbUsage = (1.2 + (firm._count.customers * 0.45)).toFixed(2);
                  return <FirmRow key={firm.id} firm={firm} mbUsage={mbUsage} />;
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
