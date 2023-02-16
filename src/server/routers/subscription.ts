import { TRPCError } from '@trpc/server'
import { compact, keyBy } from 'lodash-es'
import { z } from 'zod'

import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/authorship'
import { communitySchema } from '../../utils/schemas/community'
import { procedure, router } from '../trpc'

const textDecoder = new TextDecoder()

export const subscriptionRouter = router({
  list: procedure
    .output(z.array(authorized(communitySchema)))
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
                ...authorized(communitySchema).parse(
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
    .input(
      z.object({
        entry: z.string().optional(),
        subscribe: z.boolean().optional(),
      }),
    )
    .output(z.boolean())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.did) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }
      if (!input.entry) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      if (input.subscribe === undefined || input.subscribe === null) {
        const subscription = await database.subscription.findUnique({
          where: {
            entry_subscriber: { entry: input.entry, subscriber: ctx.did },
          },
        })
        return !!subscription
      }
      if (input.subscribe === true) {
        await database.$transaction([
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
        ])
      } else {
        await database.$transaction([
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
        ])
      }
      return input.subscribe
    }),
})

export type SubscriptionRouter = typeof subscriptionRouter
