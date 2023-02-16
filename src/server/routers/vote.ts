import { TRPCError } from '@trpc/server'
import { compact, keyBy, last, mapValues } from 'lodash-es'
import { z } from 'zod'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { voteWithAuthorSchema } from '../../utils/schemas/vote'
import verifyVote from '../../utils/verifiers/verify-vote'
import { powerOfChoice } from '../../utils/voting'
import { procedure, router } from '../trpc'

const textDecoder = new TextDecoder()

export const voteRouter = router({
  list: procedure
    .input(
      z.object({
        proposal: z.string().optional(),
        cursor: z.string().optional(),
      }),
    )
    .output(
      z.object({
        data: z.array(
          voteWithAuthorSchema.merge(z.object({ permalink: z.string() })),
        ),
        next: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.proposal) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
      const votes = await database.vote.findMany({
        cursor: input.cursor ? { permalink: input.cursor } : undefined,
        where: { proposal: input.proposal },
        take: 50,
        orderBy: { ts: 'desc' },
      })
      return {
        data: compact(
          votes.map(({ permalink, data }) => {
            try {
              return {
                permalink,
                ...voteWithAuthorSchema.parse(
                  JSON.parse(textDecoder.decode(data)),
                ),
              }
            } catch {
              return
            }
          }),
        ),
        next: last(votes)?.permalink,
      }
    }),
  groupByProposal: procedure
    .input(
      z.object({
        proposal: z.string().optional(),
        authors: z.array(z.string()).optional(),
      }),
    )
    .output(z.record(z.string(), z.number()))
    .query(async ({ input }) => {
      if (!input.proposal || !input.authors) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
      const votes = await database.vote.findMany({
        where: {
          proposal: input.proposal,
          author: { in: input.authors },
        },
      })
      return mapValues(
        keyBy(votes, ({ author }) => author),
        ({ data }) =>
          voteWithAuthorSchema.parse(JSON.parse(textDecoder.decode(data)))
            .power,
      )
    }),
  create: procedure
    .input(voteWithAuthorSchema)
    .output(z.string())
    .mutation(async ({ input }) => {
      const { vote, proposal } = await verifyVote(input)
      const { permalink, data } = await uploadToArweave(vote)
      const ts = new Date()

      await database.$transaction([
        database.vote.create({
          data: {
            permalink,
            ts,
            author: vote.authorship.did,
            community: proposal.community,
            group: proposal.group,
            proposal: vote.proposal,
            data,
          },
        }),
        database.proposal.update({
          where: { permalink: vote.proposal },
          data: { votes: { increment: 1 } },
        }),
        ...Object.entries(
          powerOfChoice(proposal.voting_type, vote.choice, vote.power),
        ).map(([option, power = 0]) =>
          database.choice.upsert({
            where: {
              proposal_option: { proposal: vote.proposal, option },
            },
            create: {
              proposal: vote.proposal,
              option,
              power,
            },
            update: {
              power: { increment: power },
            },
          }),
        ),
      ])

      return permalink
    }),
})

export type VoteRouter = typeof voteRouter
