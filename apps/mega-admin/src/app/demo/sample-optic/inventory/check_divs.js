const fs = require('fs');
const lines = fs.readFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', 'utf8').split('\n');
let divs = 0;
let errors = [];
for(let i=868; i<=1122; i++) {
  const l = lines[i] || '';
  // VERY simplified check for div open/close for illustration
  const open = (l.match(/<div\b/g) || []).length;
  const close = (l.match(/<\/div>/g) || []).length;
  divs += open - close;
  if(open !== close) {
    console.log(`${i+1}: ${l.trim().substring(0,50)} -> +${open} -${close} = ${divs}`);
  }
}
console.log('Final unclosed divs:', divs);
