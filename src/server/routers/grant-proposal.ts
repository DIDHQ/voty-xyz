import { TRPCError } from '@trpc/server'
import { compact, keyBy, mapValues, orderBy } from 'lodash-es'
import { z } from 'zod'
import readingTime from 'reading-time'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/basic/authorship'
import { grantProposalSchema } from '../../utils/schemas/v1/grant-proposal'
import verifyGrantProposal from '../../utils/verifiers/verify-grant-proposal'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/basic/proof'
import verifySnapshot from '../../utils/verifiers/verify-snapshot'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'
import verifyGrant from '../../utils/verifiers/verify-grant'
import { Activity } from '../../utils/schemas/activity'
import {
  flushUploadBuffers,
  getAllUploadBufferKeys,
} from '../../utils/upload-buffer'
import { getImages, getSummary } from '../../utils/markdown'
import { permalink2Id } from '../../utils/permalink'

const schema = proved(authorized(grantProposalSchema))

const selectedGrantProposals = new Set(
  process.env.SELECTED_GRANT_PROPOSALS?.split(','),
)

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

      const storage = await database.storage.findUnique({
        where: { permalink: input.permalink },
      })
      return storage && grantProposal
        ? { ...schema.parse(storage.data), votes: grantProposal.votes }
        : null
    }),
  groupByProposer: procedure
    .input(z.object({ grantPermalink: z.string().optional() }))
    .output(z.record(z.string(), z.boolean()))
    .query(async ({ input }) => {
      if (!input.grantPermalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const grantProposals = await database.grantProposal.findMany({
        where: { grantPermalink: input.grantPermalink },
        select: { proposer: true },
      })

      return mapValues(
        keyBy(grantProposals, ({ proposer }) => proposer),
        () => true,
      )
    }),
  list: procedure
    .input(
      z.object({
        grantPermalink: z.string().optional(),
      }),
    )
    .output(
      z.array(
        schema.extend({
          images: z.array(z.string()),
          permalink: z.string(),
          votes: z.number(),
          readingTime: z.number(),
          ts: z.date(),
        }),
      ),
    )
    .query(async ({ input }) => {
      if (!input.grantPermalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const grant = await database.grant.findUnique({
        where: { permalink: input.grantPermalink },
      })
      if (!grant) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
      const isEnded = !!grant.tsVoting && Date.now() > grant.tsVoting.getTime()

      const grantProposals = await database.grantProposal.findMany({
        where: { grantPermalink: input.grantPermalink },
        orderBy: isEnded ? { votes: 'desc' } : { ts: 'desc' },
      })
      const storages = keyBy(
        await database.storage.findMany({
          where: {
            permalink: { in: grantProposals.map(({ permalink }) => permalink) },
          },
        }),
        ({ permalink }) => permalink,
      )

      return compact(
        orderBy(
          grantProposals,
          (grantProposal) =>
            selectedGrantProposals.has(permalink2Id(grantProposal.permalink))
              ? 1
              : 0,
          'desc',
        )
          .filter(({ permalink }) => storages[permalink])
          .map(({ permalink, votes, ts }) => {
            try {
              const grantProposal = schema.parse(storages[permalink].data)
              return {
                ...grantProposal,
                images: getImages(grantProposal.content),
                content: getSummary(grantProposal.content),
                readingTime: readingTime(grantProposal.content).time,
                permalink,
                votes,
                ts,
              }
            } catch {
              return
            }
          }),
      )
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

      await flushUploadBuffers(getAllUploadBufferKeys(input.content))
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
        database.activity.create({
          data: {
            communityId: community.id,
            actor: input.authorship.author,
            type: 'create_grant_proposal',
            data: {
              type: 'create_grant_proposal',
              community_id: community.id,
              community_permalink: grant.community,
              community_name: community.name,
              grant_permalink: input.grant,
              grant_name: grant.name,
              grant_proposal_permalink: permalink,
              grant_proposal_title: input.title,
            } satisfies Activity,
            ts,
          },
        }),
      ])

      return permalink
    }),
})

export type GrantProposalRouter = typeof grantProposalRouter
