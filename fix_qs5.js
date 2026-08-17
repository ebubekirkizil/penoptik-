const fs = require('fs');
let c = fs.readFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', 'utf8');
let l = c.split('\n');

const fixes = [
  { i: 409, from: "isCritical  'bg-amber", to: "isCritical ? 'bg-amber" },
  { i: 465, from: "isZero  'bg-rose", to: "isZero ? 'bg-rose" },
  { i: 481, from: "isZero  'text-rose", to: "isZero ? 'text-rose" },
  { i: 961, from: ".[k]", to: "[k]" },
  { i: 961, from: 'k === "kutuAdet"  +e', to: 'k === "kutuAdet" ? +e' },
  { i: 973, from: "skt !== undefined  'bg", to: "skt !== undefined ? 'bg" },
  { i: 974, from: "skt !== undefined  'translate", to: "skt !== undefined ? 'translate" },
  { i: 1155, from: "includes(k)  f.category", to: "includes(k) ? f.category" },
  { i: 1706, from: "m.type === 'GIRIS'  '+'", to: "m.type === 'GIRIS' ? '+'" }
];

fixes.forEach(f => {
    l[f.i] = l[f.i].replace(f.from, f.to);
});

fs.writeFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', l.join('\n'), 'utf8');
console.log('Fixed final ternary syntax errors');
