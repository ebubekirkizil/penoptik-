const fs = require('fs');
const txt = fs.readFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', 'utf8');
const lines = txt.split('\n');

const correctBlock = `                  <div className="relative group cursor-help">
                    <Info className="w-3 h-3 text-slate-400" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl text-center z-[500]">
                      Stok bu sayının altına düxtüğünde sistem size siparix uyarısı verir.
                    </div>
                  </div>
                </label>
                <input type="number" value={form.criticalLimit || 5} onChange={e => setForm(f => ({ ...f, criticalLimit: +e.target.value }))}
                  className="w-full px-3 py-2.5 bg-surface border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            </div>
          </div>
          
          {/* Diğer Bilgiler */}
          <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-900/50 text-orange-600 flex items-center justify-center text-xs">4</span>
              Diğer Bilgiler
            </h3>
            
            {/* Tedarikçi */}
            <div className="mb-4">
              <label className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground text-opacity-80 mb-1">
                Tedarikçi
                <div className="relative group cursor-help">
                  <Info className="w-3 h-3 text-slate-400" />
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-[500]">
                    İsteğe bağlıdır. İsterseniz listeden bir tedarikçi seçebilir veya yeni bir isim yazabilirsiniz.
                  </div>
                </div>
              </label>`;

// splice lines from 1065 to 1083 (0-indexed 1064 to 1083) and insert correct block
lines.splice(1064, 20, correctBlock);

fs.writeFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', lines.join('\n'));
