import { TRPCError } from '@trpc/server'
import { keyBy, mapValues, sumBy } from 'lodash-es'
import { z } from 'zod'

import { database } from '../../utils/database'
import { procedure, router } from '../trpc'

export const choiceRouter = router({
  groupByProposal: procedure
    .input(z.object({ proposal: z.string().optional() }))
    .output(
      z.object({ powers: z.record(z.string(), z.number()), total: z.number() }),
    )
    .query(async ({ input }) => {
      if (!input.proposal) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const choices = await database.choice.findMany({
        where: { proposal: input.proposal },
      })

      return {
        powers: mapValues(
          keyBy(choices, ({ option }) => option),
          ({ power }) => power,
        ),
        total: sumBy(choices, ({ power }) => power),
      }
    }),
})

export type ChoiceRouter = typeof choiceRouter
