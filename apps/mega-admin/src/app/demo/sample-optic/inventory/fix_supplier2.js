const fs = require('fs');
const file = 'c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// 1. Remove duplicate handlers in SettingsModal
// Let's find exactly the line: `      {!activeSupplierId && (` that is out of place inside SettingsModal
let outOfPlaceIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('SettingsModal = () => {')) {
    for (let j = i; j < lines.length; j++) {
      if (lines[j].includes('{!activeSupplierId && (')) {
        outOfPlaceIdx = j;
        break;
      }
    }
    break;
  }
}

if (outOfPlaceIdx !== -1) {
  // It should be followed by handleAdd and handleRemove until `return (`
  let endIdx = -1;
  for (let j = outOfPlaceIdx; j < lines.length; j++) {
    if (lines[j].includes('return (') && lines[j+1] && lines[j+1].includes('className="fixed inset-0')) {
      endIdx = j;
      break;
    }
  }
  
  if (endIdx !== -1) {
    // delete lines from outOfPlaceIdx to endIdx - 1
    lines.splice(outOfPlaceIdx, endIdx - outOfPlaceIdx);
  }
}

// 2. Fix SupplierModal end
// Find the exact line `  );` right after `              ))}` that belongs to SupplierModal
let supplierCloseIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('SupplierModal = () => (')) {
    for (let j = i; j < lines.length; j++) {
      if (lines[j].trim() === ');' && lines[j-1].includes('))}')) {
        supplierCloseIdx = j;
        break;
      }
    }
    break;
  }
}

if (supplierCloseIdx !== -1) {
  const replacement = `            </div></div>
          <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">Cari Bakiye ( )</label>
            <input type="number" value={supForm.balance || 0} onChange={e => setSupForm(f => ({ ...f, balance: +e.target.value }))}
              className="w-full px-3 py-2.5 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
          <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">Not</label>
            <textarea value={supForm.notes || ""} onChange={e => setSupForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full px-3 py-2.5 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none resize-none" /></div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setShowSupplierModal(false)} className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-foreground rounded-xl text-sm font-bold hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors">İptal</button>
            <button onClick={handleSaveSupplier} className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-colors">Kaydet</button>
          </div>
        </div>
      </div>
    </div>
  );`;
  
  lines[supplierCloseIdx] = replacement;
}

fs.writeFileSync(file, lines.join('\n'));
console.log('Fixed file via lines');
