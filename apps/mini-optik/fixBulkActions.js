const fs = require('fs');
let content = fs.readFileSync('src/components/inventory/BulkActionsPanel.tsx', 'utf8');

// 1. Add selectedItemIds?: string[]; to BulkPriceUpdateModalProps
const propsInterface = `interface BulkPriceUpdateModalProps {
  inline?: boolean;
  products: any[];
  onClose: () => void;
  onComplete: () => void;
}`;
const newPropsInterface = `interface BulkPriceUpdateModalProps {
  inline?: boolean;
  products: any[];
  selectedItemIds?: string[];
  onClose: () => void;
  onComplete: () => void;
}`;
content = content.replace(propsInterface, newPropsInterface);

// 2. Add selectedItemIds to props destructuring
const propsDestructuring = `export default function BulkPriceUpdateModal({ products, onClose, onComplete, inline = false }: BulkPriceUpdateModalProps) {`;
const newPropsDestructuring = `export default function BulkPriceUpdateModal({ products, onClose, onComplete, inline = false, selectedItemIds }: BulkPriceUpdateModalProps) {`;
content = content.replace(propsDestructuring, newPropsDestructuring);

// 3. Update affectedProducts useMemo
const oldAffectedProducts = `const affectedProducts = useMemo(() => {
    return products.filter(p => {
      if (targetType === "ALL") return true;
      if (targetType === "BRAND" && p.brand === targetValue) return true;
      if (targetType === "CATEGORY" && p.category === targetValue) return true;
      return false;
    });
  }, [products, targetType, targetValue]);`;
const newAffectedProducts = `const affectedProducts = useMemo(() => {
    if (selectedItemIds && selectedItemIds.length > 0) {
      return products.filter(p => selectedItemIds.includes(p.id));
    }
    return products.filter(p => {
      if (targetType === "ALL") return true;
      if (targetType === "BRAND" && p.brand === targetValue) return true;
      if (targetType === "CATEGORY" && p.category === targetValue) return true;
      return false;
    });
  }, [products, targetType, targetValue, selectedItemIds]);`;
content = content.replace(oldAffectedProducts, newAffectedProducts);

// 4. Update the Target Selection section
const oldTargetSelectionRegex = /\{\/\* Target Selection \*\/\}\s*<div className="space-y-4">[\s\S]*?Etkilenecek Ürün Sayısı:<\/span>\s*<span className="text-base font-black text-indigo-900 dark:text-indigo-300 px-3 py-1 bg-white dark:bg-indigo-900\/50 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800">\{affectedProducts\.length\} Adet<\/span>\s*<\/div>\s*<\/div>/;

const newTargetSelection = `{/* Target Selection */}
          {(!selectedItemIds || selectedItemIds.length === 0) ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Box className="w-4 h-4 text-indigo-500" /> Hedef Ürün Kapsamı
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => { setTargetType("ALL"); setTargetValue(""); }} className={\`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all border-2 flex items-center justify-center \${targetType === "ALL" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"}\`}>
                  Tüm Ürünler
                </button>
                <button onClick={() => { setTargetType("BRAND"); setTargetValue(brands[0] || ""); }} className={\`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all border-2 flex items-center justify-center \${targetType === "BRAND" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"}\`}>
                  Marka Bazlı
                </button>
                <button onClick={() => { setTargetType("CATEGORY"); setTargetValue(categories[0] || ""); }} className={\`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all border-2 flex items-center justify-center \${targetType === "CATEGORY" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"}\`}>
                  Kategori Bazlı
                </button>
              </div>

              {targetType === "BRAND" && (
                <div className="animate-in slide-in-from-top-2 pt-2">
                  <select value={targetValue} onChange={e => setTargetValue(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                    {brands.length === 0 ? <option value="">Marka bulunamadı</option> : brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}

              {targetType === "CATEGORY" && (
                <div className="animate-in slide-in-from-top-2 pt-2">
                  <select value={targetValue} onChange={e => setTargetValue(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                    {categories.length === 0 ? <option value="">Kategori bulunamadı</option> : categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
              
              <div className="bg-indigo-50/50 dark:bg-indigo-500/5 px-4 py-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-400">Etkilenecek Ürün Sayısı:</span>
                <span className="text-base font-black text-indigo-900 dark:text-indigo-300 px-3 py-1 bg-white dark:bg-indigo-900/50 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800">{affectedProducts.length} Adet</span>
              </div>
            </div>
          ) : (
            <div className="bg-indigo-50/50 dark:bg-indigo-500/5 px-5 py-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-base font-black text-indigo-800 dark:text-indigo-300">Seçili Ürünler</span>
                <span className="text-sm font-medium text-indigo-600/70 dark:text-indigo-400/70">Sadece önceden seçtiğiniz ürünler etkilenecektir.</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-indigo-500 font-bold mb-1">Adet</span>
                <span className="text-2xl font-black text-indigo-900 dark:text-indigo-100 px-4 py-1.5 bg-white dark:bg-indigo-900/50 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800">{affectedProducts.length}</span>
              </div>
            </div>
          )}`;

content = content.replace(oldTargetSelectionRegex, newTargetSelection);

fs.writeFileSync('src/components/inventory/BulkActionsPanel.tsx', content, 'utf8');
console.log("Updated BulkActionsPanel.tsx successfully.");
