import { inferAsyncReturnType } from '@trpc/server'
import { CreateNextContextOptions } from '@trpc/server/adapters/next'

import { parseAuthorization, verifyAuthorization } from '../authorization'
import verifyAuthorshipProof from '../verifiers/verify-authorship-proof'

export async function createContext({ req }: CreateNextContextOptions) {
  async function getDidFromHeader() {
    if (req.headers.authorization) {
      const authorization = parseAuthorization(req.headers.authorization)
      if (verifyAuthorization(authorization)) {
        const { authorship } = await verifyAuthorshipProof(authorization)
        return authorship.author
      }
    }
    return null
  }
  const did = await getDidFromHeader()
  return { did }
}

export type Context = inferAsyncReturnType<typeof createContext>
