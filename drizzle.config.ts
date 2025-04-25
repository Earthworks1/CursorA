import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

export default {
  schema: './shared/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: 'postgresql://postgres:Spiess*123@db.iblaaljrzvbsorbpscnq.supabase.co:5432/postgres',
  },
  verbose: true,
  strict: true,
} satisfies Config;
