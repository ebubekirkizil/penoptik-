import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Users, Package, Glasses, Calendar, Phone, Mail } from "lucide-react";
import { CustomerSearch } from "@/components/CustomerSearch";
import ClickableRow from "@/components/ClickableRow";

const STATUS_CONFIG = {
  PENDING: { label: "Bekliyor", color: "text-amber-500", bg: "bg-amber-500/10" },
  PREPARING: { label: "Hazırlanıyor", color: "text-blue-500", bg: "bg-blue-500/10" },
  READY: { label: "Teslime Hazır", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  DELIVERED: { label: "Teslim Edildi", color: "text-slate-500", bg: "bg-slate-500/10" },
};

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string }> }) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const filter = resolvedParams.filter || "all";

  const whereClause: any = {};

  if (q) {
    whereClause.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filter === "active") {
    whereClause.hasLoggedBefore = true;
  } else if (filter === "inactive") {
    whereClause.hasLoggedBefore = false;
  }

  const customers = await prisma.customer.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    include: {
      _count: { select: { opticOrders: true, prescriptions: true } },
      opticOrders: { take: 1, orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Müxteriler Portalı</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {customers.length} kayıtlı müxteri. CRM, iletixim bilgileri ve geçmix siparix yönetimi.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <CustomerSearch />
          <Link
            href="/admin/customers/new"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 whitespace-nowrap shadow-sm shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yeni Müxteri Ekle</span>
          </Link>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white dark:bg-[#1E293B] shadow-sm rounded-3xl p-16 text-center border border-slate-100 dark:border-slate-800 flex flex-col items-center">
          <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-900 dark:text-white font-black text-xl mb-2">Sistemde Henüz Müxteri Yok</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Yeni bir müxteri kaydı oluxturarak satıxlara ve CRM yönetimine baxlayabilirsiniz.</p>
          <Link href="/admin/customers/new" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-xl font-bold shadow-sm hover:scale-105 transition-transform">
            İlk Müxteriyi Ekle
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E293B] shadow-sm rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-bold">Müxteri / Firma</th>
                  <th className="px-6 py-4 font-bold">İletixim Bilgileri</th>
                  <th className="px-6 py-4 font-bold">Son Siparix Durumu</th>
                  <th className="px-6 py-4 font-bold">Kayıtlı Veri</th>
                  <th className="px-6 py-4 font-bold text-right">İxlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customers.map((customer) => {
                  const lastOrder = customer.opticOrders[0];
                  const cfg = lastOrder ? STATUS_CONFIG[lastOrder.status as keyof typeof STATUS_CONFIG] : null;
                  
                  return (
                    <ClickableRow 
                      key={customer.id} 
                      href={`/admin/customers/${customer.id}`}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {customer.firstName} {customer.lastName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              Bireysel Müxteri
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.phone}
                          </p>
                          {customer.email && (
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-slate-400" /> {customer.email}
                            </p>
                          )}
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
                          <span className="text-xs text-slate-400 italic">Siparix Yok</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            <Package className="w-3.5 h-3.5 text-slate-400" /> {customer._count.opticOrders} Siparix
                          </span>
                          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            <Glasses className="w-3.5 h-3.5 text-slate-400" /> {customer._count.prescriptions} Reçete
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/admin/customers/${customer.id}`} 
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Detay
                          </Link>
                        </div>
                      </td>
                    </ClickableRow>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
