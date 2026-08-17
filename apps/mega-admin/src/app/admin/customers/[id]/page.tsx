import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import OrderStatusChanger from "@/components/OrderStatusChanger";
import OrderEditForm from "@/components/OrderEditForm";
import PrescriptionAddForm from "@/components/PrescriptionAddForm";
import PrescriptionEditForm from "@/components/PrescriptionEditForm";
import PrescriptionVerifyActions from "@/components/PrescriptionVerifyActions";
import CustomerPasswordManager from "@/components/CustomerPasswordManager";
import {
  Phone, Mail, MapPin, Edit3, Package, Glasses,
  ClipboardList, Clock, CheckCircle, Check, ArrowLeft,
  Plus, Stethoscope, StickyNote, Eye, Calendar, CreditCard,
  AlertCircle, TrendingUp, BarChart3, Hash
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING:   { label: "Bekliyor",      icon: <ClipboardList className="w-4 h-4" />, color: "text-yellow-500",  bg: "bg-yellow-500/10 border-yellow-500/20", step: 1 },
  PREPARING: { label: "Hazırlanıyor",  icon: <Clock className="w-4 h-4" />,         color: "text-blue-500",    bg: "bg-blue-500/10 border-blue-500/20",     step: 2 },
  READY:     { label: "Teslime Hazır", icon: <CheckCircle className="w-4 h-4" />,   color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", step: 3 },
  DELIVERED: { label: "Teslim Edildi", icon: <Check className="w-4 h-4" />,         color: "text-muted-foreground", bg: "bg-white dark:bg-surface border-border-color", step: 4 },
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      prescriptions: { orderBy: { createdAt: "asc" } }, // ascending for timeline
      opticOrders: { include: { prescription: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!customer) notFound();

  const initials = `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase();
  const totalSpent   = customer.opticOrders.reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);
  const totalBalance = customer.opticOrders.reduce((sum, o) => sum + (o.balance ?? 0), 0);
  const totalDeposit = customer.opticOrders.reduce((sum, o) => sum + (o.deposit ?? 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Back */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/customers" className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Müxteriler
        </Link>
      </div>

      {/* ─── Customer Info Card ─── */}
      <div className="bg-white dark:bg-surface shadow-sm rounded-2xl p-6 mb-5 ">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-[#1B242A] font-black text-2xl glow-primary flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-foreground mb-3">
              {customer.firstName} {customer.lastName}
            </h1>

            {/* Contact info — always visible */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`tel:${customer.phone}`} className="hover:text-foreground transition-colors font-medium">
                  {customer.phone}
                </a>
              </div>
              {customer.email ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 text-amber-600 dark:text-secondary flex-shrink-0" />
                  <a href={`mailto:${customer.email}`} className="hover:text-foreground transition-colors truncate">
                    {customer.email}
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground/40 text-xs italic">
                  <Mail className="w-4 h-4" /> E-posta girilmemix
                </div>
              )}
              {customer.address ? (
                <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{customer.address}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground/40 text-xs italic sm:col-span-2">
                  <MapPin className="w-4 h-4" /> Adres girilmemix
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Link
              href={`/admin/customers/${id}/edit`}
              className="bg-white dark:bg-surface shadow-sm  text-muted-foreground hover:text-foreground hover:border-primary/40 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> Düzenle
            </Link>
            <Link
              href={`/admin/orders/new?customerId=${id}`}
              className="gradient-primary text-[#1B242A] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 glow-primary hover:opacity-90 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Siparix
            </Link>
          </div>
        </div>

        {/* Health & Notes */}
        {(customer.diseases || customer.notes) && (
          <div className="mt-4 pt-4 border-t border-border-color space-y-2">
            {customer.diseases && (
              <div className="flex items-start gap-2 bg-red-500/10 rounded-xl px-3 py-2 border border-red-500/20">
                <Stethoscope className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-red-400 mb-0.5">Sağlık Notu</p>
                  <p className="text-foreground text-sm">{customer.diseases}</p>
                </div>
              </div>
            )}
            {customer.notes && (
              <div className="flex items-start gap-2 bg-amber-500/10 rounded-xl px-3 py-2 border border-amber-500/20">
                <StickyNote className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-400 mb-0.5">Özel Not</p>
                  <p className="text-foreground text-sm">{customer.notes}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Financial Summary */}
        {customer.opticOrders.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border-color grid grid-cols-3 gap-1.5 sm:gap-3">
            <div className="text-center bg-white/50 dark:bg-surface-light rounded-xl p-2 sm:p-3  min-w-0">
              <p className="text-muted-foreground text-[8px] sm:text-[10px] uppercase tracking-wider font-semibold mb-1 truncate">Toplam Satıx</p>
              <p className="text-foreground font-black text-sm sm:text-lg truncate">{totalSpent.toLocaleString("tr-TR")}  </p>
            </div>
            <div className="text-center bg-white/50 dark:bg-surface-light rounded-xl p-2 sm:p-3  min-w-0">
              <p className="text-muted-foreground text-[8px] sm:text-[10px] uppercase tracking-wider font-semibold mb-1 truncate">Alınan Ödeme</p>
              <p className="text-emerald-500 font-black text-sm sm:text-lg truncate">{totalDeposit.toLocaleString("tr-TR")}  </p>
            </div>
            <div className={`text-center rounded-xl p-2 sm:p-3 border min-w-0 ${totalBalance > 0 ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
              <p className="text-muted-foreground text-[8px] sm:text-[10px] uppercase tracking-wider font-semibold mb-1 truncate">Kalan Ödeme</p>
              <p className={`font-black text-sm sm:text-lg truncate ${totalBalance > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                {totalBalance.toLocaleString("tr-TR")}  
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Hesap & Şifre Yönetimi ─── */}
      <div className="mb-5">
        <CustomerPasswordManager customer={{
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          isPasswordTemporary: customer.isPasswordTemporary,
          tempPasswordExpires: customer.tempPasswordExpires ? customer.tempPasswordExpires.toISOString() : undefined,
          tempPasswordPlain: customer.tempPasswordPlain,
        }} />
      </div>

      {/* ─── Orders Section ─── */}
      <div className="bg-white dark:bg-surface shadow-sm rounded-2xl  mb-5">
        <div className="px-6 py-4  flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-foreground font-semibold">Siparixler</h2>
            <span className="bg-primary/15 text-primary text-xs px-2 py-0.5 rounded-full font-semibold">
              {customer.opticOrders.length}
            </span>
          </div>
          <Link
            href={`/admin/orders/new?customerId=${id}`}
            className="text-primary hover:text-foreground text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-4 h-4" /> Ekle
          </Link>
        </div>
        {customer.opticOrders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
            <Package className="w-12 h-12 text-primary mb-2 opacity-50" />
            <p className="text-sm">Henüz siparix yok.</p>
            <Link href={`/admin/orders/new?customerId=${id}`} className="mt-3 text-primary text-sm font-medium hover:underline">
              + Siparix Ekle
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border-color">
            {customer.opticOrders.map((order) => {
              const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
              return (
                <div key={order.id} className="p-5 space-y-4">
                  {/* Order header */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold border inline-flex items-center gap-1 ${cfg.bg} ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                        <span className="text-muted-foreground text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.orderDate).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                      {order.products && (
                        <div className="flex items-start gap-1.5 mb-1">
                          <Hash className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <p className="text-foreground font-medium text-sm">{order.products}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {order.totalPrice != null && (
                        <p className="text-foreground font-black text-xl">{order.totalPrice.toLocaleString("tr-TR")}  </p>
                      )}
                      {order.deposit != null && order.deposit > 0 && (
                        <p className="text-emerald-500 text-xs font-medium">Alınan Ödeme: {order.deposit.toLocaleString("tr-TR")}  </p>
                      )}
                      {order.balance != null && order.balance > 0 && (
                        <p className="text-amber-500 text-xs font-semibold">Kalan Ödeme: {order.balance.toLocaleString("tr-TR")}  </p>
                      )}
                      {order.deliveryDate && (
                        <p className="text-muted-foreground text-xs mt-1">
                          Teslim: {new Date(order.deliveryDate).toLocaleDateString("tr-TR")}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Status changer */}
                  <OrderStatusChanger orderId={order.id} currentStatus={order.status} />
                  {/* Inline order edit */}
                  <OrderEditForm order={{
                    id: order.id,
                    products: order.products ?? "",
                    productCode: order.productCode ?? "",
                    totalPrice: order.totalPrice ?? null,
                    deposit: order.deposit ?? null,
                    balance: order.balance ?? null,
                    deliveryDate: order.deliveryDate ? order.deliveryDate.toISOString().split("T")[0] : "",
                  }} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Prescription History / Timeline ─── */}
      <div className="bg-white dark:bg-surface shadow-sm rounded-2xl  mb-5">
        <div className="px-6 py-4  flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <h2 className="text-foreground font-semibold">Göz Numarası Geçmixi</h2>
          </div>
          <div className="flex items-center gap-3">
            {customer.prescriptions.length > 1 && (
              <div className="flex items-center gap-1 text-xs text-primary hidden sm:flex">
                <TrendingUp className="w-3 h-3" /> Değixim takibi
              </div>
            )}
            <PrescriptionAddForm customerId={id} />
          </div>
        </div>

        {customer.prescriptions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
            <Glasses className="w-12 h-12 text-primary mb-2 opacity-50" />
            <p className="text-sm">Henüz göz bilgisi yok.</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Change chart — compare first and last */}
            {customer.prescriptions.length > 1 && (() => {
              const first = customer.prescriptions[0];
              const last  = customer.prescriptions[customer.prescriptions.length - 1];
              const fields: { label: string; key: keyof typeof first }[] = [
                { label: "Uzak Sağ SPH", key: "farRightSph" },
                { label: "Uzak Sağ CYL", key: "farRightCyl" },
                { label: "Uzak Sol SPH", key: "farLeftSph" },
                { label: "Uzak Sol CYL", key: "farLeftCyl" },
              ];
              const changes = fields.map(f => {
                const v1 = parseFloat(first[f.key] as string ?? "0") || 0;
                const v2 = parseFloat(last[f.key]  as string ?? "0") || 0;
                const diff = v2 - v1;
                return { ...f, first: first[f.key] ?? "—", last: last[f.key] ?? "—", diff };
              });
              const hasChanges = changes.some(c => c.diff !== 0);
              return hasChanges ? (
                <div className="bg-white/60 dark:bg-surface rounded-xl p-4  mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <p className="text-foreground font-semibold text-sm">İlk → Son Değixim</p>
                    <span className="text-muted-foreground text-xs">
                      ({new Date(first.createdAt).toLocaleDateString("tr-TR")} — {new Date(last.createdAt).toLocaleDateString("tr-TR")})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {changes.map(c => (
                      <div key={c.label} className={`rounded-lg p-2.5 text-center border ${
                        c.diff > 0 ? "bg-red-500/10 border-red-500/20" :
                        c.diff < 0 ? "bg-blue-500/10 border-blue-500/20" :
                        "bg-white dark:bg-surface border-border-color"
                      }`}>
                        <p className="text-muted-foreground text-[9px] font-semibold uppercase tracking-wider">{c.label}</p>
                        <p className="text-foreground text-xs mt-0.5">{String(c.first)} → {String(c.last)}</p>
                        {c.diff !== 0 && (
                          <p className={`text-xs font-bold mt-0.5 ${c.diff > 0 ? "text-red-400" : "text-blue-400"}`}>
                            {c.diff > 0 ? "+" : ""}{c.diff.toFixed(2)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Prescription list — newest last (reversed for display) */}
            <div className="space-y-4">
              {[...customer.prescriptions].reverse().map((rx, idx) => {
                const isNewest = idx === 0;
                return (
                  <div key={rx.id} className="relative pl-5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-border-color">
                    <div className={`absolute left-[-5px] top-3 w-3 h-3 rounded-full border-2 ${isNewest ? "border-primary bg-primary" : "border-border-color bg-white dark:bg-surface"}`} />
                    <div className="bg-white dark:bg-surface shadow-sm rounded-xl p-4  relative">
                      <PrescriptionEditForm rx={rx} />
                      <div className="flex justify-between items-start mb-4 pr-8">
                        <div className="min-w-0">
                          <p className="text-foreground font-semibold flex items-center gap-2 truncate">
                            {"Belirtilmedi"}
                          </p>
                          <p className="text-muted-foreground text-xs mt-0.5">
                            {rx.lensType ? `${rx.lensType} Cam` : ""} 
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          {rx.isPending && (
                            <span className="bg-amber-500/20 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                              ONAY BEKLEYEN
                            </span>
                          )}
                          {isNewest && (
                            <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              EN SON
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4 mb-6 mt-4">
                        {/* UZAK */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[var(--rx-uzak-bg)] p-3 sm:p-4 rounded-2xl border border-[var(--rx-uzak-border)] relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--rx-uzak-border)]"></div>
                          <EyeValues label="UZAK SAĞ" color="text-[var(--rx-uzak-text)]" sph={rx.farRightSph} cyl={rx.farRightCyl} ax={rx.farRightAx} />
                          <EyeValues label="UZAK SOL" color="text-[var(--rx-uzak-text)]" sph={rx.farLeftSph} cyl={rx.farLeftCyl} ax={rx.farLeftAx} />
                        </div>
                        
                        {/* YAKIN */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[var(--rx-yakin-bg)] p-3 sm:p-4 rounded-2xl border border-[var(--rx-yakin-border)] relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--rx-yakin-border)]"></div>
                          <EyeValues label="YAKIN SAĞ" color="text-[var(--rx-yakin-text)]" sph={rx.nearRightSph} cyl={rx.nearRightCyl} ax={rx.nearRightAx} />
                          <EyeValues label="YAKIN SOL" color="text-[var(--rx-yakin-text)]" sph={rx.nearLeftSph} cyl={rx.nearLeftCyl} ax={rx.nearLeftAx} />
                        </div>

                        {/* DAİMİ */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[var(--rx-daimi-bg)] p-3 sm:p-4 rounded-2xl border border-[var(--rx-daimi-border)] relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--rx-daimi-border)]"></div>
                          <EyeValues label="DAİMİ SAĞ" color="text-[var(--rx-daimi-text)]" sph={rx.constantRightSph} cyl={rx.constantRightCyl} ax={rx.constantRightAx} />
                          <EyeValues label="DAİMİ SOL" color="text-[var(--rx-daimi-text)]" sph={rx.constantLeftSph} cyl={rx.constantLeftCyl} ax={rx.constantLeftAx} />
                        </div>
                      </div>
                      
                      {rx.notes && (
                        <div className="bg-[var(--rx-notes-bg)] border border-[var(--rx-notes-border)] p-4 rounded-xl mb-5">
                          <p className="text-[10px] font-bold text-[var(--rx-notes-text)] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--rx-notes-text)] animate-pulse"></span>
                            Açıklama / Notlar
                          </p>
                          <p className="text-foreground text-sm leading-relaxed">{rx.notes}</p>
                        </div>
                      )}

                      <div className="text-[10px] text-muted-foreground border-t border-border-color pt-3 flex items-center gap-2 mb-2">
                        <span className="text-foreground text-sm font-semibold">
                          {new Date(rx.createdAt).toLocaleDateString("tr-TR")}
                        </span>
                      </div>

                      {(rx.pdRight || rx.pdLeft || rx.pdTotal || rx.phRight || rx.phLeft || rx.addRight || rx.addLeft || rx.doctorName || rx.hospitalName) && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {(rx.pdRight || rx.pdLeft || rx.pdTotal) && (
                            <span className="bg-white dark:bg-surface  rounded-lg px-3 py-1 text-muted-foreground">
                              PD: <span className="text-foreground font-semibold">Sağ {rx.pdRight || "-"} / Sol {rx.pdLeft || "-"} / Toplam {rx.pdTotal || "-"}</span>
                            </span>
                          )}
                          {(rx.phRight || rx.phLeft) && (
                            <span className="bg-white dark:bg-surface  rounded-lg px-3 py-1 text-muted-foreground">
                              PH: <span className="text-foreground font-semibold">Sağ {rx.phRight || "-"} / Sol {rx.phLeft || "-"}</span>
                            </span>
                          )}
                          {(rx.addRight || rx.addLeft) && (
                            <span className="bg-white dark:bg-surface  rounded-lg px-3 py-1 text-muted-foreground">
                              ADD: <span className="text-foreground font-semibold">Sağ {rx.addRight || "-"} / Sol {rx.addLeft || "-"}</span>
                            </span>
                          )}
                          {rx.doctorName && (
                            <span className="bg-white dark:bg-surface  rounded-lg px-3 py-1 text-muted-foreground">
                              Dr: <span className="text-foreground font-semibold">{rx.doctorName}</span>
                            </span>
                          )}
                          {rx.hospitalName && (
                            <span className="bg-white dark:bg-surface  rounded-lg px-3 py-1 text-muted-foreground">
                              <span className="text-foreground font-semibold">{rx.hospitalName}</span>
                            </span>
                          )}
                        </div>
                      )}
                      
                      <PrescriptionVerifyActions prescriptionId={rx.id} isPending={rx.isPending} />
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
}

function EyeValues({
  label, color, sph, cyl, ax
}: {
  label: string; color: string; sph?: string | null; cyl?: string | null; ax?: string | null;
}) {
  const fields = [{ label: "SPH", value: sph }, { label: "CYL", value: cyl }, { label: "AX", value: ax }];

  const gridClass = "grid-cols-3";

  return (
    <div className="min-w-0 rounded-xl p-3 sm:p-4">
      <p className={`${color} text-[11px] sm:text-xs font-black mb-3 tracking-widest uppercase`}>{label}</p>
      <div className={`grid ${gridClass} gap-2 text-center`}>
        {fields.map(({ label: l, value }) => (
          <div key={l} className="bg-[var(--rx-value-bg)] rounded-lg p-2 min-w-0 shadow-sm border border-black/5 dark:border-white/5 flex flex-col justify-center items-center">
            <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-widest mb-1">{l}</p>
            <p className="text-[var(--rx-value-text)] text-sm sm:text-base font-black">{value || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
