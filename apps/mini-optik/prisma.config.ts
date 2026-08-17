import { defineConfig } from '@prisma/config';
import { config } from 'dotenv';
import { env } from 'process';

config(); 
config({ path: '.env.local', override: true });

export default defineConfig({
  datasource: {
    url: env.DATABASE_URL
  }
});
