import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const {
  DATABASE_HOST,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  SELECTED_COMMUNITIES,
  SELECTED_GRANT_PROPOSALS,
  ARWEAVE_KEY_FILE,
} = createEnv({
  server: {
    DATABASE_HOST: z.string(),
    DATABASE_USERNAME: z.string(),
    DATABASE_PASSWORD: z.string(),
    SELECTED_COMMUNITIES: z.string().optional(),
    SELECTED_GRANT_PROPOSALS: z.string().optional(),
    ARWEAVE_KEY_FILE: z.string().refine(
      (value) => {
        try {
          JSON.parse(value)
          return true
        } catch (e) {
          return false
        }
      },
      {
        message: 'INVALID ARWEAVE_KEY_FILE',
      },
    ),
  },
  runtimeEnv: {
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_USERNAME: process.env.DATABASE_USERNAME,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    SELECTED_COMMUNITIES: process.env.SELECTED_COMMUNITIES,
    SELECTED_GRANT_PROPOSALS: process.env.SELECTED_GRANT_PROPOSALS,
    ARWEAVE_KEY_FILE: process.env.ARWEAVE_KEY_FILE,
  },
})
