import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const { NEXT_PUBLIC_TESTNET } = createEnv({
  client: {
    NEXT_PUBLIC_TESTNET: z.string().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_TESTNET: process.env.NEXT_PUBLIC_TESTNET,
  },
})
