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

    // Create Wholesaler table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS "Wholesaler" (
        "id" TEXT NOT NULL,
        "FirmId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "contact" TEXT,
        "phone" TEXT,
        "address" TEXT,
        "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Wholesaler_pkey" PRIMARY KEY ("id")
      );
    `;
    await client.query(createTableQuery);
    console.log("Wholesaler table created or already exists.");

    // Add Foreign Key constraint for FirmId
    const addFkQuery = `
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Wholesaler_FirmId_fkey') THEN
              ALTER TABLE "Wholesaler" ADD CONSTRAINT "Wholesaler_FirmId_fkey" FOREIGN KEY ("FirmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
      END $$;
    `;
    await client.query(addFkQuery);
    console.log("Foreign key constraint added.");
    
  } catch (error) {
    console.error("Error patching database:", error);
  } finally {
    await client.end();
  }
}

main();
