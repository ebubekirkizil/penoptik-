// @ts-nocheck
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { 
  Package, ArrowLeft, Truck, CheckCircle2, 
  CreditCard, MapPin, Receipt, Clock, FileText 
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";



export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("saas_session")?.value;
  if (!sessionCookie) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id: id },
    include: {
      user: true,
      address: true,
      items: {
        include: {
          product: true,
          variant: true,
        }
      },
      fulfillments: true,
      refunds: true,
      eventLogs: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!order) return notFound();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto  pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/ecommerce/orders" className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Sipariş #{order.orderNumber}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm flex items-center gap-2">
              {new Date(order.createdAt).toLocaleString("tr-TR")}
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
              {order.orderType === "B2B" ? "Toptan / Bayi Siparişi" : "B2C Perakende Siparişi"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
            <Receipt className="w-4 h-4" /> E-Fatura Kes
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white border border-transparent rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Truck className="w-4 h-4" /> Kargo Etiketi (Fulfillment)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon: Ürünler ve Ödeme Detayları */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Sipariş Kalemleri */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-500" /> Sipariş İçeriği
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
                    {item.product.imageUrls?.[0] && (
                      <img src={item.product.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{item.product.name}</p>
                    {item.variant && (
                      <p className="text-sm text-slate-500 mt-1">{item.variant.name}</p>
                    )}
                    <div className="text-sm text-slate-500 mt-1 flex justify-between items-center">
                      <span>{item.quantity} adet x {item.price.toLocaleString("tr-TR")} ₺</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{(item.quantity * item.price).toLocaleString("tr-TR")} ₺</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Finans Özeti */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" /> Finansal Özet
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Ara Toplam</span>
                <span>{order.subtotal.toLocaleString("tr-TR")} ₺</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Kargo Bedeli</span>
                <span>{order.shippingCost.toLocaleString("tr-TR")} ₺</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>İndirim</span>
                <span className="text-red-500">- {order.discountAmount.toLocaleString("tr-TR")} ₺</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Vergi (KDV)</span>
                <span>{order.taxAmount.toLocaleString("tr-TR")} ₺</span>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-base font-bold text-slate-900 dark:text-white">
                <span>Genel Toplam</span>
                <span>{order.totalAmount.toLocaleString("tr-TR")} ₺</span>
              </div>
            </div>
            
            {order.paymentStatus === "PAID" && (
              <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Ödeme Başarılı</p>
                  {order.paytrMerchantOid && (
                    <p className="text-xs text-emerald-600/80 mt-0.5">PayTR OID: {order.paytrMerchantOid}</p>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Sağ Kolon: Müşteri, Adres ve Durum */}
        <div className="space-y-8">
          
          {/* Müşteri Bilgileri */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-500" /> Müşteri & Teslimat
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Müşteri</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {order.user.firstName} {order.user.lastName}
                </p>
                <p className="text-slate-600">{order.user.email}</p>
              </div>
              {order.address && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-slate-500 mb-1">Teslimat Adresi</p>
                  <p className="font-medium text-slate-900 dark:text-white">{order.address.title}</p>
                  <p className="text-slate-600">{order.address.address}</p>
                  <p className="text-slate-600">{order.address.district} / {order.address.city}</p>
                  <p className="text-slate-600 mt-1">{order.address.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Audit Log / Sipariş Geçmişi */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" /> İşlem Geçmişi
            </h2>
            <div className="space-y-4">
              {order.eventLogs.length > 0 ? (
                order.eventLogs.map(log => (
                  <div key={log.id} className="flex gap-3 text-sm">
                    <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{log.action}</p>
                      <p className="text-slate-500">{log.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(log.createdAt).toLocaleString("tr-TR")}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Henüz log kaydı bulunmuyor.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
