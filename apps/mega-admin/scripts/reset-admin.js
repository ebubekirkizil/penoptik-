const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.nlpjrjdxwtinvnjqlqgt:2849Ebu%2A59%2B-ws@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
  });
  await client.connect();

  const newPassword = 'AdminPassword2026!';
  const hash = await bcrypt.hash(newPassword, 10);

  // Update all users just to be safe so they can login with any
  await client.query('UPDATE "User" SET password = $1', [hash]);

  console.log('SUCCESS: Bütün admin şifreleri sıfırlandı.');
  console.log('Yeni Şifre:', newPassword);

  await client.end();
}

main().catch(console.error);
