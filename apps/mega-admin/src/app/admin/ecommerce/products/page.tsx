import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { 
  Box, Search, Filter, Plus, 
  ArrowRight, Image as ImageIcon, Tags, Globe 
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EcommerceProductsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("saas_session")?.value;
  if (!sessionCookie) redirect("/login");

  // Mevcut kullanıcının firmasını bul (Demo için ilk aktif firmayı alıyoruz)
  const firm = await prisma.firm.findFirst({
    where: { isActive: true },
    include: { package: true }
  });

  if (!firm) return <div>Firma bulunamadı.</div>;

  // Firmanın e-ticaret paketi var mı kontrol et
  let activeFeatures: string[] = [];
  try {
    if (firm.package?.features) activeFeatures = JSON.parse(firm.package.features);
  } catch (e) {}

  if (!activeFeatures.includes("MOD_ECOMMERCE_ORDERS")) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto text-center mt-20">
        <div className="w-24 h-24 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Box className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-4">E-Ticaret Modülü Aktif Değil</h2>
        <p className="text-slate-500 mb-8">Ürün Yönetimi (PIM) modülü aktif değildir. Özelliği kullanmak için Enterprise pakete geçix yapmalısınız.</p>
        <Link href="/admin/advanced-settings" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors">
          Paket Ayarlarına Git
        </Link>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: { FirmId: firm.id },
    include: {
      variants: true,
      options: true,
      channelVisibility: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Box className="w-8 h-8 text-fuchsia-600" />
            Ürün & Katalog (PIM)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            E-Ticaret vitrininiz, B2B paneliniz ve mağaza kasanızdaki tüm ürünleri tek merkezden yönetin.
          </p>
        </div>
        <Link href="/admin/ecommerce/products/new" className="px-5 py-2.5 bg-fuchsia-600 text-white font-medium rounded-xl hover:bg-fuchsia-700 transition-colors flex items-center gap-2 self-start md:self-auto">
          <Plus className="w-4 h-4" /> Yeni Ürün Ekle
        </Link>
      </div>

      {/* Ürün Listesi */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Arama ve Filtreler */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Ürün Adı, SKU veya Barkod ara..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 w-full md:w-auto justify-center">
            <Filter className="w-4 h-4" />
            Kategori Filtrele
          </button>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Ürün</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Fiyat</th>
                <th className="px-6 py-4">Varyant & Stok</th>
                <th className="px-6 py-4">Görünürlük</th>
                <th className="px-6 py-4 text-right">İxlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Box className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">Henüz ürün eklemediniz.</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.imageUrls?.[0] ? (
                          <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{product.name}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">SKU: {product.sku || 'Belirtilmedi'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <Tags className="w-3 h-3" /> {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {product.price.toLocaleString("tr-TR")}  
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{product.variants.length} Varyant</p>
                      <p className="text-xs text-slate-500 mt-0.5">Toplam: {product.variants.reduce((acc, v) => acc + v.stock, 0)} Stok</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {product.channelVisibility?.showOnWeb && (
                          <span className="text-[10px] uppercase font-bold text-sky-600 bg-sky-50 dark:bg-sky-500/10 px-2 py-1 rounded-md" title="Web Vitrini">WEB</span>
                        )}
                        {product.channelVisibility?.showOnB2B && (
                          <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md" title="B2B Toptan">B2B</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/ecommerce/products/${product.id}`}
                        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-lg transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
