import type { Config } from 'drizzle-kit'

export default {
  schema: './src/utils/schema.ts',
  out: './drizzle',
  driver: 'mysql2',
  dbCredentials: {
    connectionString: process.env.LOCAL_DATABASE
      ? process.env.LOCAL_DATABASE
      : 'mysql://127.0.0.1:3306/production',
  },
} satisfies Config
