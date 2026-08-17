const fs = require('fs');
let c = fs.readFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', 'utf8');
let l = c.split('\n');

const fixes = [
  { i: 336, from: 'isCritical  "bg', to: 'isCritical ? "bg' },
  { i: 476, from: 'isZero  "bg', to: 'isZero ? "bg' },
  { i: 534, from: 'isIn  "bg', to: 'isIn ? "bg' },
  { i: 539, from: 'isIn  "text', to: 'isIn ? "text' },
  { i: 540, from: 'isIn  "+"', to: 'isIn ? "+"' },
  { i: 604, from: 's.balance < 0  "text-rose-600" : s.balance > 0  "text-emerald-600"', to: 's.balance < 0 ? "text-rose-600" : s.balance > 0 ? "text-emerald-600"' },
  { i: 605, from: 's.balance > 0  "+"', to: 's.balance > 0 ? "+"' },
  { i: 833, from: 's.balance < 0  "text-rose-600" : s.balance > 0  "text-emerald-600"', to: 's.balance < 0 ? "text-rose-600" : s.balance > 0 ? "text-emerald-600"' },
  { i: 834, from: 's.balance > 0  "+"', to: 's.balance > 0 ? "+"' },
  { i: 859, from: 'editingProduct  "Ürünü Düzenle"', to: 'editingProduct ? "Ürünü Düzenle"' },
  { i: 1071, from: 'editingProduct  "Güncelle"', to: 'editingProduct ? "Güncelle"' },
  { i: 1106, from: 'includes(k)  "GIRIS"', to: 'includes(k) ? "GIRIS"' },
  { i: 1108, from: 'includes(k)  "text', to: 'includes(k) ? "text' },
  { i: 1143, from: 'editingSupplier  "Tedarikçi Düzenle"', to: 'editingSupplier ? "Tedarikçi Düzenle"' },
  { i: 1394, from: 'showInvoiceDetails  "Fatura Detayı"', to: 'showInvoiceDetails ? "Fatura Detayı"' }
];

fixes.forEach(f => {
    l[f.i] = l[f.i].replace(f.from, f.to);
});

fs.writeFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', l.join('\n'), 'utf8');
console.log('Fixed final batch of ternary operators!');
