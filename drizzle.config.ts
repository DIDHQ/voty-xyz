import type { Config } from 'drizzle-kit'

export default {
  schema: './src/utils/schema.ts',
  out: './drizzle',
  driver: 'mysql2',
  dbCredentials: {
    connectionString: 'mysql://127.0.0.1:3306/production',
  },
} satisfies Config
