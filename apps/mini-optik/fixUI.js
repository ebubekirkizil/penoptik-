const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inventory/InventoryClient.tsx', 'utf8');

// 1. Add showBulkActions state
if (!content.includes('const [showBulkActions, setShowBulkActions]')) {
  content = content.replace(
    'const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);',
    'const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);\n  const [showBulkActions, setShowBulkActions] = useState(false);'
  );
}

// 2. Add Toplu Islemler button to the filter bar
const filterEndStr = `{(filterCategory !== "ALL" || filterBrand !== "ALL" || filterMinStock !== "" || filterMaxStock !== "" || sortConfig !== null || filterStock !== "ALL" || searchTerm !== "") && (`;
const bulkBtnStr = `
        <div className="w-full md:w-auto pr-1 pl-1 md:pl-2 pb-1 md:pb-0">
          <button onClick={() => setShowBulkActions(!showBulkActions)} className={\`w-full md:w-auto px-4 py-2.5 font-bold text-sm rounded-xl transition-colors whitespace-nowrap flex items-center justify-center gap-2 \${showBulkActions ? 'bg-indigo-600 text-white shadow-sm' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20'}\`}>
            <List className="w-4 h-4" /> Toplu İşlemler
          </button>
        </div>
        `;
if (content.includes(filterEndStr) && !content.includes('<List className="w-4 h-4" /> Toplu İşlemler')) {
  content = content.replace(filterEndStr, bulkBtnStr + filterEndStr);
}

// 3. Replace the old selectedItems.length > 0 bar with the new showBulkActions panel
const oldBulkBarRegex = /\{selectedItems\.length > 0 && \(\s*<div className="bg-indigo-50\/80[\s\S]*?<\/div>\s*\)\}/;
const newBulkPanel = `{showBulkActions && (
          <div className="bg-indigo-50/50 dark:bg-indigo-900/10 px-5 py-4 flex flex-col md:flex-row items-center justify-between border-b border-indigo-100 dark:border-indigo-800/30 gap-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-4">
              <button onClick={() => {
                if (selectedItems.length === filteredProducts.length) setSelectedItems([]);
                else setSelectedItems(filteredProducts.map(p => p.id));
              }} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                {selectedItems.length === filteredProducts.length ? "Seçimi Temizle" : "Tümünü Seç"}
              </button>
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 rounded-full">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">{selectedItems.length}</span>
                  <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Seçili</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button disabled={selectedItems.length === 0} onClick={() => setShowBulkPriceModal(true)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-500" /> Fiyat Güncelle
              </button>
              <button disabled={selectedItems.length === 0} onClick={() => {
                router.push("/admin/inventory?tab=LABELS");
              }} className="px-4 py-2 bg-indigo-600 border border-indigo-600 rounded-lg text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <Barcode className="w-4 h-4" /> Etiket Yazdır
              </button>
              <button disabled={selectedItems.length === 0} onClick={() => {
                setDeleteTarget("BULK");
                setShowDeleteConfirm(true);
              }} className="px-4 py-2 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/30 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Toplu Sil
              </button>
            </div>
          </div>
        )}`;

content = content.replace(oldBulkBarRegex, newBulkPanel);

// 4. Update the expanded row to show QR instead of just Barcode text
const oldExpandedRowBarcode = `<span className="text-[11px] text-muted-foreground mr-auto pl-2 font-mono flex items-center gap-1.5">
                              <Barcode className="w-3.5 h-3.5" /> {p.barcode || "-"}
                            </span>`;
const newExpandedRowBarcode = `<span className="flex items-center gap-3 mr-auto pl-2">
                              <div className="bg-white p-1 rounded border shadow-sm dark:border-slate-700">
                                <QRCodeSVG value={p.barcode || "0"} size={36} />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700 dark:text-slate-300">{p.model || p.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{p.barcode}</span>
                              </div>
                            </span>`;
content = content.replace(oldExpandedRowBarcode, newExpandedRowBarcode);

// 5. Change double click to trigger Edit instead of Details
const oldDoubleClick = `onDoubleClick={(e) => {
                      if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return;
                      if ((e.target as HTMLElement).closest('button')) return;
                      setSelectedProduct(p);
                      setShowDetailModal(true);
                    }}`;
const newDoubleClick = `onDoubleClick={(e) => {
                      if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return;
                      if ((e.target as HTMLElement).closest('button')) return;
                      handleOpenEdit(p);
                    }}`;
content = content.replace(oldDoubleClick, newDoubleClick);

fs.writeFileSync('src/app/admin/inventory/InventoryClient.tsx', content, 'utf8');
console.log('Successfully updated InventoryClient.tsx');
