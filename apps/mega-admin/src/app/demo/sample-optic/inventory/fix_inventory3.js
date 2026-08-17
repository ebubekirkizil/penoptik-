const fs = require('fs');
const txt = fs.readFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', 'utf8');
const lines = txt.split('\n');

const before = lines.slice(0, 1063);
const after = lines.slice(1271);
const correct = `                  Kritik Stok Limiti
                  <div className="relative group cursor-help">
                    <Info className="w-3 h-3 text-slate-400" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl text-center z-[500]">
                      Stok bu sayının altına düxtüğünde sistem size siparix uyarısı verir.
                    </div>
                  </div>
                </label>
                <input type="number" value={form.criticalLimit || 5} onChange={e => setForm(f => ({ ...f, criticalLimit: +e.target.value }))}
                  className="w-full px-3 py-2.5 bg-surface border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            </div>
          </div>`.split('\n');

fs.writeFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', [...before, ...correct, ...after].join('\n'));
