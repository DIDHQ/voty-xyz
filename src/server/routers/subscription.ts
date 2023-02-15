import { TRPCError } from '@trpc/server'
import { compact, keyBy } from 'lodash-es'
import { z } from 'zod'

import { database } from '../../utils/database'
import { communityWithAuthorSchema } from '../../utils/schemas'
import { procedure, router } from '../trpc'

const textDecoder = new TextDecoder()

export const subscriptionRouter = router({
  list: procedure
    .input(z.object({ subscriber: z.string().nullish() }))
    .output(z.array(communityWithAuthorSchema))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }
      if (!input.subscriber) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const subscriptions = await database.subscription.findMany({
        where: { subscriber: input.subscriber },
        orderBy: { ts: 'desc' },
      })
      const entries = keyBy(
        await database.entry.findMany({
          where: { did: { in: subscriptions.map(({ entry }) => entry) } },
        }),
        ({ community }) => community,
      )
      const communities = keyBy(
        await database.community.findMany({
          where: {
            permalink: { in: Object.keys(entries) },
          },
        }),
        ({ permalink }) => permalink,
      )

      return compact(
        subscriptions
          .map(({ entry }) => communities[entries[entry]?.community])
          .filter((community) => community)
          .map(({ permalink, data }) => {
            try {
              return {
                permalink,
                ...communityWithAuthorSchema.parse(
                  JSON.parse(textDecoder.decode(data)),
                ),
              }
            } catch {
              return
            }
          }),
      )
    }),
})

export type SubscriptionRouter = typeof subscriptionRouter
