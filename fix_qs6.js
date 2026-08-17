const fs = require('fs');
let c = fs.readFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', 'utf8');
let l = c.split('\n');

const fixes = [
  { i: 298, from: 'type: isGiris  "GIRIS"', to: 'type: isGiris ? "GIRIS"' },
  { i: 301, from: 'isGiris  movForm.quantity', to: 'isGiris ? movForm.quantity' },
  { i: 302, from: 'movForm.productId  {', to: 'movForm.productId ? {' },
  { i: 311, from: 'editingSupplier.id  {', to: 'editingSupplier.id ? {' },
  { i: 697, from: '> 0  (', to: '> 0 ? (' },
  { i: 718, from: ') : (', to: ') : (' }, // Not needed to change, this is consequence of 697
  { i: 735, from: '> 0  (', to: '> 0 ? (' },
  { i: 1011, from: 'form.kdv  (', to: 'form.kdv ? (' },
  { i: 1324, from: 'editingSupplier  (', to: 'editingSupplier ? (' },
  { i: 1406, from: 'showInvoiceDetails  (', to: 'showInvoiceDetails ? (' }
];

fixes.forEach(f => {
    l[f.i] = l[f.i].replace(f.from, f.to);
});

fs.writeFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', l.join('\n'), 'utf8');
console.log('Fixed fix_qs6');
