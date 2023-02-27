import { TRPCError } from '@trpc/server'
import { compact, keyBy } from 'lodash-es'
import { z } from 'zod'
import { DataType } from '../../utils/constants'

import { database, mapByPermalinks } from '../../utils/database'
import { authorized } from '../../utils/schemas/authorship'
import { communitySchema } from '../../utils/schemas/community'
import { proved } from '../../utils/schemas/proof'
import { procedure, router } from '../trpc'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifySnapshot from '../../utils/verifiers/verify-snapshot'
import verifyProof from '../../utils/verifiers/verify-proof'

const schema = proved(authorized(communitySchema))

export const subscriptionRouter = router({
  get: procedure
    .input(
      z.object({
        entry: z.string().optional(),
        subscriber: z.string().optional(),
      }),
    )
    .output(z.boolean())
    .query(async ({ input }) => {
      if (!input.entry || !input.subscriber) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const subscription = await database.subscription.findUnique({
        where: {
          entry_subscriber: {
            entry: input.entry,
            subscriber: input.subscriber,
          },
        },
      })

      return !!subscription
    }),
  list: procedure
    .input(z.object({ subscriber: z.string().optional() }))
    .output(z.array(schema))
    .query(async ({ input }) => {
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
        ({ did }) => did,
      )
      const communities = await mapByPermalinks(
        DataType.COMMUNITY,
        Object.values(entries).map(({ community }) => community),
      )

      return compact(
        subscriptions
          .map(({ entry }) => communities[entries[entry]?.community])
          .filter((community) => community)
          .map(({ permalink, data }) => {
            try {
              return { ...data, permalink }
            } catch {
              return
            }
          }),
      )
    }),
  set: procedure
    .input(
      proved(
        authorized(
          z.object({ entry: z.string().optional(), subscribe: z.boolean() }),
        ),
      ),
    )
    .output(z.boolean())
    .mutation(async ({ input }) => {
      if (!input.entry) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
      await verifySnapshot(input.authorship)
      await verifyProof(input)
      await verifyAuthorship(input.authorship, input.proof)

      const subscriber = input.authorship.author
      if (input.subscribe === true) {
        await database.$transaction([
          database.subscription.create({
            data: { entry: input.entry, subscriber, ts: new Date() },
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
              entry_subscriber: { entry: input.entry, subscriber },
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
