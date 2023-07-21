import { z } from 'zod'
import { compact, last } from 'remeda'
import { TRPCError } from '@trpc/server'

import { procedure, router } from '../trpc'
import { activitySchema } from '../../utils/schemas/activity'
import { database } from '../../utils/database'

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
        cursor: z.object({ ts: z.date(), actor: z.string() }).optional(),
      }),
    )
    .output(
      z.object({
        data: z.array(schema),
        next: z.object({ ts: z.date(), actor: z.string() }).optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.communityId) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const activities = await database.activity.findMany({
        where: { communityId: input.communityId },
        cursor: input.cursor ? { ts_actor: input.cursor } : undefined,
        take: 30,
        skip: input.cursor ? 1 : 0,
        orderBy: { ts: 'desc' },
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
        next: last(activities),
      }
    }),
})

export type ActivityRouter = typeof activityRouter
