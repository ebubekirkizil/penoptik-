import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.nlpjrjdxwtinvnjqlqgt:2849Ebu%2A59%2B-ws@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function main() {
  console.log("🔒 Starting Security Audit: Enabling RLS on all public tables...");
  
  const client = new Client({ connectionString });
  await client.connect();
  
  // Get all tables in the public schema
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
  `);

  const tables = res.rows;
  console.log(`Found ${tables.length} tables. Applying RLS...`);

  for (const table of tables) {
    const tableName = table.table_name;
    try {
      // Enable RLS
      await client.query(`ALTER TABLE "public"."${tableName}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`✅ RLS Enabled on table: ${tableName}`);
      
      // Optionally, create a policy that denies all access by default to anon role
      // Since Prisma uses the postgres role, it bypasses RLS and continues to work.
      // But anon and authenticated (Supabase APIs) will be blocked.
      
      // Check if policy exists first (we just do DROP IF EXISTS then CREATE)
      await client.query(`DROP POLICY IF EXISTS "Deny all access to anon" ON "public"."${tableName}";`);
      await client.query(`
        CREATE POLICY "Deny all access to anon"
        ON "public"."${tableName}"
        FOR ALL
        TO anon
        USING (false);
      `);
      console.log(`🛡️  Anon Drop Policy Applied to: ${tableName}`);
    } catch (e: any) {
      console.error(`❌ Failed to apply RLS on ${tableName}:`, e.message);
    }
  }

  console.log("🎉 Security Audit Complete. Database is now sealed against Anon API access.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("Done");
    process.exit(0);
  });
