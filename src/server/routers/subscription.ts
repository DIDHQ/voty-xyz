import { TRPCError } from '@trpc/server'
import { compact, keyBy } from 'lodash-es'
import { z } from 'zod'

import { DataType } from '../../utils/constants'
import { database, mapByPermalinks } from '../../utils/database'
import { authorized } from '../../utils/schemas/authorship'
import { communitySchema } from '../../utils/schemas/community'
import { proofSchema, proved } from '../../utils/schemas/proof'
import { procedure, router } from '../trpc'
import verifyProof from '../../utils/verifiers/verify-proof'

const schema = proved(authorized(communitySchema))

const subscriberSchema = proofSchema.pick({ type: true, address: true })

export const subscriptionRouter = router({
  get: procedure
    .input(
      z.object({
        entry: z.string().optional(),
        subscriber: subscriberSchema.optional(),
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
            subscriber: JSON.stringify(input.subscriber),
          },
        },
      })

      return !!subscription
    }),
  list: procedure
    .input(z.object({ subscriber: subscriberSchema }))
    .output(z.array(schema))
    .query(async ({ input }) => {
      if (!input.subscriber) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const subscriptions = await database.subscription.findMany({
        where: { subscriber: JSON.stringify(input.subscriber) },
        orderBy: { ts: 'desc' },
      })
      const communities = keyBy(
        await database.community.findMany({
          where: { entry: { in: subscriptions.map(({ entry }) => entry) } },
        }),
        ({ entry }) => entry,
      )

      return compact(
        subscriptions
          .map(({ entry }) => communities[entry])
          .filter((community) => community)
          .map(({ permalink, data }) => {
            try {
              return { ...schema.parse(data), permalink }
            } catch {
              return
            }
          }),
      )
    }),
  set: procedure
    .input(
      proved(
        z.object({ entry: z.string().optional(), subscribe: z.boolean() }),
      ),
    )
    .output(z.boolean())
    .mutation(async ({ input }) => {
      if (!input.entry) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
      await verifyProof(input)

      const subscriber = JSON.stringify({
        type: input.proof.type,
        address: input.proof.address,
      })
      if (input.subscribe === true) {
        await database.$transaction([
          database.subscription.create({
            data: { entry: input.entry, subscriber, ts: new Date() },
          }),
          database.community.update({
            where: { entry: input.entry },
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
          database.community.update({
            where: { entry: input.entry },
            data: { subscribers: { decrement: 1 } },
          }),
        ])
      }

      return input.subscribe
    }),
})

export type SubscriptionRouter = typeof subscriptionRouter
