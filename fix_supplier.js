const fs = require('fs');
const file = 'c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\}\)\)\}\s*\);\s*\/\/\s*───\s*ANA\s*RENDER/;

const fix = `              }))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowSupplierModal(false)} className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-foreground rounded-xl text-sm font-bold hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors">İptal</button>
            <button onClick={handleSaveSupplier} className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-colors">
              {editingSupplier ? "Güncelle" : "Tedarikçi Ekle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── ANA RENDER`;

if (regex.test(content)) {
  content = content.replace(regex, fix);
  fs.writeFileSync(file, content);
  console.log('Fixed');
} else {
  console.log('Not found');
}
