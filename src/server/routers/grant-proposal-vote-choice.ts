import { TRPCError } from '@trpc/server'
import { indexBy, mapValues } from 'remeda'
import { z } from 'zod'

import { database } from '../../utils/database'
import { procedure, router } from '../trpc'
import { positiveDecimalSchema } from '../../utils/schemas/basic/positive-decimal'

export const grantProposalVoteChoiceRouter = router({
  groupByOption: procedure
    .input(z.object({ grantProposal: z.string().optional() }))
    .output(z.record(z.string(), positiveDecimalSchema))
    .query(async ({ input }) => {
      if (!input.grantProposal) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const choices = await database.query.grantProposalVoteChoice.findMany({
        where: ({ proposalPermalink }, { eq }) =>
          eq(proposalPermalink, input.grantProposal!),
      })

      return mapValues(
        indexBy(choices, ({ choice }) => choice),
        ({ power }) => power.toString(),
      )
    }),
})

export type GrantProposalVoteChoiceRouter = typeof grantProposalVoteChoiceRouter
