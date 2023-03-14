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
      schema.extend({ permalink: z.string(), votes: z.number() }).nullable(),
    )
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const proposal = await getByPermalink(DataType.PROPOSAL, input.permalink)

      if (proposal && !proposal.ts_pending && !proposal.ts_voting) {
        try {
          const community = await getByPermalink(
            DataType.COMMUNITY,
            proposal.community,
          )
          const workgroup = community?.data.workgroups?.find(
            (w) => w.id === proposal.group,
          )
          if (workgroup) {
            const timestamp = await getSnapshotTimestamp(
              commonCoinTypes.AR,
              await getPermalinkSnapshot(proposal.permalink),
            )
            await database.proposal.update({
              where: { permalink: proposal.permalink },
              data: {
                ts: timestamp,
                ts_pending: dayjs(timestamp)
                  .add(workgroup.duration.announcement * 1000)
                  .toDate(),
                ts_voting: dayjs(timestamp)
                  .add(workgroup.duration.announcement * 1000)
                  .add(workgroup.duration.voting * 1000)
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
        workgroup: z.string().optional(),
        period: z
          .enum([
            Period.CONFIRMING,
            Period.PENDING,
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
      if (!input.entry) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const now = new Date()
      const filter =
        input.period === Period.CONFIRMING
          ? { ts_pending: null, ts_voting: null }
          : input.period === Period.PENDING
          ? { ts: { lte: now }, ts_pending: { gt: now } }
          : input.period === Period.VOTING
          ? { ts_pending: { lte: now }, ts_voting: { gt: now } }
          : input.period === Period.ENDED
          ? { ts_voting: { lte: now } }
          : {}
      const proposals = await database.proposal.findMany({
        where: input.workgroup
          ? { entry: input.entry, group: input.workgroup, ...filter }
          : { entry: input.entry, ...filter },
        cursor: input.cursor ? { permalink: input.cursor } : undefined,
        take: 20,
        skip: input.cursor ? 1 : 0,
        orderBy: { ts: 'desc' },
      })

      return {
        data: compact(
          proposals.map(
            ({ data, permalink, votes, ts, ts_pending, ts_voting }) => {
              try {
                return {
                  ...schema.parse(data),
                  permalink,
                  votes,
                  ts,
                  ts_pending,
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
      const { community, workgroup } = await verifyProposal(input)

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
            group: input.workgroup,
            data: input,
            votes: 0,
            ts,
            ts_pending: dayjs(ts)
              .add(workgroup.duration.announcement * 1000)
              .toDate(),
            ts_voting: dayjs(ts)
              .add(workgroup.duration.announcement * 1000)
              .add(workgroup.duration.voting * 1000)
              .toDate(),
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
