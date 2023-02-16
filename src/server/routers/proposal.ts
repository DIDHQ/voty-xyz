import { TRPCError } from '@trpc/server'
import { compact, last } from 'lodash-es'
import { z } from 'zod'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { proposalWithAuthorSchema } from '../../utils/schemas'
import verifyProposal from '../../utils/verifiers/verify-proposal'
import { procedure, router } from '../trpc'

const textDecoder = new TextDecoder()

export const proposalRouter = router({
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().optional() }))
    .output(proposalWithAuthorSchema.optional())
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
      return proposalWithAuthorSchema.parse(
        JSON.parse(textDecoder.decode(proposal.data)),
      )
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
        data: z.array(
          proposalWithAuthorSchema.merge(z.object({ permalink: z.string() })),
        ),
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
                ...proposalWithAuthorSchema.parse(
                  JSON.parse(textDecoder.decode(data)),
                ),
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
    .input(proposalWithAuthorSchema)
    .output(z.string())
    .mutation(async ({ input }) => {
      const { proposal, community } = await verifyProposal(input)
      const { permalink, data } = await uploadToArweave(proposal)
      const ts = new Date()

      await database.proposal.create({
        data: {
          permalink,
          ts,
          author: proposal.author.did,
          entry: community.author.did,
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
