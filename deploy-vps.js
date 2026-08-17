const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

const commands = [
  // Setup Swap
  'if [ ! -f /swapfile ]; then fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile && echo "/swapfile none swap sw 0 0" >> /etc/fstab; fi',
  
  // Setup UFW Firewall
  'ufw allow OpenSSH',
  'ufw allow "Nginx Full"',
  'ufw --force enable',
  
  // Update and Install basics
  'apt-get update -y',
  'apt-get install -y curl git nginx postgresql postgresql-contrib',
  
  // Install Node.js 20.x
  'if ! command -v node &> /dev/null; then curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs; fi',
  
  // Install PM2
  'if ! command -v pm2 &> /dev/null; then npm install -g pm2; fi',
  
  // Create Postgres Database and User
  'sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = \'sentientwire\'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE sentientwire;"',
  'sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname = \'sentientuser\'" | grep -q 1 || sudo -u postgres psql -c "CREATE USER sentientuser WITH ENCRYPTED PASSWORD \'S3ntient!DB!P4ss\';"',
  'sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sentientwire TO sentientuser;"',
  'sudo -u postgres psql -c "ALTER DATABASE sentientwire OWNER TO sentientuser;"',
  
  // Setup deployment folder
  'mkdir -p /var/www/sentientwire',
  'chown -R root:root /var/www/sentientwire'
];

conn.on('ready', () => {
  console.log('SSH Connection ready. Starting setup...');
  
  let currentCmd = 0;
  
  const executeNext = () => {
    if (currentCmd >= commands.length) {
      console.log('All commands executed successfully!');
      conn.end();
      return;
    }
    
    const cmd = commands[currentCmd];
    console.log(`Executing: ${cmd.substring(0, 50)}...`);
    
    conn.exec(cmd, (err, stream) => {
      if (err) throw err;
      
      stream.on('close', (code, signal) => {
        console.log(`Command finished with code: ${code}`);
        currentCmd++;
        executeNext();
      }).on('data', (data) => {
        process.stdout.write(data);
      }).stderr.on('data', (data) => {
        process.stderr.write(data);
      });
    });
  };
  
  executeNext();
  
}).on('error', (err) => {
  console.error('SSH Connection Error:', err);
}).connect({
  host: '185.22.185.235',
  port: 22,
  username: 'root',
  password: 'Ln6#Nk6#Fn3!Xq3!'
});
