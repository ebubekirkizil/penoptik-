const fs = require('fs');
const lines = fs.readFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', 'utf8').split(/\r?\n/);
lines.forEach((l, i) => {
  if (
    l.includes('useState<"ALL"') ||
    l.includes('filterStock === "CRITICAL"') ||
    l.includes('stat.type === "CRITICAL"') ||
    l.includes('bg-slate-800/50 border-slate-200')
  ) {
    console.log((i+1) + ': ' + l.trim());
  }
});
