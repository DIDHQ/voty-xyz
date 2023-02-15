import { inferAsyncReturnType } from '@trpc/server'
import { CreateNextContextOptions } from '@trpc/server/adapters/next'

import { Author } from './schemas'
import verifyAuthor from './verifiers/verify-author'

export async function createContext({ req }: CreateNextContextOptions) {
  async function getUserFromHeader() {
    if (req.headers.authorization) {
      const [expiration, json] = req.headers.authorization.split(' ')
      const { author } = await verifyAuthor({
        expiration: parseInt(expiration),
        author: JSON.parse(json) as Author,
      })
      return author
    }
    return null
  }
  const user = await getUserFromHeader()

  return {
    user,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
