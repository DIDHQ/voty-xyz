import { TRPCError } from '@trpc/server'
import { compact, keyBy, last, mapValues } from 'lodash-es'
import { z } from 'zod'
import Decimal from 'decimal.js'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/basic/authorship'
import { grantProposalVoteSchema } from '../../utils/schemas/v1/grant-proposal-vote'
import verifyGrantProposalVote from '../../utils/verifiers/verify-grant-proposal-vote'
import { powerOfChoice } from '../../utils/choice'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/basic/proof'
import verifySnapshot from '../../utils/verifiers/verify-snapshot'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'
import verifyGrant from '../../utils/verifiers/verify-grant'
import { Activity } from '../../utils/schemas/activity'

const schema = proved(authorized(grantProposalVoteSchema))

export const grantProposalVoteRouter = router({
  list: procedure
    .input(
      z.object({
        grantProposal: z.string().optional(),
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
      if (!input.grantProposal) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const grantProposalVotes = await database.grantProposalVote.findMany({
        where: { proposalPermalink: input.grantProposal },
        cursor: input.cursor ? { permalink: input.cursor } : undefined,
        take: 20,
        skip: input.cursor ? 1 : 0,
        orderBy: { ts: 'desc' },
      })

      const storages = keyBy(
        await database.storage.findMany({
          where: {
            permalink: {
              in: grantProposalVotes.map(({ permalink }) => permalink),
            },
          },
        }),
        ({ permalink }) => permalink,
      )

      return {
        data: compact(
          grantProposalVotes
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
        next: last(grantProposalVotes)?.permalink,
      }
    }),
  groupByVoter: procedure
    .input(z.object({ grant: z.string().optional() }))
    .output(z.record(z.string(), z.string()))
    .query(async ({ input }) => {
      if (!input.grant) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const grantProposalVotes = await database.grantProposalVote.findMany({
        where: { grantPermalink: input.grant },
      })

      const storages = keyBy(
        await database.storage.findMany({
          where: {
            permalink: {
              in: grantProposalVotes.map(({ permalink }) => permalink),
            },
          },
        }),
        ({ permalink }) => permalink,
      )

      return mapValues(
        keyBy(grantProposalVotes, ({ voter }) => voter),
        ({ permalink }) => schema.parse(storages[permalink].data).total_power,
      )
    }),
  create: procedure
    .input(
      schema.refine(
        (vote) => vote.powers[Object.keys(vote.powers)[0]] === vote.total_power,
        'Illegal vote',
      ),
    )
    .output(z.string())
    .mutation(async ({ input }) => {
      await verifySnapshot(input.authorship)
      await verifyProof(input)
      await verifyAuthorship(input.authorship, input.proof)
      const { grantProposal, grant } = await verifyGrantProposalVote(input)
      const { community } = await verifyGrant(grant)

      const permalink = await uploadToArweave(input)
      const ts = new Date()

      await database.$transaction([
        database.grantProposalVote.create({
          data: {
            permalink,
            ts,
            voter: input.authorship.author,
            grantPermalink: grantProposal.grant,
            proposalPermalink: input.grant_proposal,
          },
        }),
        database.storage.create({ data: { permalink, data: input } }),
        database.grantProposal.update({
          where: { permalink: input.grant_proposal },
          data: { votes: { increment: 1 } },
        }),
        database.community.update({
          where: { id: community.id },
          data: { grantProposalVotes: { increment: 1 } },
        }),
        database.grant.update({
          where: { permalink: grantProposal.grant },
          data: { votes: { increment: 1 } },
        }),
        ...Object.entries(
          powerOfChoice(input.powers, new Decimal(input.total_power)),
        ).map(([choice, power = 0]) =>
          database.grantProposalVoteChoice.upsert({
            where: {
              proposalPermalink_choice: {
                proposalPermalink: input.grant_proposal,
                choice,
              },
            },
            create: {
              proposalPermalink: input.grant_proposal,
              choice,
              power,
            },
            update: {
              power: { increment: power },
            },
          }),
        ),
        database.activity.create({
          data: {
            communityId: community.id,
            actor: input.authorship.author,
            type: 'create_grant_proposal_vote',
            data: {
              type: 'create_grant_proposal_vote',
              community_id: community.id,
              community_permalink: grant.community,
              community_name: community.name,
              grant_permalink: grantProposal.grant,
              grant_name: grant.name,
              grant_proposal_permalink: input.grant_proposal,
              grant_proposal_title: grantProposal.title,
              grant_proposal_vote_permalink: permalink,
            } satisfies Activity,
            ts,
          },
        }),
      ])

      return permalink
    }),
})

export type GrantProposalVoteRouter = typeof grantProposalVoteRouter
