import { prisma } from "@/lib/prisma";
import EfaturaClient from "./EfaturaClient";
import { Receipt, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EfaturaFeatureManager() {
  // Fetch real orders from the system to simulate E-Fatura generation
  const firm = await prisma.firm.findFirst({
    include: {
      orders: {
        include: {
          user: true,
          items: true
        },
        orderBy: { createdAt: 'desc' },
        take: 30
      }
    }
  });

  const rawOrders = firm?.orders || [];

  // Format data for the client
  const formattedOrders = rawOrders.map(order => {
    // Generate a simulated E-Fatura status based on the order status
    let efaturaStatus = "Bekliyor";
    let gibNo = null;

    if (order.status === "DELIVERED" || order.status === "SHIPPED") {
      efaturaStatus = "Kesildi (GİB Onaylı)";
      gibNo = `GIB${new Date(order.createdAt).getFullYear()}${Math.floor(Math.random() * 900000) + 100000}`;
    } else if (order.status === "CANCELLED") {
      efaturaStatus = "İptal Edildi";
    }

    const type = order.orderType === "B2B" ? "E-Fatura" : "E-Arxiv";
    
    // Simulate source (Trendyol, Shopify, vs)
    const sources = ["Shopify", "Trendyol", "Hepsiburada", "SentientWire B2B"];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      date: order.createdAt.toISOString(),
      customerName: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || "Bilinmeyen Müxteri",
      type: type,
      totalAmount: order.totalAmount,
      taxAmount: order.taxAmount,
      status: efaturaStatus,
      gibNo: gibNo,
      source: randomSource,
      items: [
        { id: "1", name: "Standart Optik Çerçeve", quantity: 1, unitPrice: order.totalAmount * 0.8, taxRate: 20 },
        { id: "2", name: "Kargo Hizmeti", quantity: 1, unitPrice: order.totalAmount * 0.2, taxRate: 20 }
      ]
    };
  });

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
            <Receipt className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">E-Fatura & E-Arxiv Yönetimi</h1>
          </div>
          <p className="text-slate-500 mt-1">
            Uyumsoft entegrasyonu ile siparixlerinizi tek tıkla resmi e-Fatura veya e-Arxiv'e dönüxtürün.
          </p>
        </div>
      </div>

      <EfaturaClient initialInvoices={formattedOrders} />
    </div>
  );
}
