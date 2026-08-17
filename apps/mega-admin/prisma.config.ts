import { defineConfig } from "prisma/config";
import * as fs from "fs";
import * as path from "path";

let dbUrl = process.env.DATABASE_URL;
let directUrl = process.env.DIRECT_URL;

try {
  const envContent = fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8");
  const dbMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
  const directMatch = envContent.match(/DIRECT_URL="?([^"\n]+)"?/);
  if (dbMatch && dbMatch[1].length > 10) dbUrl = dbMatch[1];
  if (directMatch && directMatch[1].length > 10) directUrl = directMatch[1];
} catch (e) {}

const fallbackUrl = "postgresql://postgres.nlpjrjdxwtinvnjqlqgt:2849Ebu%2A59%2B-ws@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
let finalUrl = directUrl || dbUrl || fallbackUrl;
if (finalUrl && !finalUrl.includes("pgbouncer=true") && finalUrl.includes("6543")) {
  finalUrl += finalUrl.includes("?") ? "&pgbouncer=true" : "?pgbouncer=true";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: finalUrl,
  },
});
