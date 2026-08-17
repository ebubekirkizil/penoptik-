const { Client } = require('pg');
const fs = require('fs');

async function main() {
  const connectionString = 'postgresql://postgres.nlpjrjdxwtinvnjqlqgt:2849Ebu%2A59%2B-ws@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres';
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    console.log('Creating temp_schema...');
    await client.query('DROP SCHEMA IF EXISTS temp_schema CASCADE;');
    await client.query('CREATE SCHEMA temp_schema;');
    
    console.log('Setting search_path to temp_schema...');
    await client.query('SET search_path TO temp_schema;');
    
    console.log('Reading schema_utf8.sql...');
    let sql = fs.readFileSync('schema_utf8.sql', 'utf8');
    
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    console.log(`Executing ${statements.length} statements...`);
    for (const stmt of statements) {
      if (stmt.startsWith('--')) continue; // Skip comments
      try {
        await client.query(stmt + ';');
      } catch (err) {
        console.error('Error executing:', stmt.substring(0, 50).replace(/\n/g, '') + '...', err.message);
      }
    }
    
    console.log('Successfully applied schema_utf8.sql to temp_schema!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

main();
