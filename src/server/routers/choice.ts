import { Decimal } from 'decimal.js'
import { TRPCError } from '@trpc/server'
import { keyBy, mapValues } from 'lodash-es'
import { z } from 'zod'

import { database } from '../../utils/database'
import { procedure, router } from '../trpc'

export const groupProposalVoteChoiceRouter = router({
  get: procedure
    .input(
      z.object({
        groupProposal: z.string().optional(),
        option: z.string().optional(),
      }),
    )
    .output(z.object({ power: z.string() }))
    .query(async ({ input }) => {
      if (!input.groupProposal || !input.option) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const choice = await database.groupProposalVoteChoice.findUnique({
        where: {
          proposalPermalink_option: {
            proposalPermalink: input.groupProposal,
            option: input.option,
          },
        },
      })

      return {
        power: choice?.power.toString() || '0',
      }
    }),
  groupByProposal: procedure
    .input(z.object({ groupProposal: z.string().optional() }))
    .output(
      z.object({ powers: z.record(z.string(), z.string()), total: z.string() }),
    )
    .query(async ({ input }) => {
      if (!input.groupProposal) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const choices = await database.groupProposalVoteChoice.findMany({
        where: { proposalPermalink: input.groupProposal },
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

export type GroupProposalVoteChoiceRouter = typeof groupProposalVoteChoiceRouter
