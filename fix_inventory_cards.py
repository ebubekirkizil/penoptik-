import sys
import re

file_path = "c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add imports if missing
if "TrendingDown" not in content:
    content = content.replace("import { Package, X, AlertTriangle", "import { Package, X, AlertTriangle, TrendingDown, TrendingUp, ArrowUpRight")
else:
    # already imported? Just try replacing directly
    content = re.sub(r'import {([^}]+)} from "lucide-react";', lambda m: f'import {{{m.group(1)}, TrendingDown, TrendingUp, ArrowUpRight}} from "lucide-react";' if "TrendingDown" not in m.group(1) else m.group(0), content)

# 2. Replace the old cards block
old_cards = """      {!activeSupplierId && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Toplam SKU", value: products.length, icon: Package, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/50", type: "ALL" },
            { label: "Kritik Stok", value: products.filter(p => p.stock <= p.criticalLimit).length, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/50", type: "CRITICAL" },
            { label: "Tükenenler", value: products.filter(p => p.stock === 0).length, icon: X, color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/50", type: "EMPTY" },
            { label: "Aktif Tedarikçi", value: suppliers.length, icon: Truck, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/50", type: "SUPPLIERS" },
          ].map((stat, i) => (
            <div key={i} onClick={() => { if(stat.type === "CRITICAL") { setActiveTab("INVENTORY"); setFilterStock("CRITICAL"); } else if(stat.type === "EMPTY") { setActiveTab("INVENTORY"); setFilterStock("EMPTY"); } else if(stat.type === "SUPPLIERS") { setActiveTab("SUPPLIERS"); } else { setActiveTab("INVENTORY"); setFilterCategory("ALL"); setFilterStock("ALL"); } }} 
                 className="card p-5 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{stat.value}</p>
              <p className="text-xs font-bold text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}"""

new_cards = """      {!activeSupplierId && activeTab !== "SETTINGS" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {(activeTab === "SUPPLIERS" ? [
            { label: "TOPLAM TEDARİKÇİ", value: suppliers.length, icon: Truck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-800", gradient: "from-emerald-500/10 to-green-500/10", type: "SUPPLIERS_ALL", subtitle: "Sistemde kayıtlı aktif tedarikçi" },
            { label: "TOPLAM BORÇ", value: "124.500 ₺", icon: TrendingDown, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-100 dark:border-rose-800", gradient: "from-rose-500/10 to-red-500/10", type: "SUPPLIERS_DEBT", subtitle: "Tedarikçilere olan açık bakiye" },
            { label: "AYLIK ALIM", value: "85.200 ₺", icon: ArrowUpRight, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-800", gradient: "from-blue-500/10 to-indigo-500/10", type: "SUPPLIERS_MONTHLY", subtitle: "Bu ayki toplam fatura girişi" },
            { label: "ÖDEME BEKLEYEN", value: "3", icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-800", gradient: "from-amber-500/10 to-orange-500/10", type: "SUPPLIERS_PENDING", subtitle: "Vadesi yaklaşan ödemeler" },
          ] : [
            { label: "TOPLAM SKU", value: products.length, icon: Package, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-800", gradient: "from-blue-500/10 to-indigo-500/10", type: "ALL", subtitle: "Depodaki toplam çeşit sayısı" },
            { label: "KRİTİK STOK", value: products.filter(p => p.stock <= p.criticalLimit && p.stock > 0).length, icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-800", gradient: "from-amber-500/10 to-orange-500/10", type: "CRITICAL", subtitle: "Sınırın altındaki ürünler" },
            { label: "TÜKENENLER", value: products.filter(p => p.stock === 0).length, icon: X, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-100 dark:border-rose-800", gradient: "from-rose-500/10 to-red-500/10", type: "EMPTY", subtitle: "Stoğu tamamen biten ürünler" },
            { label: "STOK DEĞERİ", value: (products.reduce((acc, p) => acc + ((p.costPrice || 0) * p.stock), 0)).toLocaleString("tr-TR") + " ₺", icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-800", gradient: "from-emerald-500/10 to-green-500/10", type: "VALUE", subtitle: "Alış fiyatı üzerinden maliyet" },
          ]).map((stat, i) => (
            <div key={i} onClick={() => { 
                if(stat.type === "CRITICAL") { router.push("?tab=INVENTORY"); setFilterStock("CRITICAL"); } 
                else if(stat.type === "EMPTY") { router.push("?tab=INVENTORY"); setFilterStock("EMPTY"); } 
                else if(stat.type === "ALL") { router.push("?tab=INVENTORY"); setFilterStock("ALL"); }
                else if(stat.type.startsWith("SUPPLIERS")) { router.push("?tab=SUPPLIERS"); }
              }} 
                 className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group flex flex-col cursor-pointer">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} rounded-bl-full opacity-50 transition-transform group-hover:scale-110`}></div>
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${stat.bg} ${stat.color} ${stat.border}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{stat.label}</h3>
              </div>
              <div className="mt-auto relative z-10">
                <div className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">{stat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}"""

content = content.replace(old_cards, new_cards)


# 3. Add Settings tab in rendering list
old_render_list = """      {activeTab === "INVENTORY" && renderInventory()}
      {activeTab === "CRITICAL" && renderCritical()}
      {activeTab === "MOVEMENTS" && renderMovements()}
      {activeTab === "SUPPLIERS" && renderSuppliers()}

      {showAddModal && <ProductModal />}"""

new_render_list = """      {activeTab === "INVENTORY" && renderInventory()}
      {activeTab === "CRITICAL" && renderCritical()}
      {activeTab === "MOVEMENTS" && renderMovements()}
      {activeTab === "SUPPLIERS" && renderSuppliers()}
      {activeTab === "SETTINGS" && renderSettings()}

      {showAddModal && <ProductModal />}"""

content = content.replace(old_render_list, new_render_list)

# 4. Add renderSettings function after renderSuppliers
# Wait, I can just define renderSettings anywhere inside InventoryClient
render_settings_func = """  const renderSettings = () => {
    return (
      <div className="page-container animate-in fade-in slide-in-from-bottom-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Envanter ve Depo Ayarları
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Genel Depo Ayarları</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Kritik Stok Uyarısı</p>
                  <p className="text-xs text-slate-500 mt-1">Ürünler varsayılan limitin altına düştüğünde uyarı verilir</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Otomatik Tedarik Siparişi</p>
                  <p className="text-xs text-slate-500 mt-1">Kritik stok seviyesine inen ürünleri taslak siparişe ekle</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Kategori Yönetimi</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">OPTIK_CERCEVE</span>
                <span className="text-xs font-bold text-slate-500">Aktif</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">GUNES_GOZLUGU</span>
                <span className="text-xs font-bold text-slate-500">Aktif</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">OPTIK_CAM</span>
                <span className="text-xs font-bold text-slate-500">Aktif</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">KONTAKT</span>
                <span className="text-xs font-bold text-slate-500">Aktif</span>
              </div>
              <button className="w-full mt-2 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-500 hover:text-primary hover:border-primary/50 transition-colors">
                + Yeni Kategori Ekle
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
"""

content = content.replace("  return (", render_settings_func + "\n  return (")

# 5. Add "Ayarlar" to the Tabs menu
old_tabs = """        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-[var(--border-color)]">
          {[
            { id: "INVENTORY", label: "Tüm Envanter", icon: LayoutGrid },
            { id: "CRITICAL", label: "Kritik Stok", icon: AlertTriangle },
            { id: "MOVEMENTS", label: "Hareketler", icon: ArrowUpDown },
            { id: "SUPPLIERS", label: "Tedarikçiler", icon: Truck },
          ].map(t => (
            <button key={t.id} onClick={() => router.push(`?tab=${t.id}`)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === t.id ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>"""

new_tabs = """        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-[var(--border-color)] overflow-x-auto">
          {[
            { id: "INVENTORY", label: "Tüm Envanter", icon: LayoutGrid },
            { id: "CRITICAL", label: "Kritik Stok", icon: AlertTriangle },
            { id: "MOVEMENTS", label: "Hareketler", icon: ArrowUpDown },
            { id: "SUPPLIERS", label: "Tedarikçiler", icon: Truck },
            { id: "SETTINGS", label: "Ayarlar", icon: Settings },
          ].map(t => (
            <button key={t.id} onClick={() => router.push(`?tab=${t.id}`)}
              className={`flex items-center whitespace-nowrap gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === t.id ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>"""

content = content.replace(old_tabs, new_tabs)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Fixes applied successfully!")
