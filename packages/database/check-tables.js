const { Client } = require('pg');

async function main() {
  const connectionString = 'postgresql://postgres.nlpjrjdxwtinvnjqlqgt:2849Ebu%2A59%2B-ws@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres';
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false } 
  });
  
  try {
    await client.connect();
    
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const existingTables = res.rows.map(r => r.table_name);
    console.log(existingTables.join(', '));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

main();
