import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const { NEXT_PUBLIC_TESTNET, NEXT_PUBLIC_PROJECT_ID } = createEnv({
  client: {
    NEXT_PUBLIC_TESTNET: z.string().optional(),
    NEXT_PUBLIC_PROJECT_ID: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_TESTNET: process.env.NEXT_PUBLIC_TESTNET,
    NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
  },
})
