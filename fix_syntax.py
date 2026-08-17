import sys

file_path = "c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# 1. Fix ChevronRight, User
for i in range(len(lines)):
    if "<ChevronRight, User" in lines[i]:
        lines[i] = lines[i].replace("<ChevronRight, User", "<ChevronRight")

# 2. Fix SupplierModal missing closing tags around line 1206
for i in range(len(lines)):
    if "  const SettingsModal = () => {" in lines[i]:
        settings_modal_index = i
        break

# Insert missing closing tags for SupplierModal right before SettingsModal
# Wait, SupplierModal ends at:
# 1205:               ))}
# 1206:   );
# This is invalid JSX. It's missing `</div></div></div>...`
# Let's find line 1205 (where `categories[k].label` is mapped)
for i in range(len(lines)):
    if "  // ─── ANA RENDER ───────────────────────────────────────────────────────────" in lines[i]:
        ana_render_idx = i
        break

for i in range(ana_render_idx - 10, ana_render_idx):
    if lines[i].strip() == ");":
        # This is where SupplierModal closes!
        lines[i] = """              </div>
            </div>
          </div>
          <div className="px-6 py-5 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button onClick={() => setShowSupplierModal(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">İptal</button>
            <button onClick={() => {}} className="px-4 py-2 bg-[#4f818c] text-white rounded-xl text-sm font-bold hover:bg-[#3a616a] transition-colors">Kaydet</button>
          </div>
        </div>
      </div>
    </div>
  );
"""

# 3. Fix SettingsModal corruption
# Around line 1237:
# 1236:     };
# 1237:       {!activeSupplierId && (
# 1238: 
# 1239:     const handleAdd = () => {
# 1240:       if(!newCatLabel) return;
for i in range(len(lines)):
    if "{!activeSupplierId && (" in lines[i]:
        # Is it inside SettingsModal? (Before main render)
        if i < ana_render_idx + 100:
            lines[i] = ""
            lines[i+1] = ""
            # SettingsModal has duplicated handleAdd and handleRemove.
            # I can just remove the duplicated ones.
            # Let's find the closing of SettingsModal.
            # Actually, let's just rewrite SettingsModal properly or remove the broken lines.
            pass

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(lines)
