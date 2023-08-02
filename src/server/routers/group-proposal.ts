import { TRPCError } from '@trpc/server'
import { compact, indexBy, last } from 'remeda'
import { z } from 'zod'
import dayjs from 'dayjs'
import { and, eq, gt, inArray, isNull, lte, sql } from 'drizzle-orm'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/basic/authorship'
import { groupProposalSchema } from '../../utils/schemas/v1/group-proposal'
import verifyGroupProposal from '../../utils/verifiers/verify-group-proposal'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/basic/proof'
import { commonCoinTypes } from '../../utils/constants'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'
import {
  getPermalinkSnapshot,
  getSnapshotTimestamp,
} from '../../utils/snapshot'
import { GroupProposalPhase } from '../../utils/phase'
import { groupSchema } from '../../utils/schemas/v1/group'
import verifyGroup from '../../utils/verifiers/verify-group'
import { Activity } from '../../utils/schemas/activity'
import {
  flushUploadBuffers,
  getAllUploadBufferKeys,
} from '../../utils/upload-buffer'
import { getImages, getSummary } from '../../utils/markdown'
import { table } from '@/src/utils/schema'

const schema = proved(authorized(groupProposalSchema))

export const groupProposalRouter = router({
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().optional() }))
    .output(schema.extend({ votes: z.number() }).nullable())
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const groupProposal = await database.query.groupProposal.findFirst({
        where: ({ permalink }, { eq }) => eq(permalink, input.permalink!),
      })

      if (
        groupProposal &&
        (!groupProposal.tsAnnouncing || !groupProposal.tsVoting)
      ) {
        try {
          const storage = await database.query.storage.findFirst({
            where: ({ permalink }, { eq }) =>
              eq(permalink, groupProposal.groupPermalink),
          })
          const group = storage ? groupSchema.parse(storage.data) : null
          if (group) {
            const timestamp = await getSnapshotTimestamp(
              commonCoinTypes.AR,
              await getPermalinkSnapshot(groupProposal.permalink),
            )
            await database
              .update(table.groupProposal)
              .set({
                ts: timestamp,
                tsAnnouncing: dayjs(timestamp)
                  .add(group.duration.announcing * 1000)
                  .toDate(),
                tsVoting: dayjs(timestamp)
                  .add(group.duration.announcing * 1000)
                  .add(group.duration.voting * 1000)
                  .toDate(),
              })
              .where(eq(table.groupProposal.permalink, groupProposal.permalink))
          }
        } catch (err) {
          console.error(err)
        }
      }

      const storage = await database.query.storage.findFirst({
        where: ({ permalink }, { eq }) => eq(permalink, input.permalink!),
      })
      return storage && groupProposal
        ? { ...schema.parse(storage.data), votes: groupProposal.votes }
        : null
    }),
  list: procedure
    .input(
      z.object({
        communityId: z.string().optional(),
        groupId: z.string().optional(),
        phase: z
          .enum([
            GroupProposalPhase.CONFIRMING,
            GroupProposalPhase.ANNOUNCING,
            GroupProposalPhase.VOTING,
            GroupProposalPhase.ENDED,
          ])
          .optional(),
        cursor: z.date().optional(),
      }),
    )
    .output(
      z.object({
        data: z.array(
          schema.extend({
            images: z.array(z.string()),
            permalink: z.string(),
            communityId: z.string(),
            groupId: z.string(),
            votes: z.number(),
            ts: z.date(),
            tsAnnouncing: z.date().nullable(),
            tsVoting: z.date().nullable(),
          }),
        ),
        next: z.date().optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.communityId) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const now = new Date()
      const filter =
        input.phase === GroupProposalPhase.CONFIRMING
          ? [
              isNull(table.groupProposal.tsAnnouncing),
              isNull(table.groupProposal.tsVoting),
            ]
          : input.phase === GroupProposalPhase.ANNOUNCING
          ? [
              lte(table.groupProposal.ts, now),
              gt(table.groupProposal.tsAnnouncing, now),
            ]
          : input.phase === GroupProposalPhase.VOTING
          ? [
              lte(table.groupProposal.tsAnnouncing, now),
              gt(table.groupProposal.tsVoting, now),
            ]
          : input.phase === GroupProposalPhase.ENDED
          ? [lte(table.groupProposal.tsVoting, now)]
          : []
      const groupProposals = await database.query.groupProposal.findMany({
        where: and(
          eq(table.groupProposal.communityId, input.communityId),
          ...(input.groupId
            ? [eq(table.groupProposal.groupId, input.groupId)]
            : []),
          ...filter,
          ...(input.cursor ? [lte(table.groupProposal.ts, input.cursor)] : []),
        ),
        limit: 20,
        offset: input.cursor ? 1 : 0,
        orderBy: ({ ts }, { desc }) => desc(ts),
      })
      const storages = indexBy(
        await database.query.storage.findMany({
          where: inArray(
            table.storage.permalink,
            groupProposals.map(({ permalink }) => permalink),
          ),
        }),
        ({ permalink }) => permalink,
      )

      return {
        data: compact(
          groupProposals
            .filter(({ permalink }) => storages[permalink])
            .map(
              ({
                permalink,
                communityId,
                groupId,
                votes,
                ts,
                tsAnnouncing,
                tsVoting,
              }) => {
                try {
                  const groupProposal = schema.parse(storages[permalink].data)
                  return {
                    ...groupProposal,
                    images: getImages(groupProposal.content),
                    content: getSummary(groupProposal.content),
                    permalink,
                    communityId,
                    groupId,
                    votes,
                    ts,
                    tsAnnouncing,
                    tsVoting,
                  }
                } catch {
                  return
                }
              },
            ),
        ),
        next: last(groupProposals)?.ts,
      }
    }),
  create: procedure
    .input(schema)
    .output(z.string())
    .mutation(async ({ input }) => {
      await verifyProof(input)
      await verifyAuthorship(input.authorship, input.proof)
      const { group } = await verifyGroupProposal(input)
      const { community } = await verifyGroup(group)

      await flushUploadBuffers(getAllUploadBufferKeys(input.content))
      const permalink = await uploadToArweave(input)
      const ts = new Date()

      await database.transaction((tx) =>
        Promise.all([
          tx.insert(table.groupProposal).values({
            permalink,
            proposer: input.authorship.author,
            communityId: community.id,
            groupId: group.id,
            groupPermalink: input.group,
            votes: 0,
            ts,
          }),
          tx
            .update(table.community)
            .set({
              groupProposals: sql`${table.community.groupProposals} + 1`,
            })
            .where(eq(table.community.id, community.id)),
          tx
            .update(table.group)
            .set({
              proposals: sql`${table.group.proposals} + 1`,
            })
            .where(
              and(
                eq(table.group.communityId, community.id),
                eq(table.group.id, group.id),
              ),
            ),
          tx.insert(table.storage).values({ permalink, data: input }),
          tx.insert(table.activity).values({
            communityId: community.id,
            actor: input.authorship.author,
            type: 'create_group_proposal',
            data: {
              type: 'create_group_proposal',
              community_id: community.id,
              community_permalink: group.community,
              community_name: community.name,
              group_id: group.id,
              group_permalink: input.group,
              group_name: group.name,
              group_proposal_permalink: permalink,
              group_proposal_title: input.title,
            } satisfies Activity,
            ts,
          }),
        ]),
      )

      return permalink
    }),
})

export type GroupProposalRouter = typeof groupProposalRouter
