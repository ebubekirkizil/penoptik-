const fs = require('fs');
let c = fs.readFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', 'utf8');
let l = c.split('\n');

l[1156] = l[1156].replace('includes(k)  "border', 'includes(k) ? "border');

// Let's do one more check to find any other missing `?` in ternaries.
let fixesCount = 0;
for(let i=0; i<l.length; i++) {
    // looking for cases like `something === "value"  "border...` or `something  {` which were ternaries missing `?`
    // Match something followed by two spaces and a quote, inside a JSX expression, but NOT if there's already a ?
    if (l[i].includes('  "') && !l[i].includes('?') && l[i].includes('{') && l[i].includes('}')) {
        console.log("SUSPICIOUS: " + (i+1) + ': ' + l[i].trim());
    }
}

fs.writeFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', l.join('\n'), 'utf8');
console.log('Fixed line 1157');
