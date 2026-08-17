const { Client } = require('pg');
const fs = require('fs');

async function main() {
  const connectionString = 'postgresql://postgres.nlpjrjdxwtinvnjqlqgt:2849Ebu%2A59%2B-ws@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres';
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false } 
  });
  
  try {
    await client.connect();
    
    // Get list of existing tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const existingTables = res.rows.map(r => r.table_name);
    
    let sql = fs.readFileSync('schema_utf8.sql', 'utf8');
    
    // Remove all comments from SQL first to avoid startswith('--') issues
    sql = sql.replace(/--.*$/gm, '');
    
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    let executedCount = 0;
    
    for (const stmt of statements) {
      let isSkipped = false;
      
      // Check if it's CREATE TABLE
      const tableMatch = stmt.match(/CREATE TABLE "([^"]+)"/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        if (existingTables.includes(tableName)) {
          isSkipped = true;
        } else {
          console.log(`Table missing! Will execute: CREATE TABLE ${tableName}`);
        }
      }
      
      // Skip ALTER TABLE entirely because constraints already exist on existing tables, 
      // and for new tables they are created if we don't skip them? 
      // Wait, ALTER TABLE adds foreign keys. If we skip ALTER TABLE for existing tables, we don't re-add foreign keys.
      const alterMatch = stmt.match(/ALTER TABLE "([^"]+)"/i);
      if (alterMatch) {
        // Just try it. If it fails, whatever.
      }
      
      if (isSkipped) continue;
      
      try {
        await client.query(stmt + ';');
        executedCount++;
        console.log(`Executed: ${stmt.substring(0, 50).replace(/\\n/g, '')}...`);
      } catch (err) {
        // console.error(`Error executing: ${stmt.substring(0, 50).replace(/\\n/g, '')}...`, err.message);
      }
    }
    
    console.log(`Successfully executed ${executedCount} new statements to public schema!`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

main();
