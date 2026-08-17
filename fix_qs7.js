const fs = require('fs');
let c = fs.readFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', 'utf8');
let l = c.split('\n');

const fixes = [
  { i: 1333, from: 'activeSupplierId  (', to: 'activeSupplierId ? (' }
];

fixes.forEach(f => {
    l[f.i] = l[f.i].replace(f.from, f.to);
});

fs.writeFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', l.join('\n'), 'utf8');
console.log('Fixed fix_qs7');
