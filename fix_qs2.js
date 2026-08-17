const fs = require('fs');
let c = fs.readFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', 'utf8');
let l = c.split('\n');

const fixes = [
  { i: 351, from: 'filterCategory === "ALL"  "bg', to: 'filterCategory === "ALL" ? "bg' },
  { i: 353, from: 'filterCategory === "ALL"  "op', to: 'filterCategory === "ALL" ? "op' },
  { i: 359, from: 'filterCategory === k  "bg', to: 'filterCategory === k ? "bg' },
  { i: 361, from: 'filterCategory === k  "op', to: 'filterCategory === k ? "op' },
  { i: 871, from: 'form.category === k  "border', to: 'form.category === k ? "border' },
  { i: 1107, from: 'movForm.reason === k  ([', to: 'movForm.reason === k ? ([' },
  { i: 1107, from: 'includes(k)  "border', to: 'includes(k) ? "border' },
  { i: 1123, from: 'movForm.type === "GIRIS"  "bg', to: 'movForm.type === "GIRIS" ? "bg' },
  { i: 1125, from: 'movForm.type === "GIRIS"  "+"', to: 'movForm.type === "GIRIS" ? "+"' },
  { i: 1430, from: 'showInvoiceDetails === "INV-2026-081"  "8.000"', to: 'showInvoiceDetails === "INV-2026-081" ? "8.000"' },
  { i: 1438, from: 'showInvoiceDetails === "INV-2026-081"  "8.000"', to: 'showInvoiceDetails === "INV-2026-081" ? "8.000"' },
  { i: 1446, from: 'showInvoiceDetails === "INV-2026-081"  "8000"', to: 'showInvoiceDetails === "INV-2026-081" ? "8000"' },
  { i: 1493, from: 'order.status === \'İade Edildi\'  \'bg', to: 'order.status === \'İade Edildi\' ? \'bg' },
  { i: 1616, from: 'selectedProduct.stock <= selectedProduct.criticalLimit  \'text', to: 'selectedProduct.stock <= selectedProduct.criticalLimit ? \'text' },
  { i: 1701, from: 'm.type === \'GIRIS\'  \'bg', to: 'm.type === \'GIRIS\' ? \'bg' },
  { i: 1705, from: 'm.type === \'GIRIS\'  \'text', to: 'm.type === \'GIRIS\' ? \'text' }
];

fixes.forEach(f => {
    l[f.i] = l[f.i].replace(f.from, f.to);
});

fs.writeFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', l.join('\n'), 'utf8');
console.log('Fixed all ternary operators!');
