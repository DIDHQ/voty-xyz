import { TRPCError } from '@trpc/server'
import { keyBy, mapValues } from 'lodash-es'
import { z } from 'zod'

import { database } from '../../utils/database'
import { procedure, router } from '../trpc'
import { positiveDecimalSchema } from '../../utils/schemas/basic/positive-decimal'

export const groupProposalVoteChoiceRouter = router({
  groupByOption: procedure
    .input(z.object({ groupProposal: z.string().optional() }))
    .output(z.record(z.string(), positiveDecimalSchema))
    .query(async ({ input }) => {
      if (!input.groupProposal) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const choices = await database.groupProposalVoteChoice.findMany({
        where: { proposalPermalink: input.groupProposal },
      })

      return mapValues(
        keyBy(choices, ({ option }) => option),
        ({ power }) => power.toString(),
      )
    }),
})

export type GroupProposalVoteChoiceRouter = typeof groupProposalVoteChoiceRouter
