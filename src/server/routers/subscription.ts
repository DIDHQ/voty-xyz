import { TRPCError } from '@trpc/server'
import { compact, indexBy } from 'remeda'
import { z } from 'zod'
import { and, eq, inArray, sql } from 'drizzle-orm'

import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/basic/authorship'
import { communitySchema } from '../../utils/schemas/v1/community'
import { proofSchema, proved } from '../../utils/schemas/basic/proof'
import { procedure, router } from '../trpc'
import verifyProof from '../../utils/verifiers/verify-proof'
import { table } from '@/src/utils/schema'

const schema = proved(authorized(communitySchema))

const subscriberSchema = proofSchema.pick({ type: true, address: true })

export const subscriptionRouter = router({
  get: procedure
    .input(
      z.object({
        communityId: z.string().optional(),
        subscriber: subscriberSchema.optional(),
      }),
    )
    .output(z.boolean())
    .query(async ({ input }) => {
      if (!input.communityId || !input.subscriber) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const subscription = await database.query.subscription.findFirst({
        where: ({ communityId, subscriber }, { and, eq }) =>
          and(
            eq(communityId, input.communityId!),
            eq(subscriber, JSON.stringify(input.subscriber)),
          ),
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

      const subscriptions = await database.query.subscription.findMany({
        where: ({ subscriber }, { eq }) =>
          eq(subscriber, JSON.stringify(input.subscriber)),
        orderBy: ({ ts }, { desc }) => desc(ts),
      })
      const communities = indexBy(
        await database.query.community.findMany({
          where: inArray(
            table.community.id,
            subscriptions.map(({ communityId }) => communityId),
          ),
        }),
        ({ id }) => id,
      )
      const storages = indexBy(
        await database.query.storage.findMany({
          where: inArray(
            table.storage.permalink,
            Object.values(communities).map(({ permalink }) => permalink),
          ),
        }),
        ({ permalink }) => permalink,
      )

      return compact(
        subscriptions
          .map(
            ({ communityId }) => storages[communities[communityId].permalink],
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
          communityId: z.string().optional(),
          subscribe: z.boolean(),
        }),
      ),
    )
    .output(z.boolean())
    .mutation(async ({ input }) => {
      if (!input.communityId) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
      await verifyProof(input)

      const subscriber = JSON.stringify({
        type: input.proof.type,
        address: input.proof.address,
      })
      if (input.subscribe === true) {
        await database.transaction((tx) =>
          Promise.all([
            tx.insert(table.subscription).values({
              communityId: input.communityId!,
              subscriber,
              ts: new Date(),
            }),
            tx
              .update(table.community)
              .set({
                subscribers: sql`${table.community.subscribers} + 1`,
              })
              .where(eq(table.community.id, input.communityId!)),
          ]),
        )
      } else {
        await database.transaction((tx) =>
          Promise.all([
            tx
              .delete(table.subscription)
              .where(
                and(
                  eq(table.subscription.communityId, input.communityId!),
                  eq(table.subscription.subscriber, subscriber),
                ),
              ),
            tx
              .update(table.community)
              .set({
                subscribers: sql`${table.community.subscribers} - 1`,
              })
              .where(eq(table.community.id, input.communityId!)),
          ]),
        )
      }

      return input.subscribe
    }),
})

export type SubscriptionRouter = typeof subscriptionRouter
