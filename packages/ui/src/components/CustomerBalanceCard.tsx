"use client";

import { useState } from "react";

interface CustomerBalanceCardProps {
  orders: any[];
}

export default function CustomerBalanceCard({ orders }: CustomerBalanceCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Toplam kalan ödemeyi hesapla
  const totalBalance = orders.reduce((sum, o) => sum + (o.balance || 0), 0);

  // Gecikmiş taksit var mı kontrol et
  const hasOverdue = orders.some(o => 
    o.installments?.some((inst: any) => 
      !inst.isPaid && new Date(inst.dueDate) < new Date(new Date().setHours(0,0,0,0))
    )
  );

  if (totalBalance <= 0) return null;

  return (
    <div className="space-y-2 animate-fade-in-down">
      <div 
        onDoubleClick={() => setExpanded(prev => !prev)}
        title="Ödeme geçmişini ve taksitleri görmek için çift tıklayın"
        className={`border shadow-sm rounded-2xl p-4 flex items-center justify-between cursor-pointer select-none transition-colors ${
          hasOverdue 
            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/30" 
            : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/30"
        }`}
      >
        <div>
          <p className={`font-bold text-sm uppercase tracking-wide ${hasOverdue ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>
            Kalan Ödeme
          </p>
          <p className={`text-xs mt-1 ${hasOverdue ? "text-red-700 dark:text-red-300" : "text-blue-700 dark:text-blue-300"}`}>
            Devam eden veya geçmiş siparişlerinizden kalan toplam bakiye.
          </p>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-black ${hasOverdue ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>
            {totalBalance.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="bg-surface/50 border border-border-color rounded-2xl p-4 space-y-4 animate-fade-in-down">
          <h4 className="text-sm font-bold text-foreground">Ödeme & Taksit Planları</h4>
          
          {orders.filter(o => o.installments && o.installments.length > 0).length === 0 ? (
            <p className="text-xs text-muted-foreground">Sistemde kayıtlı taksit planı bulunamadı.</p>
          ) : (
            <div className="space-y-4">
              {orders.filter(o => o.installments && o.installments.length > 0).map(order => (
                <div key={order.id} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground border-b border-border-color pb-1">
                    <span>{order.products || "Sipariş"} - {new Date(order.orderDate).toLocaleDateString("tr-TR")}</span>
                    <span>Kalan: {order.balance?.toLocaleString("tr-TR")} ₺</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {order.installments.map((inst: any) => {
                      const isOverdue = !inst.isPaid && new Date(inst.dueDate) < new Date(new Date().setHours(0,0,0,0));
                      let bgClass = "bg-surface";
                      let borderClass = "border-border-color";
                      let textClass = "text-foreground";
                      let statusText = "Bekliyor";
                      
                      if (inst.isPaid) {
                        bgClass = "bg-emerald-500/10";
                        borderClass = "border-emerald-500/20";
                        textClass = "text-emerald-600 dark:text-emerald-400";
                        statusText = "Ödendi";
                      } else if (isOverdue) {
                        bgClass = "bg-red-500/10";
                        borderClass = "border-red-500/30";
                        textClass = "text-red-600 dark:text-red-400";
                        statusText = "Gecikmiş";
                      } else {
                        bgClass = "bg-blue-500/10";
                        borderClass = "border-blue-500/30";
                        textClass = "text-blue-600 dark:text-blue-400";
                      }

                      return (
                        <div key={inst.id} className={`flex items-center justify-between p-2 rounded-lg border ${bgClass} ${borderClass}`}>
                          <div>
                            <span className={`text-xs font-bold ${textClass}`}>{inst.amount.toLocaleString("tr-TR")} ₺</span>
                            <div className={`text-[10px] ${textClass} opacity-80`}>{statusText}</div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground">{new Date(inst.dueDate).toLocaleDateString("tr-TR")}</span>
                            {inst.isPaid && inst.paidAt && (
                              <div className="text-[10px] text-emerald-500">
                                Ödendi: {new Date(inst.paidAt).toLocaleDateString("tr-TR")}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
