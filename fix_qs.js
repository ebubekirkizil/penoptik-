const fs = require('fs');
let c = fs.readFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', 'utf8');
let l = c.split('\n');

l[258] = l[258].replace('editingProduct.id  {', 'editingProduct.id ? {');
l[1324] = l[1324].replace('skt === undefined  undefined', 'skt === undefined ? undefined');
l[1493] = l[1493].replace('editingSupplier  "Tedarikçiyi', 'editingSupplier ? "Tedarikçiyi');
l[1616] = l[1616].replace('balance < 0  Math.abs', 'balance < 0 ? Math.abs');
l[1701] = l[1701].replace('> 0  "border', '> 0 ? "border');
l[1705] = l[1705].replace('"ODENMEDI"  "border', '"ODENMEDI" ? "border');
l[1784] = l[1784].replace('"NAKIT"  "border', '"NAKIT" ? "border');
l[1787] = l[1787].replace('"HAVALE"  "border', '"HAVALE" ? "border');
l[1790] = l[1790].replace('"KREDI_KARTI"  "border', '"KREDI_KARTI" ? "border');

fs.writeFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', l.join('\n'), 'utf8');
console.log('Fixed question marks!');
