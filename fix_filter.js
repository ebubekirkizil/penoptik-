const fs = require('fs');
const file = 'c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /useState<"ALL" \| "CRITICAL" \| "OK">/,
  'useState<"ALL" | "CRITICAL" | "EMPTY" | "OK">'
);

content = content.replace(
  /if \(\s*filterStock === "CRITICAL" && p\.stock > p\.criticalLimit\s*\) return false;\s*if \(\s*filterStock === "OK"\s*&& p\.stock <= p\.criticalLimit\s*\) return false;/,
  `if (filterStock === "CRITICAL" && p.stock > p.criticalLimit) return false;\n      if (filterStock === "EMPTY" && p.stock > 0) return false;\n      if (filterStock === "OK" && p.stock <= p.criticalLimit) return false;`
);

content = content.replace(
  /onClick=\{\(\) => \{ if\(\s*stat\.type === "CRITICAL" \|\| stat\.type === "EMPTY"\s*\) \{ setActiveTab\("CRITICAL"\); \} else if\(\s*stat\.type === "SUPPLIERS"\s*\) \{ setActiveTab\("SUPPLIERS"\); \} else \{ setActiveTab\("INVENTORY"\); setFilterCategory\("ALL"\); \} \}\}/,
  `onClick={() => { if(stat.type === "CRITICAL") { setActiveTab("INVENTORY"); setFilterStock("CRITICAL"); setFilterCategory("ALL"); } else if (stat.type === "EMPTY") { setActiveTab("INVENTORY"); setFilterStock("EMPTY"); setFilterCategory("ALL"); } else if(stat.type === "SUPPLIERS") { setActiveTab("SUPPLIERS"); } else { setActiveTab("INVENTORY"); setFilterStock("ALL"); setFilterCategory("ALL"); } }}`
);

content = content.replace(
  /'bg-slate-50 dark:bg-slate-800\/50 border-slate-200 dark:border-slate-700\/50 text-slate-600 dark:text-slate-300'/,
  "'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-100'"
);

content = content.replace(
  /\{activeTab === "CRITICAL" && renderCritical\(\)\}/,
  ''
);

fs.writeFileSync(file, content);
console.log('Regex replace done');
