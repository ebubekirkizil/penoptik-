const fs = require('fs');
let content = fs.readFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', 'utf8');

// Replace sequences
content = content.replace(/â”€/g, '─');
content = content.replace(/â–¡/g, '□');
content = content.replace(/Å\x9E/g, 'Ş');
content = content.replace(/â€”/g, '—');
content = content.replace(/â€¢/g, '•');
content = content.replace(/Ä\x9E/g, 'Ğ');
content = content.replace(/"/g, '"');
content = content.replace(/\?/g, '');

fs.writeFileSync('c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx', content, 'utf8');
console.log('done');
