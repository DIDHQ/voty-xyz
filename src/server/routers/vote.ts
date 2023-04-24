import { TRPCError } from '@trpc/server'
import { compact, keyBy, last, mapValues } from 'lodash-es'
import { z } from 'zod'
import Decimal from 'decimal.js'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/authorship'
import { voteSchema } from '../../utils/schemas/vote'
import verifyVote from '../../utils/verifiers/verify-vote'
import { powerOfChoice } from '../../utils/choice'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/proof'
import verifySnapshot from '../../utils/verifiers/verify-snapshot'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'
import verifyGroup from '../../utils/verifiers/verify-group'

const schema = proved(authorized(voteSchema))

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
        data: z.array(schema.extend({ permalink: z.string() })),
        next: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.proposal) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const votes = await database.vote.findMany({
        where: { proposal_permalink: input.proposal },
        cursor: input.cursor ? { permalink: input.cursor } : undefined,
        take: 20,
        skip: input.cursor ? 1 : 0,
        orderBy: { ts: 'desc' },
      })

      const storages = keyBy(
        await database.storage.findMany({
          where: { permalink: { in: votes.map(({ permalink }) => permalink) } },
        }),
        ({ permalink }) => permalink,
      )

      return {
        data: compact(
          votes
            .filter(({ permalink }) => storages[permalink])
            .map(({ permalink }) => {
              try {
                return {
                  ...schema.parse(storages[permalink].data),
                  permalink,
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
    .input(z.object({ proposal: z.string().optional() }))
    .output(z.record(z.string(), z.string()))
    .query(async ({ input }) => {
      if (!input.proposal) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const votes = await database.vote.findMany({
        where: { proposal_permalink: input.proposal },
      })

      const storages = keyBy(
        await database.storage.findMany({
          where: { permalink: { in: votes.map(({ permalink }) => permalink) } },
        }),
        ({ permalink }) => permalink,
      )

      return mapValues(
        keyBy(votes, ({ voter }) => voter),
        ({ permalink }) => schema.parse(storages[permalink].data).power,
      )
    }),
  create: procedure
    .input(schema)
    .output(z.string())
    .mutation(async ({ input }) => {
      await verifySnapshot(input.authorship)
      await verifyProof(input)
      await verifyAuthorship(input.authorship, input.proof)
      const { proposal, group } = await verifyVote(input)
      const { community } = await verifyGroup(group)

      const permalink = await uploadToArweave(input)
      const ts = new Date()

      await database.$transaction([
        database.vote.create({
          data: {
            permalink,
            ts,
            voter: input.authorship.author,
            proposal_permalink: input.proposal,
          },
        }),
        database.storage.create({ data: { permalink, data: input } }),
        database.proposal.update({
          where: { permalink: input.proposal },
          data: { votes: { increment: 1 } },
        }),
        database.community.update({
          where: { id: community.id },
          data: { votes: { increment: 1 } },
        }),
        database.group.update({
          where: {
            id_community_id: { community_id: community.id, id: group.id },
          },
          data: { votes: { increment: 1 } },
        }),
        ...Object.entries(
          powerOfChoice(
            proposal.voting_type,
            input.choice,
            new Decimal(input.power),
          ),
        ).map(([option, power = 0]) =>
          database.choice.upsert({
            where: {
              proposal_permalink_option: {
                proposal_permalink: input.proposal,
                option,
              },
            },
            create: {
              proposal_permalink: input.proposal,
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
