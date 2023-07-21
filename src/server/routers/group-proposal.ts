import { TRPCError } from '@trpc/server'
import { compact, indexBy, last } from 'remeda'
import { z } from 'zod'
import dayjs from 'dayjs'

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

const schema = proved(authorized(groupProposalSchema))

export const groupProposalRouter = router({
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().optional() }))
    .output(schema.extend({ votes: z.number() }).nullable())
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const groupProposal = await database.groupProposal.findUnique({
        where: { permalink: input.permalink },
      })

      if (
        groupProposal &&
        (!groupProposal.tsAnnouncing || !groupProposal.tsVoting)
      ) {
        try {
          const storage = await database.storage.findUnique({
            where: { permalink: groupProposal.groupPermalink },
          })
          const group = storage ? groupSchema.parse(storage.data) : null
          if (group) {
            const timestamp = await getSnapshotTimestamp(
              commonCoinTypes.AR,
              await getPermalinkSnapshot(groupProposal.permalink),
            )
            await database.groupProposal.update({
              where: { permalink: groupProposal.permalink },
              data: {
                ts: timestamp,
                tsAnnouncing: dayjs(timestamp)
                  .add(group.duration.announcing * 1000)
                  .toDate(),
                tsVoting: dayjs(timestamp)
                  .add(group.duration.announcing * 1000)
                  .add(group.duration.voting * 1000)
                  .toDate(),
              },
            })
          }
        } catch (err) {
          console.error(err)
        }
      }

      const storage = await database.storage.findUnique({
        where: { permalink: input.permalink },
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
        cursor: z.string().optional(),
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
        next: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.communityId) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const now = new Date()
      const filter =
        input.phase === GroupProposalPhase.CONFIRMING
          ? { tsAnnouncing: null, tsVoting: null }
          : input.phase === GroupProposalPhase.ANNOUNCING
          ? { ts: { lte: now }, tsAnnouncing: { gt: now } }
          : input.phase === GroupProposalPhase.VOTING
          ? { tsAnnouncing: { lte: now }, tsVoting: { gt: now } }
          : input.phase === GroupProposalPhase.ENDED
          ? { tsVoting: { lte: now } }
          : {}
      const groupProposals = await database.groupProposal.findMany({
        where: input.groupId
          ? {
              communityId: input.communityId,
              groupId: input.groupId,
              ...filter,
            }
          : { communityId: input.communityId, ...filter },
        cursor: input.cursor ? { permalink: input.cursor } : undefined,
        take: 20,
        skip: input.cursor ? 1 : 0,
        orderBy: { ts: 'desc' },
      })
      const storages = indexBy(
        await database.storage.findMany({
          where: {
            permalink: { in: groupProposals.map(({ permalink }) => permalink) },
          },
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
        next: last(groupProposals)?.permalink,
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

      await database.$transaction([
        database.groupProposal.create({
          data: {
            permalink,
            proposer: input.authorship.author,
            communityId: community.id,
            groupId: group.id,
            groupPermalink: input.group,
            votes: 0,
            ts,
          },
        }),
        database.community.update({
          where: { id: community.id },
          data: { groupProposals: { increment: 1 } },
        }),
        database.group.update({
          where: {
            id_communityId: { communityId: community.id, id: group.id },
          },
          data: { proposals: { increment: 1 } },
        }),
        database.storage.create({ data: { permalink, data: input } }),
        database.activity.create({
          data: {
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
          },
        }),
      ])

      return permalink
    }),
})

export type GroupProposalRouter = typeof groupProposalRouter
