"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Plus, X, Upload, Save, 
  Package, DollarSign, Tag, Image as ImageIcon,
  Layers, Globe, AlertCircle
} from "lucide-react";
import Link from "next/link";

type ProductVariant = {
  id: string;
  size: string;
  color: string;
  material: string;
  sku: string;
  barcode: string;
  stock: number;
  price: number | null;
};

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Product Basic Info
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [vendor, setVendor] = useState("Davut Kundura Atölyesi");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [weight, setWeight] = useState("");
  const [trackInventory, setTrackInventory] = useState(true);
  const [lowStockAlert, setLowStockAlert] = useState("5");
  
  // Channel Visibility
  const [showOnWeb, setShowOnWeb] = useState(true);
  const [showOnB2B, setShowOnB2B] = useState(false);
  const [showOnPOS, setShowOnPOS] = useState(false);

  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [showVariantForm, setShowVariantForm] = useState(false);

  // Generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    const slugified = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(slugified);
  };

  // Add Variant
  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      size: "",
      color: "",
      material: "",
      sku: "",
      barcode: "",
      stock: 0,
      price: null
    };
    setVariants([...variants, newVariant]);
  };

  // Remove Variant
  const removeVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  // Update Variant
  const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    setVariants(variants.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          shortDesc,
          price: parseFloat(price),
          compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
          costPrice: costPrice ? parseFloat(costPrice) : null,
          category,
          vendor,
          sku: sku || null,
          barcode: barcode || null,
          weight: weight ? parseFloat(weight) : null,
          trackInventory,
          lowStockAlert: parseInt(lowStockAlert),
          showOnWeb,
          showOnB2B,
          showOnPOS,
          variants: variants.map(v => ({
            ...v,
            stock: parseInt(v.stock.toString()),
            price: v.price ? parseFloat(v.price.toString()) : null
          }))
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ürün eklenemedi");
      }

      router.push("/admin/ecommerce/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/ecommerce/products"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Ürün Listesine Dön
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-fuchsia-600" />
            Yeni Ürün Ekle
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Ürün bilgilerini girin, varyantlar ekleyin ve görünürlük ayarlarını yapın.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-100">Hata</p>
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Information */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-fuchsia-600" />
              Temel Bilgiler
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-slate-900 dark:text-white"
                  placeholder="Örn: Ortopedik Taban"
                  required
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-slate-900 dark:text-white font-mono text-sm"
                  placeholder="ortopedik-taban"
                />
                <p className="text-xs text-slate-500 mt-1">Otomatik oluxturuldu, düzenleyebilirsiniz</p>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Kısa Açıklama
                </label>
                <input
                  type="text"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-slate-900 dark:text-white"
                  placeholder="Liste görünümünde gösterilecek kısa açıklama"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Detaylı Açıklama
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-slate-900 dark:text-white resize-none"
                  placeholder="Ürün hakkında detaylı bilgi..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Kategori *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-slate-900 dark:text-white"
                  required
                >
                  <option value="ORTHOPEDIC_INSOLE">Ortopedik Taban</option>
                  <option value="BELT">Kemer</option>
                  <option value="SHOE_CARE">Ayakkabı Bakımı</option>
                  <option value="LUGGAGE_PARTS">Valiz Parçaları</option>
                  <option value="OTHER">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Tedarikçi
                </label>
                <input
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Fiyatlandırma
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Satıx Fiyatı ( ) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Karxılaxtırma Fiyatı ( )
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white"
                  placeholder="0.00"
                />
                <p className="text-xs text-slate-500 mt-1">Üstü çizili eski fiyat</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Maliyet Fiyatı ( )
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white"
                  placeholder="0.00"
                />
                <p className="text-xs text-slate-500 mt-1">Müxteri görmez</p>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Stok & Envanter
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                  placeholder="PROD-001"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Barkod
                </label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                  placeholder="123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Ağırlık (gram)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Düxük Stok Uyarısı
                </label>
                <input
                  type="number"
                  value={lowStockAlert}
                  onChange={(e) => setLowStockAlert(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                  placeholder="5"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={trackInventory}
                    onChange={(e) => setTrackInventory(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Stok takibi yap
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Channel Visibility */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-600" />
              Kanal Görünürlüğü
            </h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 transition-colors">
                <input
                  type="checkbox"
                  checked={showOnWeb}
                  onChange={(e) => setShowOnWeb(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-2 focus:ring-cyan-500/20"
                />
                <div>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">Web Vitrini</span>
                  <span className="text-xs text-slate-500">Müxteri e-ticaret sitesinde görünsün</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition-colors">
                <input
                  type="checkbox"
                  checked={showOnB2B}
                  onChange={(e) => setShowOnB2B(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-2 focus:ring-amber-500/20"
                />
                <div>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">B2B Portalı</span>
                  <span className="text-xs text-slate-500">Toptan / Bayi portalında görünsün</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-purple-500/50 transition-colors">
                <input
                  type="checkbox"
                  checked={showOnPOS}
                  onChange={(e) => setShowOnPOS(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-2 focus:ring-purple-500/20"
                />
                <div>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">POS Kasa</span>
                  <span className="text-xs text-slate-500">Fiziksel mağaza kasasında görünsün</span>
                </div>
              </label>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-violet-600" />
                Varyantlar
              </h2>
              <button
                type="button"
                onClick={addVariant}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Varyant Ekle
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Henüz varyant eklenmedi.</p>
                <p className="text-xs mt-1">Farklı beden, renk veya materyal seçenekleri ekleyebilirsiniz.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {variants.map((variant) => (
                  <div key={variant.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Varyant #{variant.id}</span>
                      <button
                        type="button"
                        onClick={() => removeVariant(variant.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Beden (örn: 42)"
                        value={variant.size}
                        onChange={(e) => updateVariant(variant.id, "size", e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Renk (örn: Siyah)"
                        value={variant.color}
                        onChange={(e) => updateVariant(variant.id, "color", e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Materyal"
                        value={variant.material}
                        onChange={(e) => updateVariant(variant.id, "material", e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="SKU"
                        value={variant.sku}
                        onChange={(e) => updateVariant(variant.id, "sku", e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Barkod"
                        value={variant.barcode}
                        onChange={(e) => updateVariant(variant.id, "barcode", e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Stok"
                        value={variant.stock}
                        onChange={(e) => updateVariant(variant.id, "stock", parseInt(e.target.value) || 0)}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Fiyat (opsiyonel)"
                        value={variant.price || ""}
                        onChange={(e) => updateVariant(variant.id, "price", e.target.value ? parseFloat(e.target.value) : null)}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 justify-end pt-6 border-t border-slate-200 dark:border-slate-800">
            <Link
              href="/admin/ecommerce/products"
              className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-slate-400 text-white rounded-xl font-bold flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <>İxleniyor...</>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Ürünü Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
