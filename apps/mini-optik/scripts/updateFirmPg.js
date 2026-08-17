const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.nlpjrjdxwtinvnjqlqgt:2849Ebu%2A59%2B-ws@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
});

async function main() {
  await client.connect();
  
  // 1. Fix firm address
  const res1 = await client.query('UPDATE "Firm" SET address = $1', 
    ["Batı Mah., İsmetpaşa Cad., No: 33/35A, Pendik / İstanbul"]
  );
  console.log('Firm update result:', res1.rowCount);

  // 2. Fix settings mapUrl
  const settingsRes = await client.query('SELECT "id", "themeData" FROM "Settings" LIMIT 1');
  if (settingsRes.rows.length > 0) {
    const s = settingsRes.rows[0];
    let td = {};
    if (typeof s.themeData === 'string') {
      try { td = JSON.parse(s.themeData); } catch(e){}
    } else if (s.themeData) {
      td = s.themeData;
    }
    
    td.mapUrl = "https://maps.app.goo.gl/y6bH3s6rZ7XmCqUo6";

    const res2 = await client.query('UPDATE "Settings" SET "themeData" = $1 WHERE id = $2', [
      JSON.stringify(td),
      s.id
    ]);
    console.log('Settings update result:', res2.rowCount);
  }

  await client.end();
}

main().catch(console.error);
