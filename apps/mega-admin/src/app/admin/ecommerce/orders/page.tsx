import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Package, Search, Filter, ArrowRight, Clock, CheckCircle2, Truck } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EcommerceOrdersPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("saas_session")?.value;
  if (!sessionCookie) redirect("/login");

  // Mevcut kullanıcının firmasını bul (Demo için ilk aktif firmayı alıyoruz, gerçekte session payload'dan gelir)
  const firm = await prisma.firm.findFirst({
    where: { isActive: true },
    include: {
      package: true,
    }
  });

  if (!firm) return <div>Firma bulunamadı.</div>;

  // Firmanın e-ticaret paketi var mı kontrol et
  let activeFeatures: string[] = [];
  try {
    if (firm.package?.features) activeFeatures = JSON.parse(firm.package.features);
  } catch (e) {}

  if (!activeFeatures.includes("MOD_ECOMMERCE_ORDERS")) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto text-center mt-20">
        <div className="w-24 h-24 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-4">E-Ticaret Modülü Aktif Değil</h2>
        <p className="text-slate-500 mb-8">Bu firmaya ait E-Ticaret ve Siparix Yönetimi (OMS) modülü aktif değildir. Özelliği kullanmak için Enterprise pakete geçix yapmalısınız.</p>
        <Link href="/admin/advanced-settings" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors">
          Paket Ayarlarına Git
        </Link>
      </div>
    );
  }

  // Eğer yetkisi varsa, siparixleri getir
  const orders = await prisma.order.findMany({
    where: { FirmId: firm.id },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-600" />
            E-Ticaret Siparixleri
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            B2B ve B2C siparixlerinizi, kargo takiplerini ve iade (RMA) süreçlerini buradan yönetin.
          </p>
        </div>
      </div>

      {/* Siparix Listesi */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Arama ve Filtreler */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Siparix No, Müxteri veya Telefon ara..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 w-full md:w-auto justify-center">
            <Filter className="w-4 h-4" />
            Filtrele
          </button>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Siparix No</th>
                <th className="px-6 py-4">Müxteri</th>
                <th className="px-6 py-4">Tutar</th>
                <th className="px-6 py-4">Ödeme</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4 text-right">İxlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Henüz hiç siparixiniz bulunmuyor.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {order.user.firstName} {order.user.lastName}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {order.totalAmount.toLocaleString("tr-TR")}  
                    </td>
                    <td className="px-6 py-4">
                      {order.paymentStatus === "PAID" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Ödendi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                          <Clock className="w-3 h-3" /> Bekliyor
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {order.status === "PENDING" && <span className="text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg text-xs font-medium">Yeni Siparix</span>}
                      {order.status === "PROCESSING" && <span className="text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg text-xs font-medium">Hazırlanıyor</span>}
                      {order.status === "SHIPPED" && <span className="text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1"><Truck className="w-3 h-3"/> Kargoda</span>}
                      {order.status === "DELIVERED" && <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg text-xs font-medium">Teslim Edildi</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/ecommerce/orders/${order.id}`}
                        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
