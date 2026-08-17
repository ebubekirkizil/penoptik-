import sys
import re

file_path = "c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

bad = """    const handleAdd = () => {
      if(!newCatLabel) return;
      const key = newCatLabel.toUpperCase().replace(/[^A-Z0-9]/g, "_");
      setLocalCats(prev => ({
        ...prev,
        [key]: { label: newCatLabel, bg: "#4f818c", text: "#ffffff" }
      }));
      setNewCatLabel("");
    };

    const handleAdd = () => {
      if(!newCatLabel) return;
      const key = newCatLabel.toUpperCase().replace(/[^A-Z0-9]/g, "_");
      setLocalCats(prev => ({
        ...prev,
        [key]: { label: newCatLabel, bg: "#4f818c", text: "#ffffff" }
      }));
      setNewCatLabel("");
    };"""

good = """    const handleAdd = () => {
      if(!newCatLabel) return;
      const key = newCatLabel.toUpperCase().replace(/[^A-Z0-9]/g, "_");
      setLocalCats(prev => ({
        ...prev,
        [key]: { label: newCatLabel, bg: "#4f818c", text: "#ffffff" }
      }));
      setNewCatLabel("");
    };"""

if bad in content:
    content = content.replace(bad, good)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed double handleAdd")
else:
    print("Not found")
