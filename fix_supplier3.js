const fs = require('fs');
const file = 'c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `                </button>
              ))}
  );`;

const newStr = `                </button>
              ))}
            </div>
          </div>
          <div><label className="block text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">Açılış Bakiyesi (₺)</label>
            <input type="number" value={supForm.balance || 0} onChange={e => setSupForm(f => ({ ...f, balance: +e.target.value }))}
              className="w-full px-3 py-2.5 bg-background border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowSupplierModal(false)} className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-foreground rounded-xl text-sm font-bold hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors">İptal</button>
            <button onClick={handleSaveSupplier} className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-colors">Kaydet</button>
          </div>
        </div>
      </div>
    </div>
  );`;

content = content.replace(targetStr, newStr);
fs.writeFileSync(file, content);
console.log('Fixed SupplierModal corruption');
