import sys
import re

file_path = "c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix ChevronRight, User
content = content.replace("<ChevronRight, User", "<ChevronRight")
content = content.replace("<ChevronRight", "<ChevronRight") # Make sure User is imported, we don't need User in the JSX tag, it's just <ChevronRight className="..." /> and maybe <User className="..." /> but we can just leave ChevronRight.

# 2. Fix SupplierModal closing tags
supplier_modal_end = """                </button>
              ))}
  );"""

supplier_modal_fixed = """                </button>
              ))}
            </div>
          </div>
          <div className="px-6 py-5 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button onClick={() => setShowSupplierModal(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">İptal</button>
            <button onClick={handleSaveSupplier} className="px-4 py-2 bg-[#4f818c] text-white rounded-xl text-sm font-bold hover:bg-[#3a616a] transition-colors">Kaydet</button>
          </div>
        </div>
      </div>
    </div>
  );"""
content = content.replace(supplier_modal_end, supplier_modal_fixed)

# 3. Fix SettingsModal corruption
settings_modal_broken = """    const handleRemove = (k: string) => {
      const copy = { ...localCats };
      delete copy[k];
      setLocalCats(copy);
    };
      {!activeSupplierId && (

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
    };"""

settings_modal_fixed = """    const handleRemove = (k: string) => {
      const copy = { ...localCats };
      delete copy[k];
      setLocalCats(copy);
    };"""
content = content.replace(settings_modal_broken, settings_modal_fixed)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
