import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { database } from '../../utils/database'
import { communityWithAuthorSchema } from '../../utils/schemas'
import { procedure, router } from '../trpc'

const textDecoder = new TextDecoder()

export const communityRouter = router({
  getByEntry: procedure
    .input(
      z.object({
        entry: z.string().nullish(),
      }),
    )
    .output(communityWithAuthorSchema)
    .query(async ({ input }) => {
      if (!input.entry) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      const entry = await database.entry.findUnique({
        where: { did: input.entry },
      })
      if (!entry) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      const community = await database.community.findUnique({
        where: { permalink: entry?.community },
      })
      if (!community) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return communityWithAuthorSchema.parse(
        JSON.parse(textDecoder.decode(community.data)),
      )
    }),
  getByPermalink: procedure
    .input(
      z.object({
        permalink: z.string(),
      }),
    )
    .output(communityWithAuthorSchema)
    .query(async ({ input }) => {
      const community = await database.community.findUnique({
        where: { permalink: input.permalink },
      })
      if (!community) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return communityWithAuthorSchema.parse(
        JSON.parse(textDecoder.decode(community.data)),
      )
    }),
})

export type CommunityRouter = typeof communityRouter
