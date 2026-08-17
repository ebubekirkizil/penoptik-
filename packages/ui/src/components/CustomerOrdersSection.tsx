// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Package, ClipboardList, Clock, CheckCircle, Check,
  CreditCard, Calendar, AlertCircle, X, ChevronRight, Hash
} from "lucide-react";

interface Prescription {
  farRightSph: string | null;
  farRightCyl: string | null;
  farRightAx: string | null;
  farLeftSph: string | null;
  farLeftCyl: string | null;
  farLeftAx: string | null;
  pdRight: string | null;
  pdLeft: string | null;
  pdTotal: string | null;
  phRight: string | null;
  phLeft: string | null;
  
  lensType: string | null;
}

interface Installment {
  id: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidAt?: string | null;
}

interface Order {
  id: string;
  status: string;
  products: string | null;
  productCode: string | null;
  totalPrice: number | null;
  deposit: number | null;
  balance: number | null;
  orderDate: any;
  deliveryDate: any;
  prescription?: Prescription | null;
  installments?: Installment[];
}

interface CustomerOrdersSectionProps {
  orders: Order[];
}

const STATUS_LABELS: Record<string, { label: string; icon: React.ReactNode; class: string; step: number }> = {
  PENDING:   { label: "Sipariş Alındı",  icon: <ClipboardList className="w-4 h-4" />, class: "status-pending",   step: 1 },
  PREPARING: { label: "Hazırlanıyor",    icon: <Clock className="w-4 h-4" />,         class: "status-preparing", step: 2 },
  READY:     { label: "Teslime Hazır",   icon: <CheckCircle className="w-4 h-4" />,   class: "status-ready",     step: 3 },
  DELIVERED: { label: "Teslim Edildi",   icon: <Check className="w-4 h-4" />,         class: "status-delivered", step: 4 },
};

const STEPS = ["Sipariş Alındı", "Hazırlanıyor", "Teslime Hazır", "Teslim Edildi"];

export default function CustomerOrdersSection({ orders }: CustomerOrdersSectionProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInstallments, setShowInstallments] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (orders.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center border border-border-color animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <Package className="w-12 h-12 text-primary mx-auto mb-3" />
        <p className="text-foreground font-semibold">Henüz siparişiniz bulunmuyor</p>
        <p className="text-muted-foreground text-sm mt-1">Sipariş oluşturulduğunda burada görünecek.</p>
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.status !== "DELIVERED");
  const showOrders = activeOrders.length > 0 ? activeOrders : [orders[0]]; // fallback to newest delivered if no active

  const hasOverdue = selectedOrder?.installments?.some(inst => !inst.isPaid && new Date(inst.dueDate) < new Date(new Date().setHours(0,0,0,0)));

  return (
    <div className="space-y-4">
      {/* Active / Featured Orders */}
      <div className="space-y-4">
        {showOrders.map((order, index) => {
          const status = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;
          const isActive = order.status !== "DELIVERED";

          return (
            <div
              key={order.id}
              onClick={() => { setSelectedOrder(order); setShowInstallments(false); }}
              className="glass rounded-2xl p-6 border border-border-color space-y-5 animate-fade-in-up cursor-pointer hover:border-primary/40 hover:bg-surface/5 dark:hover:bg-white/5 transition-all card-hover"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">
                    {isActive ? `Aktif Sipariş (${index + 1}/${activeOrders.length})` : "Son Sipariş"}
                  </p>
                  <h3 className="text-foreground font-bold text-lg flex items-center gap-2">
                    Sipariş Durumu <span className="text-xs text-muted-foreground font-normal">(Detay için tıkla)</span>
                  </h3>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${status.class}`}>
                  {status.icon} {status.label}
                </span>
              </div>

              {/* Step Progress */}
              <div className="relative pt-2">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-4 left-4 right-4 h-1 bg-border-color -z-0 rounded-full" />
                  <div
                    className="absolute top-4 left-4 h-1 -z-0 transition-all duration-1000 rounded-full"
                    style={{
                      width: `calc(${((status.step - 1) / 3) * 100}% - 8px)`,
                      background: `linear-gradient(to right, var(--primary), var(--secondary))`,
                      boxShadow: "0 0 10px var(--primary)",
                    }}
                  />
                  {STEPS.map((stepLabel, i) => {
                    const stepNum = i + 1;
                    const isCompleted = stepNum <= status.step;
                    const isCurrent = stepNum === status.step;
                    return (
                      <div key={stepLabel} className="flex flex-col items-center gap-2 flex-1 relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all border-2 ${
                          isCompleted
                            ? "gradient-primary text-[#1B242A] border-transparent glow-primary scale-110"
                            : "bg-surface text-muted-foreground border-border-color"
                        } ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}`}>
                          {isCompleted ? <Check className="w-4 h-4 stroke-[3px]" /> : stepNum}
                        </div>
                        <span className={`text-[10px] text-center leading-tight font-black px-1 uppercase tracking-wider ${
                          isCompleted ? "text-primary font-bold" : "text-muted-foreground"
                        }`}>
                          {stepLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Info summary */}
              <div className="space-y-3">
                {order.products && (
                  <div className="bg-surface/60 rounded-xl px-4 py-3 border border-border-color flex justify-between items-center group">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1 font-semibold">Ürünler</p>
                      <p className="text-foreground font-semibold text-sm truncate max-w-sm">
                        {order.products} {order.productCode && `(${order.productCode})`}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                )}

                <div className="bg-surface/60 rounded-xl p-3 border border-border-color flex justify-between items-center">
                  <div className="flex-1 text-center border-r border-border-color">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Toplam</p>
                    <p className="text-sm font-semibold">{order.totalPrice?.toLocaleString("tr-TR")} ₺</p>
                  </div>
                  <div className="flex-1 text-center border-r border-border-color">
                    <p className="text-[10px] uppercase font-bold text-emerald-500/80">Ödenen</p>
                    <p className="text-sm font-semibold text-emerald-500">{order.deposit?.toLocaleString("tr-TR")} ₺</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-[10px] uppercase font-bold text-blue-500/80">Kalan</p>
                    <p className="text-sm font-semibold text-blue-500">{order.balance?.toLocaleString("tr-TR")} ₺</p>
                  </div>
                </div>

                {order.installments && order.installments.length > 0 && (
                  <div className="bg-surface/40 rounded-xl p-3 border border-border-color space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Taksit Planı</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {order.installments.map((inst, idx) => {
                        const isOverdue = !inst.isPaid && new Date(inst.dueDate) < new Date(new Date().setHours(0,0,0,0));
                        let textClass = inst.isPaid ? "text-emerald-500" : isOverdue ? "text-red-500" : "text-blue-500";
                        return (
                          <div key={idx} className="flex justify-between items-center bg-background/50 p-2 rounded border border-border-color/50">
                            <div>
                              <span className={`text-xs font-bold ${textClass}`}>{inst.amount.toLocaleString("tr-TR")} ₺</span>
                              <div className={`text-[9px] ${textClass} opacity-80`}>{inst.isPaid ? "Ödendi" : isOverdue ? "Gecikmiş" : "Bekliyor"}</div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-muted-foreground">{new Date(inst.dueDate).toLocaleDateString("tr-TR")}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order History */}
      {orders.length > 1 && (
        <div className="glass rounded-2xl border border-border-color animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
          <div className="px-6 py-4 border-b border-border-color">
            <h3 className="text-foreground font-bold">Sipariş Geçmişi</h3>
          </div>
          <div className="divide-y divide-border-color">
            {orders.map((order) => {
              const cfg = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;
              return (
                <div
                  key={order.id}
                  onClick={() => { setSelectedOrder(order); setShowInstallments(false); }}
                  className="px-6 py-4 flex items-center justify-between hover:bg-surface/5 dark:hover:bg-white/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div>
                    <p className="text-foreground text-sm font-semibold group-hover:text-primary transition-colors">{order.products || "Sipariş"}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {new Date(order.orderDate).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.totalPrice != null && (
                      <span className="text-foreground font-semibold text-sm">{order.totalPrice.toLocaleString("tr-TR")} ₺</span>
                    )}
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${cfg.class}`}>
                      {cfg.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Order Modal */}
      {mounted && selectedOrder && createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" style={{ zIndex: 99999 }}>
          <div className="bg-surface border border-border-color rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
            <div className="p-4 border-b border-border-color flex items-center justify-between">
              <h2 className="text-foreground font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Sipariş Detayları
              </h2>
              <button onClick={() => { setSelectedOrder(null); setShowInstallments(false); }} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {/* Product Info */}
              {/* Product Info */}
              <div className="space-y-1">
                <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Ürün Bilgisi</p>
                <h4 className="text-foreground font-semibold text-sm sm:text-base leading-tight">{selectedOrder.products}</h4>
                {selectedOrder.productCode && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Hash className="w-3.5 h-3.5" />
                    <span>Ürün Kodu: <strong className="text-foreground">{selectedOrder.productCode}</strong></span>
                  </div>
                )}
              </div>

              {/* Financial values */}
              <div className="flex flex-col sm:flex-row bg-surface/30 rounded-xl border border-border-color divide-y sm:divide-y-0 sm:divide-x divide-border-color overflow-hidden">
                <div className="flex-1 p-3 text-center sm:text-left flex flex-row sm:flex-col justify-between items-center sm:items-start">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Toplam Tutar</p>
                  <p className="text-foreground font-black text-sm">{selectedOrder.totalPrice?.toLocaleString("tr-TR")} ₺</p>
                </div>
                <div className="flex-1 p-3 text-center sm:text-left flex flex-row sm:flex-col justify-between items-center sm:items-start">
                  <p className="text-[10px] text-emerald-500/80 font-bold uppercase">Alınan Ödeme</p>
                  <p className="text-emerald-500 font-black text-sm">{selectedOrder.deposit?.toLocaleString("tr-TR")} ₺</p>
                </div>
                <div 
                  onDoubleClick={() => setShowInstallments(prev => !prev)}
                  title="Taksitleri görmek için çift tıklayın"
                  className={`flex-1 p-3 text-center sm:text-left flex flex-row sm:flex-col justify-between items-center sm:items-start select-none cursor-pointer transition-colors ${
                    selectedOrder.balance && selectedOrder.balance > 0 
                      ? hasOverdue 
                        ? "bg-red-500/10 hover:bg-red-500/20" 
                        : "bg-blue-500/10 hover:bg-blue-500/20" 
                      : "bg-emerald-500/5 hover:bg-emerald-500/10"
                  }`}
                >
                  <p className={`text-[10px] font-bold uppercase ${
                    selectedOrder.balance && selectedOrder.balance > 0 
                      ? hasOverdue 
                        ? "text-red-500/80" 
                        : "text-blue-500/80" 
                      : "text-emerald-500/80"
                  }`}>
                    {selectedOrder.balance && selectedOrder.balance > 0 ? "Kalan Ödeme" : "Ödeme Durumu"}
                  </p>
                  <p className={`font-black text-sm ${
                    selectedOrder.balance && selectedOrder.balance > 0 
                      ? hasOverdue 
                        ? "text-red-600 dark:text-red-400" 
                        : "text-blue-600 dark:text-blue-400" 
                      : "text-emerald-500"
                  }`}>
                    {selectedOrder.balance && selectedOrder.balance > 0 ? `${selectedOrder.balance.toLocaleString("tr-TR")} ₺` : "Ödendi ✓"}
                  </p>
                </div>
              </div>

              {/* Status and Dates */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center justify-between sm:flex-col sm:items-start sm:justify-start bg-surface/30 p-3 rounded-xl border border-border-color">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-muted-foreground sm:mb-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>Sipariş Tarihi</span>
                  </div>
                  <p className="text-foreground text-sm font-semibold">
                    {new Date(selectedOrder.orderDate).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-between sm:flex-col sm:items-start sm:justify-start bg-surface/30 p-3 rounded-xl border border-border-color">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-muted-foreground sm:mb-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tahmini Teslim</span>
                  </div>
                  <p className="text-foreground text-sm font-semibold">
                    {selectedOrder.deliveryDate
                      ? new Date(selectedOrder.deliveryDate).toLocaleDateString("tr-TR")
                      : "Hazırlanıyor"
                    }
                  </p>
                </div>
              </div>

              {/* Installments (Taksitler) */}
              {showInstallments && selectedOrder.installments && selectedOrder.installments.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-border-color">
                  <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Taksit Planı</p>
                  <div className="space-y-2">
                    {selectedOrder.installments.map((inst, idx) => {
                      const isOverdue = !inst.isPaid && new Date(inst.dueDate) < new Date(new Date().setHours(0,0,0,0));
                      const isNext = !inst.isPaid && !isOverdue; 
                      
                      let bgClass = "bg-surface/30";
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
                      } else if (isNext) {
                        bgClass = "bg-blue-500/10";
                        borderClass = "border-blue-500/30";
                        textClass = "text-blue-600 dark:text-blue-400";
                        statusText = "Ödenecek";
                      }
                      
                      return (
                        <div key={inst.id} className={`flex items-center justify-between p-3 rounded-xl border ${bgClass} ${borderClass}`}>
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${inst.isPaid ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-background text-muted-foreground border border-border-color'}`}>
                              {idx + 1}
                            </span>
                            <div>
                              <p className={`text-xs font-semibold ${textClass}`}>{statusText}</p>
                              <p className="text-[10px] text-muted-foreground">{new Date(inst.dueDate).toLocaleDateString("tr-TR")}</p>
                            </div>
                          </div>
                          <div className={`font-bold text-sm ${textClass}`}>
                            {inst.amount.toLocaleString("tr-TR")} ₺
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Linked Prescription Details (Göz Ölçümleri) */}
              {selectedOrder.prescription && (
                <div className="space-y-3 pt-3 border-t border-border-color">
                  <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Göz Ölçümleri</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Right */}
                    <div className="flex-1 bg-surface/30 border border-border-color rounded-xl overflow-hidden">
                      <div className="bg-primary/5 px-3 py-1.5 border-b border-border-color">
                        <p className="text-primary text-[10px] font-bold">SAĞ GÖZ</p>
                      </div>
                      <div className="grid grid-cols-3 divide-x divide-border-color text-center">
                        <div className="p-2">
                          <span className="text-[9px] text-muted-foreground block mb-0.5">SPH</span>
                          <span className="font-semibold text-xs text-foreground">{selectedOrder.prescription.farRightSph || "—"}</span>
                        </div>
                        <div className="p-2">
                          <span className="text-[9px] text-muted-foreground block mb-0.5">CYL</span>
                          <span className="font-semibold text-xs text-foreground">{selectedOrder.prescription.farRightCyl || "—"}</span>
                        </div>
                        <div className="p-2">
                          <span className="text-[9px] text-muted-foreground block mb-0.5">AX</span>
                          <span className="font-semibold text-xs text-foreground">{selectedOrder.prescription.farRightAx || "—"}</span>
                        </div>
                      </div>
                    </div>
                    {/* Left */}
                    <div className="flex-1 bg-surface/30 border border-border-color rounded-xl overflow-hidden">
                      <div className="bg-amber-500/5 px-3 py-1.5 border-b border-border-color">
                        <p className="text-amber-600 dark:text-amber-400 text-[10px] font-bold">SOL GÖZ</p>
                      </div>
                      <div className="grid grid-cols-3 divide-x divide-border-color text-center">
                        <div className="p-2">
                          <span className="text-[9px] text-muted-foreground block mb-0.5">SPH</span>
                          <span className="font-semibold text-xs text-foreground">{selectedOrder.prescription.farLeftSph || "—"}</span>
                        </div>
                        <div className="p-2">
                          <span className="text-[9px] text-muted-foreground block mb-0.5">CYL</span>
                          <span className="font-semibold text-xs text-foreground">{selectedOrder.prescription.farLeftCyl || "—"}</span>
                        </div>
                        <div className="p-2">
                          <span className="text-[9px] text-muted-foreground block mb-0.5">AX</span>
                          <span className="font-semibold text-xs text-foreground">{selectedOrder.prescription.farLeftAx || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* PD / PH / Lens Type details neatly packed */}
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {(selectedOrder.prescription.pdRight || selectedOrder.prescription.pdLeft || selectedOrder.prescription.pdTotal) && <div className="bg-surface/50 border border-border-color px-2.5 py-1 rounded-md">PD: <strong className="text-foreground">Sağ {selectedOrder.prescription.pdRight || "-"} / Sol {selectedOrder.prescription.pdLeft || "-"} / Toplam {selectedOrder.prescription.pdTotal || "-"}</strong></div>}
                    {(selectedOrder.prescription.phRight || selectedOrder.prescription.phLeft) && <div className="bg-surface/50 border border-border-color px-2.5 py-1 rounded-md">PH: <strong className="text-foreground">Sağ {selectedOrder.prescription.phRight || "-"} / Sol {selectedOrder.prescription.phLeft || "-"}</strong></div>}
                    {selectedOrder.prescription.lensType && <div className="bg-surface/50 border border-border-color px-2.5 py-1 rounded-md">Cam: <strong className="text-foreground">{selectedOrder.prescription.lensType}</strong></div>}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border-color flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-background border border-border-color text-foreground rounded-xl text-sm font-semibold hover:bg-surface/5 dark:hover:bg-white/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
