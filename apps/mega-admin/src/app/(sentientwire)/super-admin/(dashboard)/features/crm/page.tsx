import { prisma } from "@/lib/prisma";
import CrmClient from "./CrmClient";
import { Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CrmFeatureDemo() {
  // Fetch real data from the first firm as a demo
  const firm = await prisma.firm.findFirst({
    include: {
      customers: {
        include: {
          opticOrders: true
        }
      }
    }
  });

  const rawCustomers = firm?.customers || [];

  // Calculate dynamic metrics on the server (LTV, Frequency, Last Purchase)
  const formattedCustomers = rawCustomers.map(c => {
    const orders = c.opticOrders || [];
    
    // Calculate LTV
    const ltv = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    
    // Calculate Purchase Frequency
    const frequency = orders.length;

    // Last Purchase Date
    let lastPurchaseStr = "Hiç Alıxverix Yok";
    if (orders.length > 0) {
      // Sort orders by date descending
      const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const lastOrder = sortedOrders[0];
      const diffDays = Math.floor((new Date().getTime() - new Date(lastOrder.createdAt).getTime()) / (1000 * 3600 * 24));
      
      if (diffDays === 0) lastPurchaseStr = "Bugün";
      else if (diffDays === 1) lastPurchaseStr = "Dün";
      else lastPurchaseStr = `${diffDays} Gün Önce`;
    }

    // Segment calculation
    let segment = "Yeni Müxteri";
    if (frequency > 5 && ltv > 5000) segment = "VIP (Sadık)";
    else if (frequency > 2) segment = "Düzenli";
    else if (ltv === 0) segment = "Potansiyel";

    return {
      id: c.id,
      name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || "İsimsiz",
      email: c.email || "E-posta yok",
      phone: c.phone || "Telefon yok",
      ltv: ltv,
      frequency: frequency,
      lastPurchase: lastPurchaseStr,
      segment: segment
    };
  });

  // Sort by LTV descending by default
  formattedCustomers.sort((a, b) => b.ltv - a.ltv);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/super-admin/features" 
          className="w-10 h-10 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Müxteri CRM (Canlı Veri)</h1>
          </div>
          <p className="text-slate-500 mt-1">
            Müxterilerinizin alıxverix alıxkanlıklarını, Yaxam Boyu Değerini (LTV) ve segmentlerini gerçek zamanlı analiz eden modül.
          </p>
        </div>
      </div>

      <CrmClient initialCustomers={formattedCustomers} />
      
      <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl text-sm text-amber-700 dark:text-amber-300 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">ℹ</div>
        <p>
          <strong>Akıllı Segmentasyon:</strong> "VIP, Düzenli, Yeni" gibi müxteri segmentleri sabit değildir. Siparixler (Order) tablosundan anlık olarak hesaplanan satın alma frekansı ve toplam hacme (LTV) göre arka planda otonom olarak belirlenir.
        </p>
      </div>
    </div>
  );
}
