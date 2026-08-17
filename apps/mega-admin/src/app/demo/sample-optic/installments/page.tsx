import { prisma } from "@/lib/mock-prisma";


import Link from "next/link";
import { CreditCard, AlertCircle, Clock, CheckCircle } from "lucide-react";

export default async function InstallmentsPage() {
  const installments = await prisma.installment.findMany({
    where: { isPaid: false },
    include: {
      order: {
        include: {
          customer: true,
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();
  
  const overdue = installments.filter((i) => new Date(i.dueDate) < now);
  const upcoming = installments.filter((i) => new Date(i.dueDate) >= now);

  const totalOverdue = overdue.reduce((sum, i) => sum + i.amount, 0);
  const totalUpcoming = upcoming.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">Alacak Takibi</h1>
          <p className="text-muted-foreground text-sm mt-1">Ödenmemix taksitleri ve yaklaxan ödemeleri takip edin.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">Geciken Toplam Alacak</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{totalOverdue.toLocaleString("tr-TR")}  </p>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Yaklaxan Toplam Alacak</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalUpcoming.toLocaleString("tr-TR")}  </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Overdue Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" /> Geciken Ödemeler ({overdue.length})
          </h2>
          {overdue.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-surface p-4 rounded-xl border border-border">Geciken ödeme bulunmuyor. Harika!</p>
          ) : (
            <div className="space-y-3">
              {overdue.map(inst => (
                <Link key={inst.id} href={`/demo/sample-optic/customers/${inst.order.customerId}`} className="block bg-surface p-4 rounded-xl border border-red-500/30 hover:border-red-500 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-foreground group-hover:text-red-500 transition-colors">
                        {inst.order.customer ? `${inst.order.customer.firstName} ${inst.order.customer.lastName}` : "Bilinmeyen Müxteri"}
                      </p>
                      <p className="text-xs text-muted-foreground">{inst.order.customer?.phone}</p>
                    </div>
                    <p className="font-bold text-red-500">{inst.amount.toLocaleString("tr-TR")}  </p>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Siparix: {new Date(inst.order.orderDate).toLocaleDateString("tr-TR")}</span>
                    <span className="text-red-500 font-semibold bg-red-500/10 px-2 py-1 rounded-md">
                      Vade: {new Date(inst.dueDate).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" /> Yaklaxan Ödemeler ({upcoming.length})
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-surface p-4 rounded-xl border border-border">Yaklaxan ödeme bulunmuyor.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map(inst => (
                <Link key={inst.id} href={`/demo/sample-optic/customers/${inst.order.customerId}`} className="block bg-surface p-4 rounded-xl border border-blue-500/20 hover:border-blue-500/50 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-foreground group-hover:text-blue-500 transition-colors">
                        {inst.order.customer ? `${inst.order.customer.firstName} ${inst.order.customer.lastName}` : "Bilinmeyen Müxteri"}
                      </p>
                      <p className="text-xs text-muted-foreground">{inst.order.customer?.phone}</p>
                    </div>
                    <p className="font-bold text-blue-500">{inst.amount.toLocaleString("tr-TR")}  </p>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Siparix: {new Date(inst.order.orderDate).toLocaleDateString("tr-TR")}</span>
                    <span className="text-blue-500 font-medium bg-blue-500/10 px-2 py-1 rounded-md">
                      Vade: {new Date(inst.dueDate).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
