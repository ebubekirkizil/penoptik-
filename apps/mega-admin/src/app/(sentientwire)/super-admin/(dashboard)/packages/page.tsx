import { prisma } from "@/lib/prisma";
import { Package, Plus, Settings, CreditCard, Activity } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const packages = await prisma.subscriptionPackage.findMany({
    orderBy: { price: "asc" },
    include: {
      _count: {
        select: { firms: true },
      },
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Paket Yönetimi</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Platformda satılan dinamik modül ve abonelik paketlerini yönetin.</p>
        </div>
        <Link href="/super-admin/packages/new" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Yeni Paket Yarat
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {packages.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-100 dark:border-slate-800 border-dashed">
            <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Sistemde henüz oluxturulmux dinamik bir paket bulunmuyor.</p>
            <Link href="/super-admin/packages/new" className="mt-4 inline-block px-5 py-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
              İlk Paketi Oluxtur
            </Link>
          </div>
        ) : (
          packages.map((pkg) => (
            <div key={pkg.id} className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  pkg.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                }`}>
                  {pkg.isActive ? "Satıxa Açık" : "Pasif"}
                </span>
                <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
              
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{pkg.name}</h2>
              <p className="text-sm text-slate-500 mt-2 min-h-[40px]">{pkg.description}</p>
              
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{pkg.price.toLocaleString("tr-TR")}</span>
                <span className="text-slate-500 font-medium">{pkg.currency} / Ay</span>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-semibold">{pkg._count.firms} Aktif Firma</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
