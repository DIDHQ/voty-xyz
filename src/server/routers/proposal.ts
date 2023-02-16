import { TRPCError } from '@trpc/server'
import { compact, last } from 'lodash-es'
import { z } from 'zod'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/authorship'
import { proposalSchema } from '../../utils/schemas/proposal'
import verifyProposal from '../../utils/verifiers/verify-proposal'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/proof'

const textDecoder = new TextDecoder()

const schema = proved(authorized(proposalSchema))

export const proposalRouter = router({
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().optional() }))
    .output(schema.optional())
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
      const proposal = await database.proposal.findUnique({
        where: { permalink: input.permalink },
      })
      if (!proposal) {
        return
      }
      return schema.parse(JSON.parse(textDecoder.decode(proposal.data)))
    }),
  list: procedure
    .input(
      z.object({
        entry: z.string().optional(),
        group: z.string().optional(),
        cursor: z.string().optional(),
      }),
    )
    .output(
      z.object({
        data: z.array(schema.extend({ permalink: z.string() })),
        next: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.entry) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
      const proposals = await database.proposal.findMany({
        cursor: input.cursor ? { permalink: input.cursor } : undefined,
        where: input.group
          ? { entry: input.entry, group: input.group }
          : { entry: input.entry },
        take: 50,
        orderBy: { ts: 'desc' },
      })
      return {
        data: compact(
          proposals.map(({ permalink, data }) => {
            try {
              return {
                permalink,
                ...schema.parse(JSON.parse(textDecoder.decode(data))),
              }
            } catch {
              return
            }
          }),
        ),
        next: last(proposals)?.permalink,
      }
    }),
  create: procedure
    .input(schema)
    .output(z.string())
    .mutation(async ({ input }) => {
      const { proposal, community } = await verifyProposal(input)
      const { permalink, data } = await uploadToArweave(proposal)
      const ts = new Date()

      await database.proposal.create({
        data: {
          permalink,
          ts,
          author: proposal.authorship.author,
          entry: community.authorship.author,
          community: proposal.community,
          group: proposal.group,
          data,
          votes: 0,
        },
      })

      return permalink
    }),
})

export type ProposalRouter = typeof proposalRouter
