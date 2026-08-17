const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inventory/InventoryClient.tsx', 'utf8');

// 1. Add import
if (!content.includes('import QRScannerModal')) {
  content = content.replace(
    'import SmartAlerts from "@/components/inventory/SmartAlerts";',
    'import SmartAlerts from "@/components/inventory/SmartAlerts";\nimport QRScannerModal from "@/components/inventory/QRScannerModal";'
  );
}

// 2. Add State
if (!content.includes('const [showQRScanner')) {
  content = content.replace(
    'const [showAddModal, setShowAddModal]         = useState(false);',
    'const [showAddModal, setShowAddModal]         = useState(false);\n  const [showQRScanner, setShowQRScanner] = useState(false);'
  );
}

// 3. Add handler
const handlerCode = `

  const handleQRScanSuccess = async (text: string) => {
    try {
      const parts = text.split("+");
      const barcode = parts[0] || "";
      const dateDesc = parts[1] || "";
      const sku = parts[2] || "";
      const name = parts[3] || "";
      const vendor = parts[4] || "";

      const existingProduct = products.find(p => p.barcode === barcode || (sku && (p as any).sku === sku));
      
      if (existingProduct) {
        if (window.confirm(\`"\${existingProduct.name}" zaten stokta var (Mevcut: \${existingProduct.stock}). Stoğu 1 artırayım mı?\`)) {
          const updatedProducts = products.map(p => {
            if (p.id === existingProduct.id) return { ...p, stock: p.stock + 1 };
            return p;
          });
          setProducts(updatedProducts);
          
          try {
            const res = await fetch("/api/inventory/movements", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: existingProduct.id,
                quantity: 1,
                type: "GIRIS",
                reason: "TEDARIKCIDEN_ALIM",
                note: "QR ile hızlı eklendi"
              })
            });
            if (res.ok) alert("Stok başarıyla eklendi.");
          } catch (e) {
            console.error(e);
          }
        }
      } else {
        setEditingProduct(null);
        setForm({
          name,
          barcode,
          sku,
          brand: vendor,
          vendor,
          category: "CERCEVE",
          kdv: 20, 
          stock: 1, 
          criticalLimit: 5,
          costPrice: 0, 
          salePrice: 0, 
          frame: {}, 
          lens: {}, 
          contact: {},
          notes: dateDesc ? \`QR Tarih/Etiket: \${dateDesc}\` : ""
        } as any);
        setShowAddModal(true);
      }
    } catch (e) {
      console.error(e);
      alert("Geçersiz QR kod formatı.");
    }
  };
`;

if (!content.includes('handleQRScanSuccess')) {
  content = content.replace(
    '// Add/Edit Form',
    '// Add/Edit Form' + handlerCode
  );
}

// 4. Add Button
const buttonCode = `
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 mr-2"
                >
                  <Barcode className="w-4 h-4" />
                  <span className="hidden sm:inline">QR Ekle</span>
                </button>
`;
if (!content.includes('setShowQRScanner(true)')) {
  content = content.replace(
    '<button\n                  onClick={() => { setEditingProduct(null); setForm({}); setShowAddModal(true); }}',
    buttonCode + '<button\n                  onClick={() => { setEditingProduct(null); setForm({}); setShowAddModal(true); }}'
  );
}

// 5. Add Modal Component
if (!content.includes('<QRScannerModal')) {
  const lastDivIndex = content.lastIndexOf('</div>');
  if (lastDivIndex !== -1) {
     content = content.substring(0, lastDivIndex) + '      <QRScannerModal\n        isOpen={showQRScanner}\n        onClose={() => setShowQRScanner(false)}\n        onScanSuccess={handleQRScanSuccess}\n      />\n    </div>\n  );\n}\n';
  }
}

fs.writeFileSync('src/app/admin/inventory/InventoryClient.tsx', content, 'utf8');
