// @ts-nocheck
import { prisma } from "@/lib/prisma";
import { createBlindIndex, decrypt } from "@/lib/crypto";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import CustomerProfileEditForm from "@/components/CustomerProfileEditForm";
import CustomerEyeInfoAddForm from "@/components/CustomerEyeInfoAddForm";
import CustomerOrdersSection from "@/components/CustomerOrdersSection";
import CustomerBalanceCard from "@/components/CustomerBalanceCard";

import {
  Glasses, SearchX, Eye, Phone, Calendar, Lock, MapPin
} from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function TrackResultPage({
  params,
  searchParams
}: {
  params: Promise<{ phone: string }>;
  searchParams: Promise<{ n?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // Kullanıcının girdiği telefonu sadece rakama indir: "0532 369 4954" → "05323694954"
  const phone = decodeURIComponent(resolvedParams.phone).replace(/\D/g, "");
  const nameQuery = resolvedSearchParams.n?.trim().toLowerCase() ?? "";

  // Eşleşme için iki varyasyon: "05323694954" ve "5323694954"
  const normalizePhone = (p: string) => p.replace(/\D/g, "");
  const targetNorms = [
    phone,
    phone.startsWith("0") ? phone.substring(1) : `0${phone}`,
  ].filter(Boolean);

  const customerInclude = {
    firm: true,
    opticOrders: { 
      include: { prescription: true, installments: { orderBy: { dueDate: "asc" } } },
      orderBy: { createdAt: "desc" },
    },
    prescriptions: {
      where: { isPending: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    },
  };

  // ─── TÜM müşterilerin ham (şifreli) phone değerini getir ───────────────────
  // $queryRaw kullanıyoruz → Prisma extension BYPASS edilir → gerçek DB değeri gelir
  // decrypt() her ikisini de işler: şifreli olanı çözer, düz metin olanı değiştirmez
  const rawRows = await prisma.$queryRaw`
    SELECT id, phone FROM "Customer" WHERE phone IS NOT NULL
  ` as { id: string; phone: string }[];

  let foundId: string | null = null;
  for (const row of rawRows) {
    const decryptedPhone = decrypt(row.phone); // şifreli → çözer | düz metin → aynı döner
    if (targetNorms.includes(normalizePhone(decryptedPhone))) {
      foundId = row.id;
      break;
    }
  }

  let customer = foundId
    ? await prisma.customer.findUnique({ where: { id: foundId }, include: customerInclude })
    : null;

  const [settings, fallbackFirm] = await Promise.all([
    prisma.settings.findUnique({ where: { id: "global" } }),
    prisma.firm.findFirst()
  ]);

  const activeFirm = customer?.firm || fallbackFirm;

  if (!customer) {
    return (
      <main className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        {/* Animated bg */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full opacity-10 blur-[80px]"
            style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }} />
        </div>
        <header className="relative z-20 p-4 sm:p-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-md flex-shrink-0">
              <div className="text-white font-black text-lg italic">P</div>
            </div>
            <span className="font-black text-foreground text-lg tracking-tight">PEN <span className="text-primary">OPTİK</span></span>
          </Link>
          <ThemeToggle />
        </header>
        <div className="relative z-10 flex-1 flex items-center justify-center px-4">
          <div className="text-center glass rounded-3xl p-10 max-w-sm w-full ">
            <SearchX className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Kayıt Bulunamadı</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Bu telefon numarasına ait sipariş bulunamadı. Lütfen numarayı kontrol edip tekrar deneyin.
            </p>
            <Link 
              href="/track" 
              className="inline-flex px-6 py-3 bg-surface border border-border-color text-foreground font-semibold rounded-xl hover:bg-surface/80 hover:border-primary/50 transition-all"
            >
              Tekrar Dene
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // NAME CHECK - isim doğrulaması
  // firstName ve lastName Prisma extension tarafından decrypt edilmiş olabilir
  // ama garantilemek için burada da decrypt() çağırıyoruz
  const normalizeForMatch = (str: string) => {
    return str
      .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i")
      .replace(/Ş/g, "s").replace(/ş/g, "s")
      .replace(/Ğ/g, "g").replace(/ğ/g, "g")
      .replace(/Ü/g, "u").replace(/ü/g, "u")
      .replace(/Ö/g, "o").replace(/ö/g, "o")
      .replace(/Ç/g, "c").replace(/ç/g, "c")
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "");
  };

  // decrypt() ile garanti çözme: şifreli ise çözer, zaten düz ise değiştirmez
  const safeFirstName = decrypt(customer.firstName || "");
  const safeLastName = decrypt(customer.lastName || "");
  const normalizedCustomerName = normalizeForMatch(`${safeFirstName} ${safeLastName}`);
  const queryTerms = normalizeForMatch(nameQuery || "").split(/\s+/).filter(Boolean);
  
  const isMatch = queryTerms.length > 0 && queryTerms.every(term => normalizedCustomerName.includes(term));
  
  if (!isMatch) {
    return (
      <main className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        <header className="relative z-20 p-4 sm:p-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-md flex-shrink-0">
              <div className="text-white font-black text-lg italic">P</div>
            </div>
            <span className="font-black text-foreground text-lg tracking-tight">PEN <span className="text-primary">OPTİK</span></span>
          </Link>
          <ThemeToggle />
        </header>
        <div className="relative z-10 flex-1 flex items-center justify-center px-4">
          <div className="text-center glass rounded-3xl p-10 max-w-sm w-full ">
            <SearchX className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Kayıt Bulunamadı</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Girdiğiniz isim ve telefon numarası eşleşmedi. Lütfen bilgileri kontrol edip tekrar deneyin.
            </p>
            <Link 
              href="/track" 
              className="inline-flex px-6 py-3 bg-surface border border-border-color text-foreground font-semibold rounded-xl hover:bg-surface/80 hover:border-primary/50 transition-all"
            >
              Tekrar Dene
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // --- SECURITY CHECK ---
  // Müşterinin giriş yapıp yapmadığını kontrol et
  // NOT: Track sayfası herkese açık — ad+telefon kombinasyonu yeterli kimlik doğrulaması.
  // Şifreli müşteriler de bu sayfayı görebilir; sadece şifre gerektiren özel işlemler için login şartı.
  let isLoggedIn = false;
  const cookieStore = await cookies();
  const token = cookieStore.get("customer_token")?.value;

  if (token === customer.id) {
    isLoggedIn = true;
  }
  // Şifre varsa ve geçici değilse → ek özellikler için login göster ama sayfayı ENGELLEME
  // ----------------------

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
    installments: o.installments ? o.installments.map((i: any) => ({
      id: i.id,
      amount: i.amount,
      dueDate: i.dueDate.toISOString(),
      isPaid: i.isPaid,
      paidAt: i.paidAt ? i.paidAt.toISOString() : null,
    })) : [],
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
      <div className="sticky top-0 z-[50] w-full bg-background/80 backdrop-blur-xl border-b border-border-color/50 mb-6">
        <header className="p-4 sm:p-6 max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-md flex-shrink-0">
              <div className="text-white font-black text-lg italic">P</div>
            </div>
            <span className="font-black text-foreground text-lg tracking-tight">PEN <span className="text-primary">OPTİK</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1.5 transition-colors font-medium cursor-pointer">
              Çıkış
            </Link>
          </div>
        </header>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 space-y-4">

        {/* Set Password Prompt */}
        {(customer.isPasswordTemporary || !customer.password) && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 shadow-sm rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-down">
            <div>
              <p className="text-amber-600 dark:text-amber-400 font-bold text-sm">Şifrenizi Oluşturun</p>
              <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                Sisteme daha kolay ve güvenli giriş yapabilmek için kalıcı bir şifre belirleyebilirsiniz. (Zorunlu değil, telefon numaranızla giriş yapmaya devam edebilirsiniz.)
              </p>
            </div>
            <Link 
              href={`/change-password?phone=${customer.phone}&id=${customer.id}`}
              className="whitespace-nowrap px-4 py-2 bg-amber-500 text-white dark:text-[#1B242A] rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
            >
              Şifre Oluştur
            </Link>
          </div>
        )}

        {/* Total Balance Card */}
        {settings?.customerCanViewBalance && totalBalance > 0 && (
          <CustomerBalanceCard orders={serializedOrders} />
        )}

        {/* Welcome Card */}
        <div className="bg-white dark:bg-surface shadow-sm rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center glow-primary flex-shrink-0">
              <span className="text-[#1B242A] font-black text-2xl">{initials}</span>
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Hoş geldiniz</p>
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
                {customer.opticOrders.length} Sipariş
              </span>
              {isLoggedIn && (
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
              )}
            </div>
          </div>
        </div>

        {/* Customer Orders / Status Tracking Section */}
        <CustomerOrdersSection orders={serializedOrders} />

        {/* Eye Information Section */}
        {settings?.customerCanViewMeasurements !== false && (
        <div className="bg-white dark:bg-surface shadow-sm rounded-2xl">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="text-foreground font-bold">Göz Numaralarım & Bilgileri</h3>
            </div>
            {settings?.customerCanEditMeasurements && isLoggedIn && <CustomerEyeInfoAddForm customerId={customer.id} />}
          </div>

          {!isLoggedIn ? (
            <div className="p-8 text-center flex flex-col items-center">
              <Lock className="w-12 h-12 text-amber-500 mb-3 opacity-80" />
              <p className="text-sm font-bold text-foreground mb-1">Kişisel Bilgileriniz Gizlendi</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Göz numaralarınız, reçete detaylarınız ve kişisel bilgilerinizi görebilmek için hesabınıza bir şifre belirleyip güvenli giriş yapmalısınız.
              </p>
              <Link 
                href={`/change-password?phone=${customer.phone}&id=${customer.id}`}
                className="mt-4 px-5 py-2.5 bg-amber-500 text-white dark:text-[#1B242A] rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
              >
                Şifre Belirle & Giriş Yap
              </Link>
            </div>
          ) : customer.prescriptions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
              <Glasses className="w-12 h-12 text-primary mb-2 opacity-50" />
              <p className="text-sm font-semibold text-foreground">Henüz doğrulanmış göz numaranız bulunmuyor</p>
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
                      <div className="space-y-3 pt-2">
                        <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider">Daimi Ölçümler</h4>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex-1 bg-surface/30 border border-border-color rounded-xl overflow-hidden">
                            <div className="bg-primary/5 px-3 py-1.5 border-b border-border-color">
                              <p className="text-primary text-[10px] font-bold">SAĞ GÖZ</p>
                            </div>
                            <div className="grid grid-cols-3 divide-x divide-border-color text-center">
                              {[
                                { label: "SPH", value: rx.constantRightSph },
                                { label: "CYL", value: rx.constantRightCyl },
                                { label: "AX", value: rx.constantRightAx },
                              ].map(({ label, value }) => (
                                <div key={label} className="p-2">
                                  <span className="text-[9px] text-muted-foreground block mb-0.5">{label}</span>
                                  <span className="font-semibold text-sm text-foreground">{value || "—"}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex-1 bg-surface/30 border border-border-color rounded-xl overflow-hidden">
                            <div className="bg-amber-500/5 px-3 py-1.5 border-b border-border-color">
                              <p className="text-amber-600 dark:text-amber-400 text-[10px] font-bold">SOL GÖZ</p>
                            </div>
                            <div className="grid grid-cols-3 divide-x divide-border-color text-center">
                              {[
                                { label: "SPH", value: rx.constantLeftSph },
                                { label: "CYL", value: rx.constantLeftCyl },
                                { label: "AX", value: rx.constantLeftAx },
                              ].map(({ label, value }) => (
                                <div key={label} className="p-2">
                                  <span className="text-[9px] text-muted-foreground block mb-0.5">{label}</span>
                                  <span className="font-semibold text-sm text-foreground">{value || "—"}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* UZAK SECTION */}
                    {hasFar && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider">Uzak Ölçümler</h4>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex-1 bg-surface/30 border border-border-color rounded-xl overflow-hidden">
                            <div className="bg-primary/5 px-3 py-1.5 border-b border-border-color">
                              <p className="text-primary text-[10px] font-bold">SAĞ GÖZ</p>
                            </div>
                            <div className="grid grid-cols-3 divide-x divide-border-color text-center">
                              {[
                                { label: "SPH", value: rx.farRightSph },
                                { label: "CYL", value: rx.farRightCyl },
                                { label: "AX", value: rx.farRightAx },
                              ].map(({ label, value }) => (
                                <div key={label} className="p-2">
                                  <span className="text-[9px] text-muted-foreground block mb-0.5">{label}</span>
                                  <span className="font-semibold text-sm text-foreground">{value || "—"}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex-1 bg-surface/30 border border-border-color rounded-xl overflow-hidden">
                            <div className="bg-amber-500/5 px-3 py-1.5 border-b border-border-color">
                              <p className="text-amber-600 dark:text-amber-400 text-[10px] font-bold">SOL GÖZ</p>
                            </div>
                            <div className="grid grid-cols-3 divide-x divide-border-color text-center">
                              {[
                                { label: "SPH", value: rx.farLeftSph },
                                { label: "CYL", value: rx.farLeftCyl },
                                { label: "AX", value: rx.farLeftAx },
                              ].map(({ label, value }) => (
                                <div key={label} className="p-2">
                                  <span className="text-[9px] text-muted-foreground block mb-0.5">{label}</span>
                                  <span className="font-semibold text-sm text-foreground">{value || "—"}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* YAKIN SECTION */}
                    {hasNear && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider">Yakın Ölçümler</h4>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex-1 bg-surface/30 border border-border-color rounded-xl overflow-hidden">
                            <div className="bg-primary/5 px-3 py-1.5 border-b border-border-color">
                              <p className="text-primary text-[10px] font-bold">SAĞ GÖZ</p>
                            </div>
                            <div className="grid grid-cols-3 divide-x divide-border-color text-center">
                              {[
                                { label: "SPH", value: rx.nearRightSph },
                                { label: "CYL", value: rx.nearRightCyl },
                                { label: "AX", value: rx.nearRightAx },
                              ].map(({ label, value }) => (
                                <div key={label} className="p-2">
                                  <span className="text-[9px] text-muted-foreground block mb-0.5">{label}</span>
                                  <span className="font-semibold text-sm text-foreground">{value || "—"}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex-1 bg-surface/30 border border-border-color rounded-xl overflow-hidden">
                            <div className="bg-amber-500/5 px-3 py-1.5 border-b border-border-color">
                              <p className="text-amber-600 dark:text-amber-400 text-[10px] font-bold">SOL GÖZ</p>
                            </div>
                            <div className="grid grid-cols-3 divide-x divide-border-color text-center">
                              {[
                                { label: "SPH", value: rx.nearLeftSph },
                                { label: "CYL", value: rx.nearLeftCyl },
                                { label: "AX", value: rx.nearLeftAx },
                              ].map(({ label, value }) => (
                                <div key={label} className="p-2">
                                  <span className="text-[9px] text-muted-foreground block mb-0.5">{label}</span>
                                  <span className="font-semibold text-sm text-foreground">{value || "—"}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PD / PH BÖLÜMÜ YENİ YAPISAL OLARAK TÜM ÖLÇÜMLERİN ALTINDA */}
                    {(rx.pdRight || rx.pdLeft || rx.pdTotal || rx.phRight || rx.phLeft) && (
                      <div className="space-y-2 pt-2">
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {(rx.pdRight || rx.pdLeft || rx.pdTotal) && (
                            <div className="bg-surface/50 border border-border-color px-2.5 py-1 rounded-md">
                              PD: <strong className="text-foreground">Sağ {rx.pdRight || "-"} / Sol {rx.pdLeft || "-"} / Toplam {rx.pdTotal || "-"}</strong>
                            </div>
                          )}
                          {(rx.phRight || rx.phLeft) && (
                            <div className="bg-surface/50 border border-border-color px-2.5 py-1 rounded-md">
                              PH: <strong className="text-foreground">Sağ {rx.phRight || "-"} / Sol {rx.phLeft || "-"}</strong>
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
            Bilgilerinizde hata olduğunu düşünüyorsanız lütfen optisyeninizle iletişime geçin.
          </p>
        </div>
      </div>

      {/* Footer - Firm Contact & Branding */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 mt-12 mb-8 space-y-4">
        {activeFirm && (
          <div className="bg-surface/30 border border-border-color rounded-2xl p-4 text-center space-y-3">
            <h4 className="text-sm font-bold text-foreground">{activeFirm.name}</h4>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-muted-foreground">
              {(activeFirm.phone || "0216 390 04 44") && (
                <a href={`tel:${(activeFirm.phone || "0216 390 04 44").replace(/[^0-9+]/g, '')}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Phone className="w-3.5 h-3.5" /> {activeFirm.phone || "0216 390 04 44"}
                </a>
              )}
              {(activeFirm.address || "Batı Mah., İsmetpaşa Cad., No: 33/35A, Pendik / İstanbul") && (
                <a 
                  href={(settings?.themeData ? (typeof settings.themeData === 'string' ? JSON.parse(settings.themeData).mapUrl : (settings.themeData as any).mapUrl) : null) || (activeFirm.address && activeFirm.address.startsWith("http") ? activeFirm.address : "https://maps.google.com/?q=Batı+Mah.,+İsmetpaşa+Cad.,+No:+33/35A,+Pendik+/+İstanbul")} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 hover:text-primary transition-colors text-left"
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" /> 
                  <span className="leading-tight">{activeFirm.address && !activeFirm.address.startsWith("http") ? activeFirm.address : "Batı Mah., İsmetpaşa Cad., No: 33/35A, Pendik / İstanbul"}</span>
                </a>
              )}
            </div>
          </div>
        )}
        
        <div className="text-center opacity-60 hover:opacity-100 transition-opacity">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            Altyapı <a href="https://sentientwire.com" target="_blank" rel="noopener noreferrer" className="font-bold text-foreground hover:text-primary transition-colors">SENTIENT WIRE</a> tarafından sağlanmaktadır.
          </p>
        </div>
      </div>
    </main>
  );
}
