import { TRPCError } from '@trpc/server'
import { keyBy, mapValues } from 'lodash-es'
import { z } from 'zod'

import { database } from '../../utils/database'
import { procedure, router } from '../trpc'
import { positiveDecimalSchema } from '../../utils/schemas/positive-decimal'

export const grantProposalVoteChoiceRouter = router({
  groupByOption: procedure
    .input(z.object({ grantProposal: z.string().optional() }))
    .output(z.record(z.string(), positiveDecimalSchema))
    .query(async ({ input }) => {
      if (!input.grantProposal) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const choices = await database.grantProposalVoteChoice.findMany({
        where: { proposalPermalink: input.grantProposal },
      })

      return mapValues(
        keyBy(choices, ({ option }) => option),
        ({ power }) => power.toString(),
      )
    }),
})

export type GrantProposalVoteChoiceRouter = typeof grantProposalVoteChoiceRouter
