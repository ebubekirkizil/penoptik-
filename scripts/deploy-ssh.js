const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const os = require('os');

const pubKeyPath = path.join(os.homedir(), '.ssh', 'id_rsa.pub');
const pubKey = fs.readFileSync(pubKeyPath, 'utf8').trim();

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH Connection Established via password.');
  const cmd = `mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo "${pubKey}" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo "KEY_ADDED_SUCCESSFULLY"`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Command finished with code:', code);
      conn.end();
    }).stdout.on('data', (data) => {
      console.log('STDOUT:', data.toString());
    }).stderr.on('data', (data) => {
      console.error('STDERR:', data.toString());
    });
  });
}).connect({
  host: '185.22.185.235',
  port: 22,
  username: 'root',
  password: 'Ln6#Nk6#Fn3!Xq3!'
});
