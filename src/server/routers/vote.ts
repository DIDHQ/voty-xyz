import { TRPCError } from '@trpc/server'
import { compact, keyBy, last, mapValues } from 'lodash-es'
import { z } from 'zod'

import { database } from '../../utils/database'
import { voteWithAuthorSchema } from '../../utils/schemas'
import { procedure, router } from '../trpc'

const textDecoder = new TextDecoder()

export const voteRouter = router({
  list: procedure
    .input(
      z.object({
        proposal: z.string().nullish(),
        cursor: z.string().nullish(),
      }),
    )
    .output(
      z.object({
        data: z.array(
          voteWithAuthorSchema.merge(z.object({ permalink: z.string() })),
        ),
        next: z.string().nullish(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.proposal) {
        throw new TRPCError({ code: 'NOT_FOUND' })
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
        proposal: z.string().nullish(),
        authors: z.array(z.string()).nullish(),
      }),
    )
    .output(z.record(z.string(), z.number()))
    .query(async ({ input }) => {
      if (!input.proposal) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      if (!input.authors) {
        throw new TRPCError({ code: 'NOT_FOUND' })
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
})

export type VoteRouter = typeof voteRouter
