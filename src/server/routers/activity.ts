import { z } from 'zod'
import { compact, last } from 'remeda'
import { TRPCError } from '@trpc/server'
import { and, desc, eq, lte } from 'drizzle-orm'

import { procedure, router } from '../trpc'
import { activitySchema } from '../../utils/schemas/activity'
import { database } from '../../utils/database'
import { table } from '@/src/utils/schema'

const schema = z.object({
  data: activitySchema,
  ts: z.date(),
  actor: z.string(),
})

export const activityRouter = router({
  list: procedure
    .input(
      z.object({
        communityId: z.string().optional(),
        cursor: z.date().optional(),
      }),
    )
    .output(
      z.object({
        data: z.array(schema),
        next: z.date().optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.communityId) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const activities = await database.query.activity.findMany({
        where: and(
          eq(table.activity.communityId, input.communityId),
          ...(input.cursor ? [lte(table.activity.ts, input.cursor)] : []),
        ),
        orderBy: desc(table.activity.ts),
        offset: input.cursor ? 1 : 0,
        limit: 30,
      })

      return {
        data: compact(
          activities.map(({ data, ts, actor }) => {
            try {
              return schema.parse({ data, ts, actor })
            } catch {
              return
            }
          }),
        ),
        next: last(activities)?.ts,
      }
    }),
})

export type ActivityRouter = typeof activityRouter
