import { Decimal } from 'decimal.js'
import { TRPCError } from '@trpc/server'
import { keyBy, mapValues } from 'lodash-es'
import { z } from 'zod'

import { database } from '../../utils/database'
import { procedure, router } from '../trpc'

export const choiceRouter = router({
  groupByProposal: procedure
    .input(z.object({ proposal: z.string().optional() }))
    .output(
      z.object({ powers: z.record(z.string(), z.string()), total: z.string() }),
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
          ({ power }) => power.toString(),
        ),
        total: choices
          .reduce((total, choice) => total.add(choice.power), new Decimal(0))
          .toString(),
      }
    }),
})

export type ChoiceRouter = typeof choiceRouter
