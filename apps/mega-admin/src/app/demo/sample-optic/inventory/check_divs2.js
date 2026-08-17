const fs = require('fs');
const lines = fs.readFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', 'utf8').split('\n');
let divs = 0;
for(let i=854; i<=1122; i++) {
  const l = lines[i] || '';
  let open = 0;
  
  // Find all <div ...> matches.
  // We need to ignore <div ... /> (self closing)
  const matches = l.match(/<div([^>]*)>/g) || [];
  for (const m of matches) {
     if (!m.endsWith('/>')) {
        open++;
     }
  }
  const close = (l.match(/<\/div>/g) || []).length;
  divs += open - close;
  if(open !== close) {
    console.log(`${i+1}: +${open} -${close} = ${divs} | ${l.trim().substring(0,50)}`);
  }
}
console.log('Final unclosed divs:', divs);
