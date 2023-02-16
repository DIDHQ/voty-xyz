import { inferAsyncReturnType } from '@trpc/server'
import { CreateNextContextOptions } from '@trpc/server/adapters/next'

import { parseAuthorization, verifyAuthorization } from '../authorization'
import verifyAuthorship from '../verifiers/verify-authorship'

export async function createContext({ req }: CreateNextContextOptions) {
  async function getDidFromHeader() {
    if (req.headers.authorization) {
      const authorization = parseAuthorization(req.headers.authorization)
      if (verifyAuthorization(authorization)) {
        const { authorship } = await verifyAuthorship(authorization)
        return authorship.did
      }
    }
    return null
  }
  const did = await getDidFromHeader()
  return { did }
}

export type Context = inferAsyncReturnType<typeof createContext>
