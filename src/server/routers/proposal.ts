import { TRPCError } from '@trpc/server'
import { compact, keyBy, last } from 'lodash-es'
import { z } from 'zod'
import dayjs from 'dayjs'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/authorship'
import { proposalSchema } from '../../utils/schemas/proposal'
import verifyProposal from '../../utils/verifiers/verify-proposal'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/proof'
import { commonCoinTypes } from '../../utils/constants'
import verifySnapshot from '../../utils/verifiers/verify-snapshot'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'
import {
  getPermalinkSnapshot,
  getSnapshotTimestamp,
} from '../../utils/snapshot'
import { Phase } from '../../utils/phase'
import { groupSchema } from '../../utils/schemas/group'
import verifyGroup from '../../utils/verifiers/verify-group'

const schema = proved(authorized(proposalSchema))

export const proposalRouter = router({
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().optional() }))
    .output(schema.extend({ votes: z.number() }).nullable())
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const proposal = await database.proposal.findUnique({
        where: { permalink: input.permalink },
      })

      if (proposal && (!proposal.ts_pending || !proposal.ts_voting)) {
        try {
          const storage = await database.storage.findUnique({
            where: { permalink: proposal.group_permalink },
          })
          const group = storage ? groupSchema.parse(storage.data) : null
          if (group) {
            const timestamp = await getSnapshotTimestamp(
              commonCoinTypes.AR,
              await getPermalinkSnapshot(proposal.permalink),
            )
            await database.proposal.update({
              where: { permalink: proposal.permalink },
              data: {
                ts: timestamp,
                ts_pending: dayjs(timestamp)
                  .add(group.duration.pending * 1000)
                  .toDate(),
                ts_voting: dayjs(timestamp)
                  .add(group.duration.pending * 1000)
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
      return storage && proposal
        ? { ...schema.parse(storage.data), votes: proposal.votes }
        : null
    }),
  list: procedure
    .input(
      z.object({
        community_id: z.string().optional(),
        group_id: z.string().optional(),
        phase: z
          .enum([Phase.CONFIRMING, Phase.ANNOUNCING, Phase.VOTING, Phase.ENDED])
          .optional(),
        cursor: z.string().optional(),
      }),
    )
    .output(
      z.object({
        data: z.array(
          schema.extend({
            permalink: z.string(),
            votes: z.number(),
            ts: z.date(),
            ts_pending: z.date().nullable(),
            ts_voting: z.date().nullable(),
          }),
        ),
        next: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.community_id) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const now = new Date()
      const filter =
        input.phase === Phase.CONFIRMING
          ? { ts_pending: null, ts_voting: null }
          : input.phase === Phase.ANNOUNCING
          ? { ts: { lte: now }, ts_pending: { gt: now } }
          : input.phase === Phase.VOTING
          ? { ts_pending: { lte: now }, ts_voting: { gt: now } }
          : input.phase === Phase.ENDED
          ? { ts_voting: { lte: now } }
          : {}
      const proposals = await database.proposal.findMany({
        where: input.group_id
          ? {
              community_id: input.community_id,
              group_id: input.group_id,
              ...filter,
            }
          : { community_id: input.community_id, ...filter },
        cursor: input.cursor ? { permalink: input.cursor } : undefined,
        take: 20,
        skip: input.cursor ? 1 : 0,
        orderBy: { ts: 'desc' },
      })
      const storages = keyBy(
        await database.storage.findMany({
          where: {
            permalink: { in: proposals.map(({ permalink }) => permalink) },
          },
        }),
        ({ permalink }) => permalink,
      )

      return {
        data: compact(
          proposals
            .filter(({ permalink }) => storages[permalink])
            .map(({ permalink, votes, ts, ts_pending, ts_voting }) => {
              try {
                return {
                  ...schema.parse(storages[permalink].data),
                  permalink,
                  votes,
                  ts,
                  ts_pending,
                  ts_voting,
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
      await verifyProof(input)
      await verifyAuthorship(input.authorship, input.proof)
      const { group } = await verifyProposal(input)
      const { community } = await verifyGroup(group)

      const permalink = await uploadToArweave(input)
      const ts = new Date()

      await database.$transaction([
        database.proposal.create({
          data: {
            permalink,
            proposer: input.authorship.author,
            community_id: community.id,
            group_id: group.id,
            group_permalink: input.group,
            votes: 0,
            ts,
          },
        }),
        database.community.update({
          where: { id: community.id },
          data: { proposals: { increment: 1 } },
        }),
        database.group.update({
          where: {
            id_community_id: { community_id: community.id, id: group.id },
          },
          data: { proposals: { increment: 1 } },
        }),
        database.storage.create({ data: { permalink, data: input } }),
      ])

      return permalink
    }),
})

export type ProposalRouter = typeof proposalRouter
