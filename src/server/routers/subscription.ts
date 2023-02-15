import { TRPCError } from '@trpc/server'
import { compact, keyBy } from 'lodash-es'
import { z } from 'zod'

import { database } from '../../utils/database'
import { communityWithAuthorSchema } from '../../utils/schemas'
import { procedure, router } from '../trpc'

const textDecoder = new TextDecoder()

export const subscriptionRouter = router({
  get: procedure
    .input(z.object({ entry: z.string().nullish() }))
    .output(z.boolean())
    .query(async ({ ctx, input }) => {
      if (!ctx.did) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }
      if (!input.entry) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const subscription = await database.subscription.findUnique({
        where: {
          entry_subscriber: { entry: input.entry, subscriber: ctx.did },
        },
      })

      return !!subscription
    }),
  list: procedure
    .output(z.array(communityWithAuthorSchema))
    .query(async ({ ctx }) => {
      if (!ctx.did) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      const subscriptions = await database.subscription.findMany({
        where: { subscriber: ctx.did },
        orderBy: { ts: 'desc' },
      })
      const entries = keyBy(
        await database.entry.findMany({
          where: { did: { in: subscriptions.map(({ entry }) => entry) } },
        }),
        ({ did }) => did,
      )
      const communities = keyBy(
        await database.community.findMany({
          where: {
            permalink: {
              in: Object.values(entries).map(({ community }) => community),
            },
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
  set: procedure
    .input(z.object({ entry: z.string().nullish(), subscribe: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.did) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }
      if (!input.entry) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      await database.$transaction(
        input.subscribe
          ? [
              database.subscription.create({
                data: {
                  entry: input.entry,
                  subscriber: ctx.did,
                  ts: new Date(),
                },
              }),
              database.entry.update({
                where: { did: input.entry },
                data: { subscribers: { increment: 1 } },
              }),
            ]
          : [
              database.subscription.delete({
                where: {
                  entry_subscriber: {
                    entry: input.entry,
                    subscriber: ctx.did,
                  },
                },
              }),
              database.entry.update({
                where: { did: input.entry },
                data: { subscribers: { decrement: 1 } },
              }),
            ],
      )
    }),
})

export type SubscriptionRouter = typeof subscriptionRouter
