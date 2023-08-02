import { TRPCError } from '@trpc/server'
import { compact, indexBy, last, mapValues } from 'remeda'
import { z } from 'zod'
import { Decimal } from 'decimal.js'
import { and, eq, inArray, lte, sql } from 'drizzle-orm'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/basic/authorship'
import { grantProposalVoteSchema } from '../../utils/schemas/v1/grant-proposal-vote'
import verifyGrantProposalVote from '../../utils/verifiers/verify-grant-proposal-vote'
import { powerOfChoice } from '../../utils/choice'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/basic/proof'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'
import verifyGrant from '../../utils/verifiers/verify-grant'
import { Activity } from '../../utils/schemas/activity'
import { table } from '@/src/utils/schema'

const schema = proved(authorized(grantProposalVoteSchema))

export const grantProposalVoteRouter = router({
  list: procedure
    .input(
      z.object({
        grantProposal: z.string().optional(),
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
      if (!input.grantProposal) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const grantProposalVotes =
        await database.query.grantProposalVote.findMany({
          where: and(
            eq(table.grantProposalVote.proposalPermalink, input.grantProposal),
            ...(input.cursor
              ? [lte(table.grantProposalVote.ts, input.cursor)]
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
            grantProposalVotes.map(({ permalink }) => permalink),
          ),
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
        next: last(grantProposalVotes)?.ts,
      }
    }),
  groupByVoter: procedure
    .input(z.object({ grant: z.string().optional() }))
    .output(z.record(z.string(), z.string()))
    .query(async ({ input }) => {
      if (!input.grant) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const grantProposalVotes =
        await database.query.grantProposalVote.findMany({
          where: ({ grantPermalink }, { eq }) =>
            eq(grantPermalink, input.grant!),
        })

      const storages = indexBy(
        await database.query.storage.findMany({
          where: inArray(
            table.storage.permalink,
            grantProposalVotes.map(({ permalink }) => permalink),
          ),
        }),
        ({ permalink }) => permalink,
      )

      return mapValues(
        indexBy(grantProposalVotes, ({ voter }) => voter),
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
      await verifyProof(input)
      const { grantProposal, grant } = await verifyGrantProposalVote(input)
      await verifyAuthorship(input.authorship, input.proof, grant.snapshots)
      const { community } = await verifyGrant(grant)

      const permalink = await uploadToArweave(input)
      const ts = new Date()

      await database.transaction((tx) =>
        Promise.all([
          tx.insert(table.grantProposalVote).values({
            permalink,
            ts,
            voter: input.authorship.author,
            grantPermalink: grantProposal.grant,
            proposalPermalink: input.grant_proposal,
          }),
          tx.insert(table.storage).values({ permalink, data: input }),
          tx
            .update(table.grantProposal)
            .set({
              votes: sql`${table.grantProposal.votes} + 1`,
            })
            .where(eq(table.grantProposal.permalink, input.grant_proposal)),
          tx
            .update(table.community)
            .set({
              grantProposalVotes: sql`${table.community.grantProposalVotes} + 1`,
            })
            .where(eq(table.community.id, community.id)),
          tx
            .update(table.grant)
            .set({
              votes: sql`${table.grant.votes} + 1`,
            })
            .where(eq(table.grant.permalink, grantProposal.grant)),
          ...Object.entries(
            powerOfChoice(input.powers, new Decimal(input.total_power)),
          ).map(([choice, power]) =>
            tx
              .insert(table.grantProposalVoteChoice)
              .values({
                proposalPermalink: input.grant_proposal,
                choice,
                power: power?.toString() || '0',
              })
              .onDuplicateKeyUpdate({
                set: {
                  power: sql`${table.grantProposalVoteChoice.power} + ${power}`,
                },
              }),
          ),
          tx.insert(table.activity).values({
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
          }),
        ]),
      )

      return permalink
    }),
})

export type GrantProposalVoteRouter = typeof grantProposalVoteRouter
