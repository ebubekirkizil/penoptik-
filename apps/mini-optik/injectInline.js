const fs = require('fs');

let content = fs.readFileSync('src/app/admin/inventory/InventoryClient.tsx', 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Remove "Toplu İşlemler" button from top
const oldToplu = `                <button
                  onClick={() => setShowBulkPriceModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 mr-2"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Toplu İşlemler</span>
                </button>
`;
content = content.replace(oldToplu, '');

// Also I previously added QR Ekle next to "Yeni Ürün". Let's remove it from there.
const oldQR = `                <button
                  onClick={() => setShowQRScanner(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 mr-2"
                >
                  <Barcode className="w-4 h-4" />
                  <span className="hidden sm:inline">QR Ekle</span>
                </button>
`;
content = content.replace(oldQR, '');

// 2. Add QR Ekle to the Categories row
const categoryRow = `{Object.keys(categories).map(k => (
          <button 
            key={k}
            onClick={() => setFilterCategory(k as any)}
            className={\`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors \${filterCategory === k ? "bg-[#4f818c] text-white" : "bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm"}\`}
          >
            {categories[k].label} <span className={\`ml-1 text-xs \${filterCategory === k ? "text-white/80" : "bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md"}\`}>{products.filter(p => p.category === k).length}</span>
          </button>
        ))}
      </div>`;

const newCategoryRow = `{Object.keys(categories).map(k => (
          <button 
            key={k}
            onClick={() => setFilterCategory(k as any)}
            className={\`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors \${filterCategory === k ? "bg-[#4f818c] text-white" : "bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm"}\`}
          >
            {categories[k].label} <span className={\`ml-1 text-xs \${filterCategory === k ? "text-white/80" : "bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md"}\`}>{products.filter(p => p.category === k).length}</span>
          </button>
        ))}
        <div className="flex-1"></div>
        <button 
          onClick={() => setShowQRScanner(true)}
          className="px-4 py-1.5 rounded-full text-sm font-bold bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm ml-auto whitespace-nowrap"
        >
          <Barcode className="w-4 h-4" /> QR Ekle
        </button>
      </div>`;
content = content.replace(categoryRow, newCategoryRow);

// 3. Add "Toplu İşlemler" toggle into Filter row and render inline Modal below it.
const filterRowEnd = `<button 
          onClick={() => { setFilterCategory("ALL"); setFilterBrand("ALL"); setFilterMinStock(""); setFilterMaxStock(""); setSortConfig(null); setSearchTerm(""); }}
          className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Filtreleri Temizle"
        >
          <X className="w-5 h-5" />
        </button>
      </div>`;

const newFilterRowEnd = `<button 
          onClick={() => setShowBulkPriceModal(!showBulkPriceModal)}
          className={\`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors \${showBulkPriceModal ? "bg-indigo-600 text-white shadow-sm" : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20"}\`}
        >
          <List className="w-4 h-4" />
          <span className="hidden sm:inline">Toplu İşlemler</span>
        </button>

        <button 
          onClick={() => { setFilterCategory("ALL"); setFilterBrand("ALL"); setFilterMinStock(""); setFilterMaxStock(""); setSortConfig(null); setSearchTerm(""); }}
          className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Filtreleri Temizle"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {showBulkPriceModal && (
        <BulkPriceUpdateModal
          products={products}
          inline={true}
          onClose={() => setShowBulkPriceModal(false)}
          onComplete={() => {
            setShowBulkPriceModal(false);
            fetchProducts();
          }}
        />
      )}`;
content = content.replace(filterRowEnd, newFilterRowEnd);

// Also we need to remove the standalone BulkPriceModal at the end of the file.
const standaloneModal = `{showBulkPriceModal && (
        <BulkPriceUpdateModal
          products={products}
          onClose={() => setShowBulkPriceModal(false)}
          onComplete={() => {
            setShowBulkPriceModal(false);
            fetchProducts();
          }}
        />
      )}`;
content = content.replace(standaloneModal, '');

fs.writeFileSync('src/app/admin/inventory/InventoryClient.tsx', content, 'utf8');
console.log('InventoryClient updated for inline BulkPriceUpdateModal and buttons.');
