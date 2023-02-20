import { inferAsyncReturnType } from '@trpc/server'
import { CreateNextContextOptions } from '@trpc/server/adapters/next'
import { getCookie } from 'cookies-next'

import verifyAuth from '../verifiers/verify-auth'

export async function createContext({ req, res }: CreateNextContextOptions) {
  async function getUserFromHeader() {
    const cookie = getCookie('voty.user', { req, res, secure: true })
    if (typeof cookie !== 'string') {
      return
    }
    const { authorship } = await verifyAuth(JSON.parse(cookie))
    return authorship.author
  }
  const user = await getUserFromHeader()
  return { user }
}

export type Context = inferAsyncReturnType<typeof createContext>
