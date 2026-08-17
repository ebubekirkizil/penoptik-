const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inventory/InventoryClient.tsx', 'utf8');

const oldBtn = `<button 
          onClick={() => { setFilterCategory("ALL"); setFilterBrand("ALL"); setFilterMinStock(""); setFilterMaxStock(""); setSortConfig(null); setSearchTerm(""); }}
          className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Filtreleri Temizle"
        >
          <X className="w-5 h-5" />
        </button>`;

const newBtn = `{(filterCategory !== 'ALL' || filterBrand !== 'ALL' || filterMinStock !== '' || filterMaxStock !== '' || sortConfig !== null || searchTerm !== '') && (
        <button 
          onClick={() => { setFilterCategory("ALL"); setFilterBrand("ALL"); setFilterMinStock(""); setFilterMaxStock(""); setSortConfig(null); setSearchTerm(""); }}
          className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors font-bold text-sm flex items-center gap-2 shadow-sm animate-in fade-in zoom-in-95 duration-200"
        >
          <X className="w-4 h-4" /> Temizle
        </button>
        )}`;

if (content.includes(oldBtn)) {
  content = content.replace(oldBtn, newBtn);
  fs.writeFileSync('src/app/admin/inventory/InventoryClient.tsx', content, 'utf8');
  console.log('Temizle button updated.');
} else {
  console.log('Old button not found');
}
