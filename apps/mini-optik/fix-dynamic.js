const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src').filter(f => f.endsWith('page.tsx'));
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if(content.includes('export const dynamic = "force-dynamic";')) {
    fs.writeFileSync(f, content.replace('export const dynamic = "force-dynamic";', ''));
    console.log('Fixed ' + f);
  }
});
