import type { Config } from 'drizzle-kit'
import * as dotenv from "dotenv";
dotenv.config();
export default {
  schema: './src/utils/schema.ts',
  out: './drizzle',
  driver: 'mysql2',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'mysql://127.0.0.1:3306/production',
  },
} satisfies Config
