import sys

file_path = "c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace filterStock useState
old_state = '  const [filterStock, setFilterStock]       = useState<"ALL" | "CRITICAL" | "OK">("ALL");'
new_state = '  const [filterStock, setFilterStock]       = useState<"ALL" | "CRITICAL" | "OK" | "EMPTY">("ALL");'
content = content.replace(old_state, new_state)

# Replace filter logic
old_filter = """      if (filterStock === "CRITICAL" && p.stock > p.criticalLimit) return false;
      if (filterStock === "OK"       && p.stock <= p.criticalLimit) return false;"""

new_filter = """      if (filterStock === "CRITICAL" && p.stock > p.criticalLimit) return false;
      if (filterStock === "EMPTY"    && p.stock > 0) return false;
      if (filterStock === "OK"       && p.stock <= p.criticalLimit) return false;"""
content = content.replace(old_filter, new_filter)

# Replace onClick
old_click = '            <div key={i} onClick={() => { if(stat.type === "CRITICAL" || stat.type === "EMPTY") { setActiveTab("CRITICAL"); } else if(stat.type === "SUPPLIERS") { setActiveTab("SUPPLIERS"); } else { setActiveTab("INVENTORY"); setFilterCategory("ALL"); } }}'
new_click = '            <div key={i} onClick={() => { if(stat.type === "CRITICAL") { setActiveTab("INVENTORY"); setFilterStock("CRITICAL"); } else if(stat.type === "EMPTY") { setActiveTab("INVENTORY"); setFilterStock("EMPTY"); } else if(stat.type === "SUPPLIERS") { setActiveTab("SUPPLIERS"); } else { setActiveTab("INVENTORY"); setFilterCategory("ALL"); setFilterStock("ALL"); } }}'
content = content.replace(old_click, new_click)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated filterStock and onClick logic")
