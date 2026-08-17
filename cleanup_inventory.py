import sys
import re

file_path = "c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# The exact block that was injected
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
  };"""

# 1. Strip out all injected copies!
# Because indentation might be slightly different in each location, we can use a regex to remove all of them.
# The block starts with "const renderSettings = () => {" and ends with "  };"
pattern = r"([ \t]*)const renderSettings = \(\) => \{\n(?:.*?)\n\1\};\n?"
content = re.sub(pattern, "", content, flags=re.DOTALL)

# 2. Add it BACK only ONCE, right before the main return statement of InventoryClient.
# The main return starts near the end of InventoryClient.
# We can find `return (\n    <div className="page-container space-y-6 animate-in fade-in duration-500">`
main_return = """  return (
    <div className="page-container space-y-6 animate-in fade-in duration-500">"""
content = content.replace(main_return, render_settings_func + "\n\n" + main_return)

# 3. Fix getSupplierName crash (optional chaining)
content = content.replace("suppliers.find(s => s.id === id).name", "suppliers.find(s => s.id === id)?.name")

# 4. Redesign renderMovements table styling
old_movements_table = """      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800/50 border-b border-[var(--border-color)]">
              <tr>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Tarih</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Ürün</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Sebep</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-center">Miktar</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Not / Personel</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-right">İşlem</th>
              </tr>
            </thead>"""
new_movements_table = """      <div className="card overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl">
        <div className="bg-slate-50/50 dark:bg-slate-800/20 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><ArrowUpDown className="w-4 h-4 text-primary" /> Stok Hareket Dökümü</h3>
          <span className="text-xs font-medium text-slate-500 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">{movements.length} Kayıt</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Tarih</th>
                <th className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Ürün</th>
                <th className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Sebep</th>
                <th className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider text-center">Miktar</th>
                <th className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Not / Personel</th>
                <th className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider text-right">İşlem</th>
              </tr>
            </thead>"""
content = content.replace(old_movements_table, new_movements_table)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Movements table styling enhanced and cleanups applied!")
