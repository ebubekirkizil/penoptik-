const fs = require('fs');
let c = fs.readFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', 'utf8');
let l = c.split('\n');

for(let i=0; i<l.length; i++) {
    // looking for cases like `something === "value"  "border...` or `something  {` which were ternaries missing `?`
    if (l[i].includes(' === ') && l[i].includes('  "') && !l[i].includes('?')) {
        console.log((i+1) + ': ' + l[i].trim());
    }
    // find editingProduct.id  {
    if (l[i].includes('editingProduct.id  {')) {
        console.log((i+1) + ': ' + l[i].trim());
    }
    // check TS error lines
    if ([259, 1325, 1326, 1494, 1617, 1702, 1706, 1785, 1788, 1791, 1816].includes(i+1)) {
        console.log('ERR LINE ' + (i+1) + ': ' + l[i].trim());
    }
}
