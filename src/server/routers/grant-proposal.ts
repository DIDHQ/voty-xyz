import { TRPCError } from '@trpc/server'
import { compact, keyBy, last } from 'lodash-es'
import { z } from 'zod'
import dayjs from 'dayjs'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/authorship'
import { grantProposalSchema } from '../../utils/schemas/grant-proposal'
import verifyGrantProposal from '../../utils/verifiers/verify-grant-proposal'
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
import { grantSchema } from '../../utils/schemas/grant'
import verifyGrant from '../../utils/verifiers/verify-grant'

const schema = proved(authorized(grantProposalSchema))

export const grantProposalRouter = router({
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().optional() }))
    .output(schema.extend({ votes: z.number() }).nullable())
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const grantProposal = await database.grantProposal.findUnique({
        where: { permalink: input.permalink },
      })

      if (
        grantProposal &&
        (!grantProposal.tsPending || !grantProposal.tsVoting)
      ) {
        try {
          const storage = await database.storage.findUnique({
            where: { permalink: grantProposal.grantPermalink },
          })
          const grant = storage ? grantSchema.parse(storage.data) : null
          if (grant) {
            const timestamp = await getSnapshotTimestamp(
              commonCoinTypes.AR,
              await getPermalinkSnapshot(grantProposal.permalink),
            )
            await database.grantProposal.update({
              where: { permalink: grantProposal.permalink },
              data: {
                ts: timestamp,
                tsPending: dayjs(timestamp)
                  .add(grant.duration.pending * 1000)
                  .toDate(),
                tsVoting: dayjs(timestamp)
                  .add(grant.duration.pending * 1000)
                  .add(grant.duration.voting * 1000)
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
      return storage && grantProposal
        ? { ...schema.parse(storage.data), votes: grantProposal.votes }
        : null
    }),
  list: procedure
    .input(
      z.object({
        grantPermalink: z.string().optional(),
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
            tsPending: z.date().nullable(),
            tsVoting: z.date().nullable(),
          }),
        ),
        next: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.grantPermalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const now = new Date()
      const filter =
        input.phase === Phase.CONFIRMING
          ? { tsPending: null, tsVoting: null }
          : input.phase === Phase.ANNOUNCING
          ? { ts: { lte: now }, tsPending: { gt: now } }
          : input.phase === Phase.VOTING
          ? { tsPending: { lte: now }, tsVoting: { gt: now } }
          : input.phase === Phase.ENDED
          ? { tsVoting: { lte: now } }
          : {}
      const grantProposals = await database.grantProposal.findMany({
        where: { grantPermalink: input.grantPermalink, ...filter },
        cursor: input.cursor ? { permalink: input.cursor } : undefined,
        take: 20,
        skip: input.cursor ? 1 : 0,
        orderBy: { ts: 'desc' },
      })
      const storages = keyBy(
        await database.storage.findMany({
          where: {
            permalink: { in: grantProposals.map(({ permalink }) => permalink) },
          },
        }),
        ({ permalink }) => permalink,
      )

      return {
        data: compact(
          grantProposals
            .filter(({ permalink }) => storages[permalink])
            .map(({ permalink, votes, ts, tsPending, tsVoting }) => {
              try {
                return {
                  ...schema.parse(storages[permalink].data),
                  permalink,
                  votes,
                  ts,
                  tsPending,
                  tsVoting,
                }
              } catch {
                return
              }
            }),
        ),
        next: last(grantProposals)?.permalink,
      }
    }),
  create: procedure
    .input(schema)
    .output(z.string())
    .mutation(async ({ input }) => {
      await verifySnapshot(input.authorship)
      await verifyProof(input)
      await verifyAuthorship(input.authorship, input.proof)
      const { grant } = await verifyGrantProposal(input)
      const { community } = await verifyGrant(grant)

      const permalink = await uploadToArweave(input)
      const ts = new Date()

      await database.$transaction([
        database.grantProposal.create({
          data: {
            permalink,
            proposer: input.authorship.author,
            grantPermalink: input.grant,
            votes: 0,
            ts,
          },
        }),
        database.community.update({
          where: { id: community.id },
          data: { grantProposals: { increment: 1 } },
        }),
        database.grant.update({
          where: { permalink: input.grant },
          data: { proposals: { increment: 1 } },
        }),
        database.storage.create({ data: { permalink, data: input } }),
      ])

      return permalink
    }),
})

export type GrantProposalRouter = typeof grantProposalRouter
