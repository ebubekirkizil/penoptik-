const fs = require('fs');
const cp = require('child_process');
const envStr = fs.readFileSync('../../.env.production.local', 'utf8');
const match = envStr.match(/DATABASE_URL="([^"]+)"/);
if (match && match[1]) {
  console.log('Pushing...');
  process.env.DATABASE_URL = match[1];
  cp.execSync('npx prisma db push', { stdio: 'inherit' });
} else {
  console.log('Not found');
}
