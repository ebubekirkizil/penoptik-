const fs = require('fs');

// 1. Fix "QR Ekle" text
let invContent = fs.readFileSync('src/app/admin/inventory/InventoryClient.tsx', 'utf8');
invContent = invContent.replace(
  '<Barcode className="w-4 h-4" /> QR Ekle',
  '<Barcode className="w-4 h-4" /> QR\\'la Ekle'
);
fs.writeFileSync('src/app/admin/inventory/InventoryClient.tsx', invContent, 'utf8');
console.log('Fixed QR Ekle text in InventoryClient.tsx');

// 2. Fix QRScannerModal crash
let qrContent = fs.readFileSync('src/components/inventory/QRScannerModal.tsx', 'utf8');

const handleCloseFn = `
  const handleClose = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {
        console.error("Error stopping scanner on close:", e);
      }
    }
    onClose();
  };

  if (!isOpen) return null;
`;

if (!qrContent.includes('const handleClose')) {
  qrContent = qrContent.replace('  if (!isOpen) return null;', handleCloseFn);
  
  // Replace onClose with handleClose
  qrContent = qrContent.replace(
    'button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800',
    'button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800'
  );
  
  // Update useEffect cleanup to avoid throwing unhandled promises when unmounting
  const oldCleanup = `    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };`;
    
  const newCleanup = `    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };`;
    
  qrContent = qrContent.replace(oldCleanup, newCleanup);

  fs.writeFileSync('src/components/inventory/QRScannerModal.tsx', qrContent, 'utf8');
  console.log('Fixed crash in QRScannerModal.tsx');
} else {
  console.log('QRScannerModal.tsx already fixed.');
}
