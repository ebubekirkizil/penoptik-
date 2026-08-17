const { Client } = require('pg');

async function main() {
  const url = "postgresql://postgres.nlpjrjdxwtinvnjqlqgt:2849Ebu%2A59%2B-ws@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
  
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database.");

    // Create Enums if they don't exist
    await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TxType') THEN
              CREATE TYPE "TxType" AS ENUM ('INCOME', 'EXPENSE');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TxStatus') THEN
              CREATE TYPE "TxStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TxSource') THEN
              CREATE TYPE "TxSource" AS ENUM ('CASH', 'CARD', 'TRANSFER');
          END IF;
      END $$;
    `);
    console.log("Enums created.");

    // Alter FinancialTransaction columns to use Enums
    // Note: If they were TEXT before, we cast them. If they were already Enums, we skip.
    await client.query(`
      ALTER TABLE "FinancialTransaction"
        ALTER COLUMN "type" TYPE "TxType" USING "type"::text::"TxType",
        ALTER COLUMN "status" TYPE "TxStatus" USING "status"::text::"TxStatus",
        ALTER COLUMN "source" TYPE "TxSource" USING "source"::text::"TxSource";
    `);
    console.log("Columns altered to enums.");
    
    // Also, make sure status and source have default values
    await client.query(`
      ALTER TABLE "FinancialTransaction"
        ALTER COLUMN "status" SET DEFAULT 'PENDING'::"TxStatus",
        ALTER COLUMN "source" SET DEFAULT 'CASH'::"TxSource";
    `);
    console.log("Defaults set.");
    
  } catch (error) {
    console.error("Error patching database:", error);
  } finally {
    await client.end();
  }
}

main();
