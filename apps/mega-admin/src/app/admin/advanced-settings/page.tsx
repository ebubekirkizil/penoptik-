import { 
  Building2, Palette, Truck, CreditCard, Receipt, 
  Users, HardDrive, Bell, Settings, Globe 
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdvancedSettingsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("saas_session")?.value;
  if (!sessionCookie) redirect("/login");

  // Mevcut kullanıcının firmasını alalım (ximdilik mock veya ilk firmayı da alabiliriz)
  // Gerçekte payload içindeki firmId kullanılacak, biz demo için ilk firmayı alıyoruz:
  const firm = await prisma.firm.findFirst({
    where: { isActive: true },
    include: {
      package: true,
    }
  });

  if (!firm) {
    return <div>Sistemde kayıtlı firma bulunamadı.</div>;
  }

  // Firmanın paket özelliklerini çözümleyelim
  let activeFeatures: string[] = [];
  try {
    if (firm.package?.features) {
      activeFeatures = JSON.parse(firm.package.features);
    }
  } catch (e) {}

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gelixmix Kontrol Merkezi</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base max-w-3xl">
          Sentient Wire altyapısındaki tüm kurumsal ERP, Lojistik, E-Ticaret ve Muhasebe ayarlarınızı bu ekrandan yönetin. 
          Sadece paketinizde aktif olan modüllerin ayarlarını değixtirebilirsiniz.
        </p>
      </div>

      {/* Grid of Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Şirket & Marka */}
        <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Building2 className="w-24 h-24" />
          </div>
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Kurum Profili</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Vergi dairesi, resmi unvan, fatura adresi ve xube tanımlamaları.</p>
          <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Ayarları Yapılandır &rarr;
          </button>
        </div>

        {/* 2. Tasarım & Vitrin */}
        <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Palette className="w-24 h-24" />
          </div>
          <div className="w-12 h-12 bg-pink-500/10 text-pink-600 rounded-2xl flex items-center justify-center mb-6">
            <Palette className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Tasarım & E-Ticaret Vitrini</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Müxteri arayüzü renkleri, logo, banner ve sayfa yapılandırmaları.</p>
          <Link href="/admin/settings" className="text-sm font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1">
            Vitrin Düzenleyiciye Git &rarr;
          </Link>
        </div>

        {/* 3. Lojistik ve Kargo (Sadece Paket Destekliyorsa) */}
        <div className={`bg-white dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm transition-all group relative overflow-hidden ${
          !activeFeatures.includes("MOD_ECOMMERCE_SHIPPING") ? "opacity-60 grayscale" : "hover:shadow-md"
        }`}>
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Truck className="w-24 h-24" />
          </div>
          <div className="w-12 h-12 bg-sky-500/10 text-sky-600 rounded-2xl flex items-center justify-center mb-6">
            <Truck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Kargo & Desi (Lojistik)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Yurtiçi, Aras, MNG API anahtarları. Otomatik desi hesaplama formülleri.</p>
          
          {!activeFeatures.includes("MOD_ECOMMERCE_SHIPPING") ? (
            <div className="text-xs font-bold text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-lg inline-block">
              Mevcut Paketinizde Bu Modül Kapalı
            </div>
          ) : (
            <button className="text-sm font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              Kargo API Bağla &rarr;
            </button>
          )}
        </div>

        {/* 4. Ödeme Sistemleri (PayTR / İyzico) */}
        <div className={`bg-white dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm transition-all group relative overflow-hidden ${
          !activeFeatures.includes("MOD_ECOMMERCE_ORDERS") ? "opacity-60 grayscale" : "hover:shadow-md"
        }`}>
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
            <CreditCard className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sanal POS Entegrasyonu</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">PayTR, İyzico ve Stripe için Merchant ID, Secret Key girixleri.</p>
          
          {!activeFeatures.includes("MOD_ECOMMERCE_ORDERS") ? (
            <div className="text-xs font-bold text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-lg inline-block">
              Bu Modül İçin Paketinizi Yükseltin
            </div>
          ) : (
            <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              POS Ayarları &rarr;
            </button>
          )}
        </div>

        {/* 5. Ön Muhasebe & E-Fatura */}
        <div className={`bg-white dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm transition-all group relative overflow-hidden ${
          !activeFeatures.includes("MOD_FINANCE_ACCOUNTING") ? "opacity-60 grayscale" : "hover:shadow-md"
        }`}>
          <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
            <Receipt className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">E-Fatura (GİB) Entegrasyonu</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Devlet (GİB) onaylı resmi e-fatura kesebilmeniz için yetkili özel entegratör ayarları.</p>
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-xl text-xs mb-6 font-medium">
            <strong>* Uyumsoft Nedir?</strong> Türkiye'de Gelir İdaresi Baxkanlığı (GİB) tarafından onaylanmıx, e-Fatura ve e-Arxiv kesmenizi sağlayan resmi aracı firmalardan biridir. Sistemi kullanarak faturalarınızı doğrudan GİB'e iletebilirsiniz.
          </div>
          
          {!activeFeatures.includes("MOD_FINANCE_ACCOUNTING") ? (
            <div className="text-xs font-bold text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-lg inline-block">
              Muhasebe Modülü Kapalı
            </div>
          ) : (
            <button className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              Fatura Şablonlarını Düzenle &rarr;
            </button>
          )}
        </div>

        {/* 6. Çoklu Depo Yönetimi */}
        <div className={`bg-white dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm transition-all group relative overflow-hidden ${
          !activeFeatures.includes("MOD_INVENTORY_MULTI") ? "opacity-60 grayscale" : "hover:shadow-md"
        }`}>
          <div className="w-12 h-12 bg-orange-500/10 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
            <HardDrive className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Çoklu Depo (Warehouse)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Fiziksel mağaza ve ana depolarınızı ekleyin, xubeler arası transfer kurallarını belirleyin.</p>
          
          {!activeFeatures.includes("MOD_INVENTORY_MULTI") ? (
            <div className="text-xs font-bold text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-lg inline-block">
              Sadece Enterprise Paketinde
            </div>
          ) : (
            <button className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
              Yeni Depo Ekle &rarr;
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
