const fs = require('fs');
let c = fs.readFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', 'utf8');
let l = c.split('\n');

for(let i=0; i<l.length; i++) {
    // Check for `something  'something'` (two spaces, then single quote)
    // or `something  Math` etc.
    // Let's just find `  '` (two spaces, single quote)
    if (l[i].includes("  '") && !l[i].includes('?')) {
        console.log("SUSPICIOUS: " + (i+1) + ': ' + l[i].trim());
    }
    // and let's check for TS errors 473, 482, 719, 745, 962, 974, 1017, 1077, 1156, 1174, 1336, 1418, 1453, 1707
    if ([473, 482, 719, 745, 962, 974, 1017, 1077, 1156, 1174, 1336, 1418, 1453, 1707].includes(i+1)) {
        console.log('ERR LINE ' + (i+1) + ': ' + l[i].trim());
    }
}
