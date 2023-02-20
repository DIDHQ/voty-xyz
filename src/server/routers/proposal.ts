import { TRPCError } from '@trpc/server'
import { compact, last } from 'lodash-es'
import { z } from 'zod'

import { uploadToArweave } from '../../utils/upload'
import { database, getByPermalink } from '../../utils/database'
import { authorized } from '../../utils/schemas/authorship'
import { proposalSchema } from '../../utils/schemas/proposal'
import verifyProposal from '../../utils/verifiers/verify-proposal'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/proof'
import { DataType } from '../../utils/constants'
import verifySnapshot from '../../utils/verifiers/verify-snapshot'
import verifyAuthorshipProof from '../../utils/verifiers/verify-authorship-proof'

const textDecoder = new TextDecoder()

const schema = proved(authorized(proposalSchema))

export const proposalRouter = router({
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().optional() }))
    .output(
      schema.extend({ permalink: z.string(), votes: z.number() }).nullable(),
    )
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const proposal = await getByPermalink(DataType.PROPOSAL, input.permalink)

      return proposal
        ? {
            ...proposal.data,
            permalink: proposal.permalink,
            votes: proposal.votes,
          }
        : null
    }),
  list: procedure
    .input(
      z.object({
        entry: z.string().optional(),
        workgroup: z.string().optional(),
        cursor: z.string().optional(),
      }),
    )
    .output(
      z.object({
        data: z.array(
          schema.extend({ permalink: z.string(), votes: z.number() }),
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
        where: input.workgroup
          ? { entry: input.entry, workgroup: input.workgroup }
          : { entry: input.entry },
        take: 50,
        orderBy: { ts: 'desc' },
      })

      return {
        data: compact(
          proposals.map(({ data, permalink, votes }) => {
            try {
              return {
                ...schema.parse(JSON.parse(textDecoder.decode(data))),
                permalink,
                votes,
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
      await verifySnapshot(input.authorship)
      await verifyAuthorshipProof(input)
      const { community } = await verifyProposal(input)
      const { permalink, data } = await uploadToArweave(input)
      const ts = new Date()

      await database.$transaction([
        database.proposal.create({
          data: {
            permalink,
            ts,
            author: input.authorship.author,
            entry: community.authorship.author,
            community: input.community,
            workgroup: input.workgroup,
            data,
            votes: 0,
          },
        }),
        database.entry.update({
          where: { did: community.authorship.author },
          data: { proposals: { increment: 1 } },
        }),
      ])

      return permalink
    }),
})

export type ProposalRouter = typeof proposalRouter
