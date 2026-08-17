const fs = require('fs');

let content = fs.readFileSync('src/components/inventory/BulkPriceUpdateModal.tsx', 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

if (!content.includes('inline?: boolean;')) {
  content = content.replace(
    'interface BulkPriceUpdateModalProps {',
    'interface BulkPriceUpdateModalProps {\n  inline?: boolean;'
  );
  
  content = content.replace(
    'export default function BulkPriceUpdateModal({ products, onClose, onComplete }: BulkPriceUpdateModalProps) {',
    'export default function BulkPriceUpdateModal({ products, onClose, onComplete, inline = false }: BulkPriceUpdateModalProps) {'
  );
  
  const oldReturn = `return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">`;

  const newReturn = `const inner = (
      <div className={\`relative bg-white dark:bg-[#1E293B] \${inline ? "rounded-2xl border border-indigo-200 dark:border-indigo-800/50 w-full mb-6 shadow-sm" : "rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh]"} overflow-hidden flex flex-col animate-in zoom-in-95 duration-200\`}>`;

  if (content.includes(oldReturn)) {
    content = content.replace(oldReturn, newReturn);
    
    // Replace the final closing tags
    const endTags = `    </div>
  );
}`;
    const newEndTags = `    </div>
  );

  if (inline) return inner;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      {inner}
    </div>
  );
}`;
    const lastIndex = content.lastIndexOf(endTags);
    if (lastIndex !== -1) {
      content = content.substring(0, lastIndex) + newEndTags;
    }
  }

  fs.writeFileSync('src/components/inventory/BulkPriceUpdateModal.tsx', content, 'utf8');
  console.log('BulkPriceUpdateModal updated for inline rendering.');
} else {
  console.log('Already updated.');
}
