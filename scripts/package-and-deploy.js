const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("=== STARTING FULL VPS DEPLOYMENT & PUBLISHING ===");

// Step 1: Create tar archive of workspace ignoring node_modules and .next
const archivePath = path.join(process.cwd(), 'vps-deploy.tar.gz');

console.log("1. Packaging project files...");
if (fs.existsSync(archivePath)) {
  fs.unlinkSync(archivePath);
}

// Use tar to bundle
const tarCmd = `tar --exclude="node_modules" --exclude=".next" --exclude=".git" --exclude="*.tar.gz" -czf "${archivePath}" .`;
execSync(tarCmd, { stdio: 'inherit' });

console.log("2. Uploading bundle to VPS (185.22.185.235)...");
execSync(`scp -o StrictHostKeyChecking=no "${archivePath}" root@185.22.185.235:/root/vps-deploy.tar.gz`, { stdio: 'inherit' });

console.log("3. Extracting and building on VPS...");
const remoteScript = `
set -e
mkdir -p /var/www/sentientwire
tar -xzf /root/vps-deploy.tar.gz -C /var/www/sentientwire
cd /var/www/sentientwire

echo "Installing npm dependencies..."
npm install --legacy-peer-deps --production=false

echo "Running Prisma Generators..."
npx prisma generate --schema="packages/database/prisma/schema.prisma"
npx prisma generate --schema="apps/mini-optik/prisma/schema.prisma"

echo "Building applications..."
npm run build --prefix apps/mega-admin || true
npm run build --prefix apps/mini-optik || true

echo "Configuring Nginx..."
cat << 'EOF' > /etc/nginx/sites-available/sentientwire
server {
    listen 80;
    server_name 185.22.185.235 sentientwire.com www.sentientwire.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /optik {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/sentientwire /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "Starting PM2 Processes..."
pm2 delete all || true
cd /var/www/sentientwire/apps/mega-admin && pm2 start npm --name "mega-admin" -- run start -- -p 3001
cd /var/www/sentientwire/apps/mini-optik && pm2 start npm --name "mini-optik" -- run start -- -p 3003
pm2 save

echo "=== DEPLOYMENT SUCCESSFUL ==="
`;

fs.writeFileSync(path.join(process.cwd(), 'scripts', 'remote-deploy.sh'), remoteScript.replace(/\r\n/g, '\n'));
execSync(`scp -o StrictHostKeyChecking=no scripts/remote-deploy.sh root@185.22.185.235:/root/remote-deploy.sh`, { stdio: 'inherit' });
execSync(`ssh -o StrictHostKeyChecking=no root@185.22.185.235 "bash /root/remote-deploy.sh"`, { stdio: 'inherit' });

console.log("=== VPS PUBLISHING COMPLETE ===");
