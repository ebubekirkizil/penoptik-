import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import CustomerProfileEditForm from "@/components/CustomerProfileEditForm";
import CustomerEyeInfoAddForm from "@/components/CustomerEyeInfoAddForm";
import CustomerOrdersSection from "@/components/CustomerOrdersSection";

import {
  Glasses, SearchX, Eye, Phone, Calendar
} from "lucide-react";

export default async function TrackResultPage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  const { phone } = await params;

  const [customer, settings] = await Promise.all([
    prisma.customer.findUnique({
      where: { phone },
      include: {
        opticOrders: { include: { prescription: true },
          orderBy: { createdAt: "desc" },
        },
        prescriptions: {
          where: { isPending: false }, // Müxteri sadece doğrulanmıx/onaylanmıx ölçümleri görebilir
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    }),
    prisma.settings.findUnique({ where: { id: "global" } })
  ]);

  if (!customer) {
    return (
      <main className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        {/* Animated bg */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full opacity-10 blur-[80px]"
            style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }} />
        </div>
        <header className="relative z-10 glass  sticky top-0">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow-primary flex-shrink-0">
                <div className="text-[#1B242A] font-black text-base italic">P</div>
              </div>
              <span className="font-black text-lg tracking-tight text-foreground leading-none flex flex-col justify-center">PEN<span className="text-primary">OPTİK</span></span>
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <div className="relative z-10 flex-1 flex items-center justify-center px-4">
          <div className="text-center glass rounded-3xl p-10 max-w-sm w-full ">
            <SearchX className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Kayıt Bulunamadı</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Bu telefon numarasına ait kayıt bulunamadı. Lütfen optisyeninizle iletixime geçin.
            </p>
            <Link href="/login" className="gradient-primary text-[#1B242A] px-6 py-3 rounded-xl font-bold block transition-all hover:scale-[1.02] glow-primary">
              Tekrar Girix Yap
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const initials = `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase();

  const totalBalance = customer.opticOrders.reduce((sum, o) => sum + (o.balance || 0), 0);

  const serializedOrders = customer.opticOrders.map(o => ({
    id: o.id,
    status: o.status,
    products: o.products,
    productCode: o.productCode,
    totalPrice: o.totalPrice,
    deposit: o.deposit,
    balance: o.balance,
    orderDate: o.orderDate.toISOString(),
    deliveryDate: o.deliveryDate ? o.deliveryDate.toISOString() : null,
    prescription: o.prescription ? {
      farRightSph: o.prescription.farRightSph,
      farRightCyl: o.prescription.farRightCyl,
      farRightAx: o.prescription.farRightAx,
      farLeftSph: o.prescription.farLeftSph,
      farLeftCyl: o.prescription.farLeftCyl,
      farLeftAx: o.prescription.farLeftAx,
      pdRight: o.prescription.pdRight,
      pdLeft: o.prescription.pdLeft,
      pdTotal: o.prescription.pdTotal,
      phRight: o.prescription.phRight,
      phLeft: o.prescription.phLeft,

      lensType: o.prescription.lensType,
    } : null
  }));

  const getLensBadgeStyle = (lensType: string | null) => {
    return "bg-primary/10 text-primary border border-primary/20";
  };

  return (
    <main className="min-h-screen bg-background pb-10 relative overflow-hidden">
      {/* Animated bg */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full opacity-15 dark:opacity-20 blur-[80px] animate-pulse"
          style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-10 dark:opacity-15 blur-[100px] animate-pulse"
          style={{ background: "radial-gradient(circle, var(--secondary) 0%, transparent 70%)", animationDelay: "2s" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 glass  sticky top-0">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow-primary flex-shrink-0">
              <div className="text-[#1B242A] font-black text-base italic">P</div>
            </div>
            <span className="font-black text-lg tracking-tight text-foreground leading-none flex flex-col justify-center">PEN<span className="text-primary">OPTİK</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1.5 transition-colors font-medium cursor-pointer">
              Çıkıx
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 space-y-4">

        {/* Total Balance Card */}
        {settings?.customerCanViewBalance && totalBalance > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 shadow-sm rounded-2xl p-4 flex items-center justify-between animate-fade-in-down">
            <div>
              <p className="text-red-600 dark:text-red-400 font-bold text-sm uppercase tracking-wide">Kalan Toplam Ödeme (Borç)</p>
              <p className="text-red-700 dark:text-red-300 text-xs mt-1">Devam eden veya geçmix siparixlerinizden kalan toplam bakiye.</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-red-600 dark:text-red-400">
                {totalBalance.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
              </span>
            </div>
          </div>
        )}

        {/* Welcome Card */}
        <div className="bg-white dark:bg-surface shadow-sm rounded-2xl p-6  animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center glow-primary flex-shrink-0">
              <span className="text-[#1B242A] font-black text-2xl">{initials}</span>
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Hox geldiniz</p>
              <h2 className="text-foreground text-2xl font-black">
                {customer.firstName} {customer.lastName}
              </h2>
              <div className="flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3 text-primary" />
                <span className="text-muted-foreground text-sm">{customer.phone}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0 items-end">
              <span className="text-muted-foreground text-xs font-semibold bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-xl">
                {customer.opticOrders.length} Siparix
              </span>
              <CustomerProfileEditForm customer={{
                id: customer.id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                phone: customer.phone,
                email: customer.email,
                address: customer.address,
                diseases: customer.diseases,
                notes: customer.notes,
              }} />
            </div>
          </div>
        </div>

        {/* Customer Orders / Status Tracking Section */}
        <CustomerOrdersSection orders={serializedOrders} />

        {/* Eye Information Section */}
        {settings?.customerCanViewMeasurements !== false && (
        <div className="bg-white dark:bg-surface shadow-sm rounded-2xl  animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="px-6 py-4  flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="text-foreground font-bold">Göz Numaralarım & Bilgileri</h3>
            </div>
            {settings?.customerCanEditMeasurements && <CustomerEyeInfoAddForm customerId={customer.id} />}
          </div>

          {customer.prescriptions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
              <Glasses className="w-12 h-12 text-primary mb-2 opacity-50" />
              <p className="text-sm font-semibold text-foreground">Henüz doğrulanmıx göz numaranız bulunmuyor</p>
              <p className="text-xs text-muted-foreground mt-1">
                "Yeni Ölçüm Ekle" butonunu kullanarak ölçümlerinizi onay için gönderebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border-color">
              {customer.prescriptions.map((rx, idx) => {
                const hasFar = rx.farRightSph || rx.farLeftSph;
                const hasNear = rx.nearRightSph || rx.nearLeftSph;
                const hasConstant = rx.constantRightSph || rx.constantLeftSph;

                return (
                <div key={rx.id} className="p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-border-color pb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-foreground font-bold text-lg">
                        {new Date(rx.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                      {idx === 0 && (
                        <span className="bg-primary/20 text-primary text-[10px] px-2 py-1 rounded-full font-bold tracking-wider">SON ÖLÇÜM</span>
                      )}
                    </div>
                    {rx.lensType && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getLensBadgeStyle(rx.lensType)}`}>
                        {rx.lensType}
                      </span>
                    )}
                  </div>

                  <div className="space-y-8">
                    {/* DAİMİ SECTION */}
                    {hasConstant && (
                      <div className="bg-surface/30 rounded-2xl p-4 border border-border-color/50">
                        <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" />DAİMİ ÖLÇÜMLER</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-black px-2 py-0.5 rounded uppercase">Sağ Göz</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              {[
                                { label: "SPH", value: rx.constantRightSph },
                                { label: "CYL", value: rx.constantRightCyl },
                                { label: "AX", value: rx.constantRightAx },
                              ].map(({ label, value }) => (
                                <div key={label} className="bg-white dark:bg-surface rounded-xl p-2.5 shadow-sm border border-border-color/30">
                                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{label}</p>
                                  <p className="text-foreground text-base font-black mt-1">{value || "—"}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-black px-2 py-0.5 rounded uppercase">Sol Göz</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              {[
                                { label: "SPH", value: rx.constantLeftSph },
                                { label: "CYL", value: rx.constantLeftCyl },
                                { label: "AX", value: rx.constantLeftAx },
                              ].map(({ label, value }) => (
                                <div key={label} className="bg-white dark:bg-surface rounded-xl p-2.5 shadow-sm border border-border-color/30">
                                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{label}</p>
                                  <p className="text-foreground text-base font-black mt-1">{value || "—"}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* UZAK SECTION */}
                    {hasFar && (
                      <div className="bg-surface/30 rounded-2xl p-4 border border-border-color/50">
                        <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" />UZAK ÖLÇÜMLER</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-black px-2 py-0.5 rounded uppercase">Sağ Göz</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              {[
                                { label: "SPH", value: rx.farRightSph },
                                { label: "CYL", value: rx.farRightCyl },
                                { label: "AX", value: rx.farRightAx },
                              ].map(({ label, value }) => (
                                <div key={label} className="bg-white dark:bg-surface rounded-xl p-2.5 shadow-sm border border-border-color/30">
                                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{label}</p>
                                  <p className="text-foreground text-base font-black mt-1">{value || "—"}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-black px-2 py-0.5 rounded uppercase">Sol Göz</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              {[
                                { label: "SPH", value: rx.farLeftSph },
                                { label: "CYL", value: rx.farLeftCyl },
                                { label: "AX", value: rx.farLeftAx },
                              ].map(({ label, value }) => (
                                <div key={label} className="bg-white dark:bg-surface rounded-xl p-2.5 shadow-sm border border-border-color/30">
                                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{label}</p>
                                  <p className="text-foreground text-base font-black mt-1">{value || "—"}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* YAKIN SECTION */}
                    {hasNear && (
                      <div className="bg-surface/30 rounded-2xl p-4 border border-border-color/50">
                        <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" />YAKIN ÖLÇÜMLER</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-black px-2 py-0.5 rounded uppercase">Sağ Göz</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              {[
                                { label: "SPH", value: rx.nearRightSph },
                                { label: "CYL", value: rx.nearRightCyl },
                                { label: "AX", value: rx.nearRightAx },
                              ].map(({ label, value }) => (
                                <div key={label} className="bg-white dark:bg-surface rounded-xl p-2.5 shadow-sm border border-border-color/30">
                                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{label}</p>
                                  <p className="text-foreground text-base font-black mt-1">{value || "—"}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-black px-2 py-0.5 rounded uppercase">Sol Göz</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              {[
                                { label: "SPH", value: rx.nearLeftSph },
                                { label: "CYL", value: rx.nearLeftCyl },
                                { label: "AX", value: rx.nearLeftAx },
                              ].map(({ label, value }) => (
                                <div key={label} className="bg-white dark:bg-surface rounded-xl p-2.5 shadow-sm border border-border-color/30">
                                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{label}</p>
                                  <p className="text-foreground text-base font-black mt-1">{value || "—"}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PD / PH BÖLÜMÜ YENİ YAPISAL OLARAK TÜM ÖLÇÜMLERİN ALTINDA */}
                    {(rx.pdRight || rx.pdLeft || rx.pdTotal || rx.phRight || rx.phLeft) && (
                      <div className="bg-surface/30 rounded-2xl p-4 border border-border-color/50">
                        <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" />PD / PH ÖLÇÜMLERİ</h4>
                        <div className="flex flex-wrap gap-4">
                          {(rx.pdRight || rx.pdLeft || rx.pdTotal) && (
                            <div className="bg-white dark:bg-surface border border-border-color/50 rounded-lg p-3">
                              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">PD (Pupil Mesafesi)</p>
                              <p className="text-sm font-bold text-foreground">
                                Sağ: {rx.pdRight || "-"} | Sol: {rx.pdLeft || "-"} | Toplam: {rx.pdTotal || "-"}
                              </p>
                            </div>
                          )}
                          {(rx.phRight || rx.phLeft) && (
                            <div className="bg-white dark:bg-surface border border-border-color/50 rounded-lg p-3">
                              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">PH (Pupilya Yüksekliği)</p>
                              <p className="text-sm font-bold text-foreground">
                                Sağ: {rx.phRight || "-"} | Sol: {rx.phLeft || "-"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {(settings?.customerCanViewDoctorInfo !== false && (rx.doctorName || rx.hospitalName || rx.addRight || rx.addLeft)) || (settings?.customerCanViewNotes !== false && rx.notes) ? (
                    <div className="space-y-3 pt-4 border-t border-border-color/50">
                      {settings?.customerCanViewDoctorInfo !== false && (rx.doctorName || rx.hospitalName || rx.addRight || rx.addLeft) && (
                        <div className="flex flex-wrap gap-2">
                          {rx.doctorName && (
                            <span className="bg-white dark:bg-surface border border-border-color/50 rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
                              Dr: <span className="text-foreground font-bold">{rx.doctorName}</span>
                            </span>
                          )}
                          {rx.hospitalName && (
                            <span className="bg-white dark:bg-surface border border-border-color/50 rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
                              Hastane: <span className="text-foreground font-bold">{rx.hospitalName}</span>
                            </span>
                          )}
                          {rx.addRight && (
                            <span className="bg-white dark:bg-surface border border-border-color/50 rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
                              ADD (Sağ): <span className="text-foreground font-bold">{rx.addRight}</span>
                            </span>
                          )}
                          {rx.addLeft && (
                            <span className="bg-white dark:bg-surface border border-border-color/50 rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
                              ADD (Sol): <span className="text-foreground font-bold">{rx.addLeft}</span>
                            </span>
                          )}
                        </div>
                      )}
                      {settings?.customerCanViewNotes !== false && rx.notes && (
                        <div className="bg-muted/50 border border-border-color p-3.5 rounded-xl text-sm text-foreground">
                          <span className="font-bold text-[10px] uppercase tracking-wider mb-1 block text-muted-foreground">Açıklama / Muayene Notu</span>
                          {rx.notes}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
                );
              })}
            </div>
          )}
        </div>
        )}

        {/* Footer note */}
        <div className="text-center py-4">
          <p className="text-muted-foreground text-xs">
            Bilgilerinizde hata olduğunu düxünüyorsanız lütfen optisyeninizle iletixime geçin.
          </p>
        </div>
      </div>
    </main>
  );
}
