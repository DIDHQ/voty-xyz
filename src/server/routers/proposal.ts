import { TRPCError } from '@trpc/server'
import { compact, keyBy, last, uniq } from 'lodash-es'
import { z } from 'zod'
import dayjs from 'dayjs'

import { uploadToArweave } from '../../utils/upload'
import { database, getByPermalink } from '../../utils/database'
import { authorized } from '../../utils/schemas/authorship'
import {
  proposalSchema,
  proposalSchemaRefine,
} from '../../utils/schemas/proposal'
import verifyProposal from '../../utils/verifiers/verify-proposal'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/proof'
import { commonCoinTypes, DataType } from '../../utils/constants'
import verifySnapshot from '../../utils/verifiers/verify-snapshot'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'
import {
  getPermalinkSnapshot,
  getSnapshotTimestamp,
} from '../../utils/snapshot'
import { Phase } from '../../utils/phase'
import { communitySchema } from '../../utils/schemas/community'

const schema = proved(authorized(proposalSchema))

export const proposalRouter = router({
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().optional() }))
    .output(
      schema
        .extend({
          permalink: z.string(),
          votes: z.number().int(),
        })
        .nullable(),
    )
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const proposal = await getByPermalink(DataType.PROPOSAL, input.permalink)

      if (proposal && (!proposal.ts_announcing || !proposal.ts_voting)) {
        try {
          const community = await getByPermalink(
            DataType.COMMUNITY,
            proposal.community,
          )
          const group = community?.data.groups?.find(
            (w) => w.id === proposal.group,
          )
          if (group) {
            const timestamp = await getSnapshotTimestamp(
              commonCoinTypes.AR,
              await getPermalinkSnapshot(proposal.permalink),
            )
            await database.proposal.update({
              where: { permalink: proposal.permalink },
              data: {
                ts: timestamp,
                ts_announcing: dayjs(timestamp)
                  .add(group.duration.announcing * 1000)
                  .toDate(),
                ts_voting: dayjs(timestamp)
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

      return proposal
        ? {
            ...proposal.data,
            permalink: proposal.permalink,
            votes: proposal.votes,
          }
        : null
    }),
  list: procedure
    .input(
      z.object({
        entry: z.string().optional(),
        group: z.string().optional(),
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
            votes: z.number().int(),
            ts: z.date(),
            ts_announcing: z.date().nullable(),
            ts_voting: z.date().nullable(),
          }),
        ),
        next: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.entry) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const now = new Date()
      const filter =
        input.phase === Phase.CONFIRMING
          ? { ts_announcing: null, ts_voting: null }
          : input.phase === Phase.ANNOUNCING
          ? { ts: { lte: now }, ts_announcing: { gt: now } }
          : input.phase === Phase.VOTING
          ? { ts_announcing: { lte: now }, ts_voting: { gt: now } }
          : input.phase === Phase.ENDED
          ? { ts_voting: { lte: now } }
          : {}
      const proposals = await database.proposal.findMany({
        where: input.group
          ? { entry: input.entry, group: input.group, ...filter }
          : { entry: input.entry, ...filter },
        cursor: input.cursor ? { permalink: input.cursor } : undefined,
        take: 20,
        skip: input.cursor ? 1 : 0,
        orderBy: { ts: 'desc' },
      })
      const communities = keyBy(
        await database.community.findMany({
          where: {
            permalink: {
              in: uniq(proposals.map(({ community }) => community)),
            },
          },
        }),
        ({ permalink }) => permalink,
      )

      return {
        data: compact(
          proposals.map(
            ({
              community,
              group,
              data,
              permalink,
              votes,
              ts,
              ts_announcing,
              ts_voting,
            }) => {
              try {
                const g = communitySchema
                  .parse(communities[community].data)
                  .groups?.find(({ id }) => group === id)
                return g
                  ? {
                      ...schema.parse(data),
                      permalink,
                      votes,
                      ts,
                      ts_announcing,
                      ts_voting,
                    }
                  : undefined
              } catch {
                return
              }
            },
          ),
        ),
        next: last(proposals)?.permalink,
      }
    }),
  create: procedure
    .input(schema.refine(proposalSchemaRefine))
    .output(z.string())
    .mutation(async ({ input }) => {
      await verifySnapshot(input.authorship)
      await verifyProof(input)
      await verifyAuthorship(input.authorship, input.proof)
      const { community } = await verifyProposal(input)

      const entry = await database.entry.findFirst({
        where: { did: community.authorship.author },
        orderBy: { ts: 'desc' },
      })
      if (entry && entry.community !== input.community) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
      const permalink = await uploadToArweave(input)
      const ts = new Date()

      await database.$transaction([
        database.proposal.create({
          data: {
            permalink,
            author: input.authorship.author,
            entry: community.authorship.author,
            community: input.community,
            group: input.group,
            data: input,
            votes: 0,
            ts,
          },
        }),
        database.entry.update({
          where: { did: community.authorship.author },
          data: { proposals: { increment: 1 } },
        }),
      ])

      return permalink
    }),
})

export type ProposalRouter = typeof proposalRouter
