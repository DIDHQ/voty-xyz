import { TRPCError } from '@trpc/server'
import { compact, indexBy, last, mapValues } from 'remeda'
import { z } from 'zod'
import { Decimal } from 'decimal.js'
import { and, eq, inArray, lte, sql } from 'drizzle-orm'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/basic/authorship'
import { groupProposalVoteSchema } from '../../utils/schemas/v1/group-proposal-vote'
import verifyGroupProposalVote from '../../utils/verifiers/verify-group-proposal-vote'
import { powerOfChoice } from '../../utils/choice'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/basic/proof'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'
import verifyGroup from '../../utils/verifiers/verify-group'
import { Activity } from '../../utils/schemas/activity'
import { table } from '@/src/utils/schema'

const schema = proved(authorized(groupProposalVoteSchema))

export const groupProposalVoteRouter = router({
  list: procedure
    .input(
      z.object({
        groupProposal: z.string().optional(),
        cursor: z.date().optional(),
      }),
    )
    .output(
      z.object({
        data: z.array(schema.extend({ permalink: z.string() })),
        next: z.date().optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.groupProposal) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const groupProposalVotes =
        await database.query.groupProposalVote.findMany({
          where: and(
            eq(table.groupProposalVote.proposalPermalink, input.groupProposal),
            ...(input.cursor
              ? [lte(table.groupProposalVote.ts, input.cursor)]
              : []),
          ),
          limit: 50,
          offset: input.cursor ? 1 : 0,
          orderBy: ({ ts }, { desc }) => desc(ts),
        })

      const storages = indexBy(
        await database.query.storage.findMany({
          where: inArray(
            table.storage.permalink,
            groupProposalVotes.map(({ permalink }) => permalink),
          ),
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
        next: last(groupProposalVotes)?.ts,
      }
    }),
  groupByVoter: procedure
    .input(z.object({ groupProposal: z.string().optional() }))
    .output(z.record(z.string(), z.string()))
    .query(async ({ input }) => {
      if (!input.groupProposal) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const groupProposalVotes =
        await database.query.groupProposalVote.findMany({
          where: ({ proposalPermalink }, { eq }) =>
            eq(proposalPermalink, input.groupProposal!),
        })

      const storages = indexBy(
        await database.query.storage.findMany({
          where: inArray(
            table.storage.permalink,
            groupProposalVotes.map(({ permalink }) => permalink),
          ),
        }),
        ({ permalink }) => permalink,
      )

      return mapValues(
        indexBy(groupProposalVotes, ({ voter }) => voter),
        ({ permalink }) => schema.parse(storages[permalink].data).total_power,
      )
    }),
  create: procedure
    .input(schema)
    .output(z.string())
    .mutation(async ({ input }) => {
      await verifyProof(input)
      const { group, groupProposal } = await verifyGroupProposalVote(input)
      await verifyAuthorship(
        input.authorship,
        input.proof,
        groupProposal.snapshots,
      )
      const { community } = await verifyGroup(group)

      const permalink = await uploadToArweave(input)
      const ts = new Date()

      await database.transaction((tx) =>
        Promise.all([
          tx.insert(table.groupProposalVote).values({
            permalink,
            ts,
            voter: input.authorship.author,
            proposalPermalink: input.group_proposal,
          }),
          tx.insert(table.storage).values({ permalink, data: input }),
          tx
            .update(table.groupProposal)
            .set({
              votes: sql`${table.groupProposal.votes} + 1`,
            })
            .where(eq(table.groupProposal.permalink, input.group_proposal)),
          tx
            .update(table.community)
            .set({
              groupProposalVotes: sql`${table.community.groupProposalVotes} + 1`,
            })
            .where(eq(table.community.id, community.id)),
          tx
            .update(table.group)
            .set({
              votes: sql`${table.group.votes} + 1`,
            })
            .where(
              and(
                eq(table.group.communityId, community.id),
                eq(table.group.id, group.id),
              ),
            ),
          ...Object.entries(
            powerOfChoice(input.powers, new Decimal(input.total_power)),
          ).map(([choice, power]) =>
            tx
              .insert(table.groupProposalVoteChoice)
              .values({
                proposalPermalink: input.group_proposal,
                choice,
                power: power?.toString() || '0',
              })
              .onDuplicateKeyUpdate({
                set: { power: sql`${table.groupProposalVoteChoice.power} + 1` },
              }),
          ),
          tx.insert(table.activity).values({
            communityId: community.id,
            actor: input.authorship.author,
            type: 'create_group_proposal_vote',
            data: {
              type: 'create_group_proposal_vote',
              community_id: community.id,
              community_permalink: group.community,
              community_name: community.name,
              group_id: group.id,
              group_permalink: groupProposal.group,
              group_name: group.name,
              group_proposal_permalink: input.group_proposal,
              group_proposal_title: groupProposal.title,
              group_proposal_vote_permalink: permalink,
              group_proposal_vote_choices: Object.keys(input.powers),
            } satisfies Activity,
            ts,
          }),
        ]),
      )

      return permalink
    }),
})

export type GroupProposalVoteRouter = typeof groupProposalVoteRouter
