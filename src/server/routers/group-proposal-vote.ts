import { TRPCError } from '@trpc/server'
import { compact, keyBy, last, mapValues } from 'lodash-es'
import { z } from 'zod'
import Decimal from 'decimal.js'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/basic/authorship'
import { groupProposalVoteSchema } from '../../utils/schemas/v1/group-proposal-vote'
import verifyGroupProposalVote from '../../utils/verifiers/verify-group-proposal-vote'
import { powerOfChoice } from '../../utils/choice'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/basic/proof'
import verifySnapshot from '../../utils/verifiers/verify-snapshot'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'
import verifyGroup from '../../utils/verifiers/verify-group'

const schema = proved(authorized(groupProposalVoteSchema))

export const groupProposalVoteRouter = router({
  list: procedure
    .input(
      z.object({
        groupProposal: z.string().optional(),
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
      if (!input.groupProposal) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const groupProposalVotes = await database.groupProposalVote.findMany({
        where: { proposalPermalink: input.groupProposal },
        cursor: input.cursor ? { permalink: input.cursor } : undefined,
        take: 20,
        skip: input.cursor ? 1 : 0,
        orderBy: { ts: 'desc' },
      })

      const storages = keyBy(
        await database.storage.findMany({
          where: {
            permalink: {
              in: groupProposalVotes.map(({ permalink }) => permalink),
            },
          },
        }),
        ({ permalink }) => permalink,
      )

      return {
        data: compact(
          groupProposalVotes
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
        next: last(groupProposalVotes)?.permalink,
      }
    }),
  groupByVoter: procedure
    .input(z.object({ groupProposal: z.string().optional() }))
    .output(z.record(z.string(), z.string()))
    .query(async ({ input }) => {
      if (!input.groupProposal) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const groupProposalVotes = await database.groupProposalVote.findMany({
        where: { proposalPermalink: input.groupProposal },
      })

      const storages = keyBy(
        await database.storage.findMany({
          where: {
            permalink: {
              in: groupProposalVotes.map(({ permalink }) => permalink),
            },
          },
        }),
        ({ permalink }) => permalink,
      )

      return mapValues(
        keyBy(groupProposalVotes, ({ voter }) => voter),
        ({ permalink }) => schema.parse(storages[permalink].data).total_power,
      )
    }),
  create: procedure
    .input(schema)
    .output(z.string())
    .mutation(async ({ input }) => {
      await verifySnapshot(input.authorship)
      await verifyProof(input)
      await verifyAuthorship(input.authorship, input.proof)
      const { group } = await verifyGroupProposalVote(input)
      const { community } = await verifyGroup(group)

      const permalink = await uploadToArweave(input)
      const ts = new Date()

      await database.$transaction([
        database.groupProposalVote.create({
          data: {
            permalink,
            ts,
            voter: input.authorship.author,
            proposalPermalink: input.group_proposal,
          },
        }),
        database.storage.create({ data: { permalink, data: input } }),
        database.groupProposal.update({
          where: { permalink: input.group_proposal },
          data: { votes: { increment: 1 } },
        }),
        database.community.update({
          where: { id: community.id },
          data: { groupProposalVotes: { increment: 1 } },
        }),
        database.group.update({
          where: {
            id_communityId: { communityId: community.id, id: group.id },
          },
          data: { votes: { increment: 1 } },
        }),
        ...Object.entries(
          powerOfChoice(input.powers, new Decimal(input.total_power)),
        ).map(([choice, power = 0]) =>
          database.groupProposalVoteChoice.upsert({
            where: {
              proposalPermalink_choice: {
                proposalPermalink: input.group_proposal,
                choice,
              },
            },
            create: {
              proposalPermalink: input.group_proposal,
              choice,
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

export type GroupProposalVoteRouter = typeof groupProposalVoteRouter
