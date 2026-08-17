const fs = require('fs');
const file = 'c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix SupplierModal end
const supplierEnd = `                  {categories[k].label}
                </button>
              ))}
            </div></div>
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
    </div>`;

// Right now we have:
//                   {categories[k].label}
//                 </button>
//               ))}
//   );
content = content.replace(
  `                  {categories[k].label}
                </button>
              ))}
  );`,
  supplierEnd + '\\n  );'
);

// 2. Fix SettingsModal duplicate
// The file currently has:
/*
    const handleRemove = (k: string) => {
      const copy = { ...localCats };
      delete copy[k];
      setLocalCats(copy);
    };
      {!activeSupplierId && (

    const handleAdd = () => {
*/
// It's duplicated. Let's find SettingsModal.
const setStartIdx = content.indexOf('const SettingsModal = () => {');
const returnIdx = content.indexOf('return (\\n      <div className="fixed inset-0', setStartIdx);
const beforeReturn = content.substring(setStartIdx, returnIdx);

// Replace everything inside SettingsModal before return with the clean version
const cleanSettings = `  const SettingsModal = () => {
    const [localCats, setLocalCats] = useState(categories);
    const [newCatLabel, setNewCatLabel] = useState("");
    
    const handleSave = () => {
      setCategories(localCats);
      setShowSettingsModal(false);
    };

    const handleAdd = () => {
      if(!newCatLabel) return;
      const key = newCatLabel.toUpperCase().replace(/[^A-Z0-9]/g, "_");
      setLocalCats(prev => ({
        ...prev,
        [key]: { label: newCatLabel, bg: "#4f818c", text: "#ffffff" }
      }));
      setNewCatLabel("");
    };

    const handleRemove = (k: string) => {
      const copy = { ...localCats };
      delete copy[k];
      setLocalCats(copy);
    };

    `;

content = content.replace(beforeReturn, cleanSettings);

fs.writeFileSync(file, content);
console.log('Fixed file');
