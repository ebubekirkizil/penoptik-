import sys

file_path = "c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx"

with open(file_path + ".bak", "r", encoding="utf-8") as f:
    content = f.read()

# Replace SupplierModal syntax
broken = """                </button>
              ))}
  );"""

fix = """                </button>
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
  );"""

if broken in content:
    content = content.replace(broken, fix)
    print("SupplierModal fixed")
else:
    print("SupplierModal broken string not found!")

# Replace ProductModal profit
profit_broken = "const profit = (form.salePrice || 0) - (form.costPrice || 0);"
profit_fix = """const kdvRate = form.kdv || 20;
                  const netSalePrice = (form.salePrice || 0) / (1 + kdvRate / 100);
                  const profit = netSalePrice - (form.costPrice || 0);"""

if profit_broken in content:
    content = content.replace(profit_broken, profit_fix)
    print("ProductModal profit fixed")
else:
    print("ProductModal profit broken string not found!")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
