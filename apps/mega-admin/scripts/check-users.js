const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.nlpjrjdxwtinvnjqlqgt:2849Ebu%2A59%2B-ws@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
  });
  await client.connect();

  const res = await client.query('SELECT id, email, role FROM "User"');
  console.log(res.rows);

  await client.end();
}

main().catch(console.error);
