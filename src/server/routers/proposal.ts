import { TRPCError } from '@trpc/server'
import { compact, last } from 'lodash-es'
import { z } from 'zod'

import { upload } from '../../utils/arweave'
import { database } from '../../utils/database'
import { proposalWithAuthorSchema } from '../../utils/schemas'
import verifyProposal from '../../utils/verifiers/verify-proposal'
import { procedure, router } from '../trpc'

const textDecoder = new TextDecoder()

const jwk = JSON.parse(process.env.ARWEAVE_KEY_FILE!)

export const proposalRouter = router({
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().nullish() }))
    .output(proposalWithAuthorSchema)
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      const proposal = await database.proposal.findUnique({
        where: { permalink: input.permalink },
      })
      if (!proposal) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return proposalWithAuthorSchema.parse(
        JSON.parse(textDecoder.decode(proposal.data)),
      )
    }),
  list: procedure
    .input(
      z.object({
        entry: z.string().nullish(),
        group: z.string().nullish(),
        cursor: z.string().nullish(),
      }),
    )
    .output(
      z.object({
        data: z.array(
          proposalWithAuthorSchema.merge(z.object({ permalink: z.string() })),
        ),
        next: z.string().nullish(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.entry) {
        throw new TRPCError({ code: 'NOT_FOUND' })
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
    .mutation(async ({ input }) => {
      const { proposal, community } = await verifyProposal(input)
      const { permalink, data } = await upload(proposal, jwk)
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
    }),
})

export type ProposalRouter = typeof proposalRouter
