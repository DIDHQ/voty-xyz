import { TRPCError } from '@trpc/server'
import { compact, keyBy } from 'lodash-es'
import { z } from 'zod'

import { database } from '../../utils/database'
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
        community_id: z.string().optional(),
        subscriber: subscriberSchema.optional(),
      }),
    )
    .output(z.boolean())
    .query(async ({ input }) => {
      if (!input.community_id || !input.subscriber) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const subscription = await database.subscription.findUnique({
        where: {
          community_id_subscriber: {
            community_id: input.community_id,
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
          where: {
            id: { in: subscriptions.map(({ community_id }) => community_id) },
          },
        }),
        ({ id }) => id,
      )
      const storages = keyBy(
        await database.storage.findMany({
          where: {
            permalink: {
              in: Object.values(communities).map(({ permalink }) => permalink),
            },
          },
        }),
        ({ permalink }) => permalink,
      )

      return compact(
        subscriptions
          .map(
            ({ community_id }) => storages[communities[community_id].permalink],
          )
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
        z.object({
          community_id: z.string().optional(),
          subscribe: z.boolean(),
        }),
      ),
    )
    .output(z.boolean())
    .mutation(async ({ input }) => {
      if (!input.community_id) {
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
            data: {
              community_id: input.community_id,
              subscriber,
              ts: new Date(),
            },
          }),
          database.community.update({
            where: { id: input.community_id },
            data: { subscribers: { increment: 1 } },
          }),
        ])
      } else {
        await database.$transaction([
          database.subscription.delete({
            where: {
              community_id_subscriber: {
                community_id: input.community_id,
                subscriber,
              },
            },
          }),
          database.community.update({
            where: { id: input.community_id },
            data: { subscribers: { decrement: 1 } },
          }),
        ])
      }

      return input.subscribe
    }),
})

export type SubscriptionRouter = typeof subscriptionRouter
