const fs = require('fs');

let content = fs.readFileSync('src/app/admin/inventory/InventoryClient.tsx', 'utf8');

// Normalize line endings to avoid \r\n issues
content = content.replace(/\r\n/g, '\n');

const targetButtonCode = 
`                <button
                  onClick={() => { setEditingProduct(null); setForm({}); setShowAddModal(true); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Yeni Ürün</span>
                  <span className="sm:hidden">Ekle</span>
                </button>`;

const newButtonsCode = 
`                <button
                  onClick={() => setShowQRScanner(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 mr-2"
                >
                  <Barcode className="w-4 h-4" />
                  <span className="hidden sm:inline">QR Ekle</span>
                </button>
` + targetButtonCode;

if (content.includes(targetButtonCode)) {
  content = content.replace(targetButtonCode, newButtonsCode);
  fs.writeFileSync('src/app/admin/inventory/InventoryClient.tsx', content, 'utf8');
  console.log('Button injected successfully!');
} else {
  console.log('Could not find the target button code. Snippet match failed.');
}
