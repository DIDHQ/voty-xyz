import { TRPCError } from '@trpc/server'
import { compact, last } from 'lodash-es'
import { z } from 'zod'
import dayjs from 'dayjs'

import { uploadToArweave } from '../../utils/upload'
import { database, getByPermalink } from '../../utils/database'
import { authorized } from '../../utils/schemas/authorship'
import { proposalSchema } from '../../utils/schemas/proposal'
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
import { Period } from '../../utils/period'

const schema = proved(authorized(proposalSchema))

export const proposalRouter = router({
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().optional() }))
    .output(
      schema
        .extend({
          permalink: z.string(),
          options_count: z.number().int(),
          votes: z.number().int(),
        })
        .nullable(),
    )
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const proposal = await getByPermalink(DataType.PROPOSAL, input.permalink)

      if (
        proposal &&
        (!proposal.ts_pending ||
          !proposal.ts_adding_option ||
          !proposal.ts_voting)
      ) {
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
                ts_pending: dayjs(timestamp)
                  .add(group.duration.pending * 1000)
                  .toDate(),
                ts_adding_option: dayjs(timestamp)
                  .add(group.duration.pending * 1000)
                  .add(
                    ('adding_option' in group.duration
                      ? group.duration.adding_option
                      : 0) * 1000,
                  )
                  .toDate(),
                ts_voting: dayjs(timestamp)
                  .add(group.duration.pending * 1000)
                  .add(
                    ('adding_option' in group.duration
                      ? group.duration.adding_option
                      : 0) * 1000,
                  )
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
            options_count: proposal.options_count,
            votes: proposal.votes,
          }
        : null
    }),
  list: procedure
    .input(
      z.object({
        entry: z.string().optional(),
        group: z.string().optional(),
        period: z
          .enum([
            Period.CONFIRMING,
            Period.PENDING,
            Period.PROPOSING,
            Period.VOTING,
            Period.ENDED,
          ])
          .optional(),
        cursor: z.string().optional(),
      }),
    )
    .output(
      z.object({
        data: z.array(
          schema.extend({
            permalink: z.string(),
            options_count: z.number().int(),
            votes: z.number().int(),
            ts: z.date(),
            ts_pending: z.date().nullable(),
            ts_adding_option: z.date().nullable(),
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
        input.period === Period.CONFIRMING
          ? { ts_pending: null, ts_adding_option: null, ts_voting: null }
          : input.period === Period.PENDING
          ? { ts: { lte: now }, ts_pending: { gt: now } }
          : input.period === Period.PROPOSING
          ? { ts_pending: { lte: now }, ts_adding_option: { gt: now } }
          : input.period === Period.VOTING
          ? { ts_adding_option: { lte: now }, ts_voting: { gt: now } }
          : input.period === Period.ENDED
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

      return {
        data: compact(
          proposals.map(
            ({
              data,
              permalink,
              options_count,
              votes,
              ts,
              ts_pending,
              ts_adding_option,
              ts_voting,
            }) => {
              try {
                return {
                  ...schema.parse(data),
                  permalink,
                  options_count,
                  votes,
                  ts,
                  ts_pending,
                  ts_adding_option,
                  ts_voting,
                }
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
    .input(schema)
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
            options_count: 0,
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
