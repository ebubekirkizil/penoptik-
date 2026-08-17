const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Replace the corrupted characters
  content = content.replace(/₺/g, ' ');
  content = content.replace(/ş/g, 'x');
  content = content.replace(/⚡/g, 'a');

  // Fix UTF-8 double encoding for Turkish chars if we want (optional, but good)
  // Let's just fix the main ones to prevent Next.js build errors (the invalid chars)
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      fixFile(fullPath);
    }
  }
}

const targetDir = 'c:\\Users\\90551\\OneDrive\\Masaüstü\\sentientwire.com\\apps\\mega-admin\\src';
console.log(`Walking directory: ${targetDir}`);
walkDir(targetDir);
console.log('Done.');
