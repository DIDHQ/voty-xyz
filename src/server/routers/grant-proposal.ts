import { TRPCError } from '@trpc/server'
import { compact, indexBy, mapValues, sortBy } from 'remeda'
import { z } from 'zod'
import { eq, inArray, sql } from 'drizzle-orm'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/basic/authorship'
import { grantProposalSchema } from '../../utils/schemas/v1/grant-proposal'
import verifyGrantProposal from '../../utils/verifiers/verify-grant-proposal'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/basic/proof'
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
import { grantSchema } from '../../utils/schemas/v1/grant'
import { GrantPhase, getGrantPhase } from '../../utils/phase'
import { table } from '@/src/utils/schema'

const schema = proved(authorized(grantProposalSchema))

const selectedGrantProposals = new Set(
  process.env.SELECTED_GRANT_PROPOSALS?.split(','),
)

export const grantProposalRouter = router({
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().optional() }))
    .output(
      schema
        .extend({
          ts: z.date(),
          selected: z.string().nullable(),
          votes: z.number(),
        })
        .nullable(),
    )
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const grantProposal = await database.query.grantProposal.findFirst({
        where: ({ permalink }, { eq }) => eq(permalink, input.permalink!),
      })

      const storage = await database.query.storage.findFirst({
        where: ({ permalink }, { eq }) => eq(permalink, input.permalink!),
      })
      return storage && grantProposal
        ? {
            ...schema.parse(storage.data),
            ts: grantProposal.ts,
            selected: grantProposal.selected,
            votes: grantProposal.votes,
          }
        : null
    }),
  groupByProposer: procedure
    .input(z.object({ grantPermalink: z.string().optional() }))
    .output(z.record(z.string(), z.boolean()))
    .query(async ({ input }) => {
      if (!input.grantPermalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const grantProposals = await database.query.grantProposal.findMany({
        where: ({ grantPermalink }, { eq }) =>
          eq(grantPermalink, input.grantPermalink!),
        columns: { proposer: true },
      })

      return mapValues(
        indexBy(grantProposals, ({ proposer }) => proposer),
        () => true,
      )
    }),
  list: procedure
    .input(
      z.object({
        grantPermalink: z.string().optional(),
        viewer: z.string().optional(),
      }),
    )
    .output(
      z.array(
        schema.extend({
          selected: z.string().nullable(),
          images: z.array(z.string()),
          permalink: z.string(),
          votes: z.number(),
          ts: z.date(),
          funding: z.string().optional(),
        }),
      ),
    )
    .query(async ({ input }) => {
      if (!input.grantPermalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const grant = grantSchema.parse(
        (
          await database.query.storage.findFirst({
            where: ({ permalink }, { eq }) =>
              eq(permalink, input.grantPermalink!),
          })
        )?.data,
      )
      if (!grant) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
      const timestamp = (
        await database.query.grant.findFirst({
          where: ({ permalink }, { eq }) =>
            eq(permalink, input.grantPermalink!),
        })
      )?.ts
      const isEnded =
        getGrantPhase(new Date(), timestamp, grant.duration) ===
        GrantPhase.ENDED

      const grantProposals = await database.query.grantProposal.findMany({
        where: ({ grantPermalink }, { eq }) =>
          eq(grantPermalink, input.grantPermalink!),
        orderBy: ({ votes, ts }, { desc }) => desc(isEnded ? votes : ts),
      })
      const storages = grantProposals.length
        ? indexBy(
            await database.query.storage.findMany({
              where: inArray(
                table.storage.permalink,
                grantProposals.map(({ permalink }) => permalink),
              ),
            }),
            ({ permalink }) => permalink,
          )
        : {}

      const data = compact(
        grantProposals
          .filter(({ permalink }) => storages[permalink])
          .map(({ permalink, selected, votes, ts }, index) => {
            try {
              const grantProposal = schema.parse(storages[permalink].data)
              return {
                ...grantProposal,
                selected,
                images: getImages(grantProposal.content),
                content: getSummary(grantProposal.content),
                permalink,
                votes,
                ts,
                funding:
                  isEnded &&
                  index < grant.funding[0][1] &&
                  (!grant.permission.selecting || selected)
                    ? grant.funding[0][0]
                    : undefined,
              }
            } catch {
              return
            }
          }),
      )

      return isEnded
        ? data
        : sortBy(
            data,
            [
              (grantProposal) =>
                selectedGrantProposals.has(
                  permalink2Id(grantProposal.permalink),
                )
                  ? 1
                  : 0,
              'desc',
            ],
            [
              // pseudo random order
              (grantProposal) =>
                grantProposal.permalink.charCodeAt(10) ^
                (input.viewer?.charCodeAt(10) || 1),
              'desc',
            ],
          )
    }),
  create: procedure
    .input(schema)
    .output(z.string())
    .mutation(async ({ input }) => {
      await verifyProof(input)
      const { grant } = await verifyGrantProposal(input)
      const { community } = await verifyGrant(grant)
      await verifyAuthorship(input.authorship, input.proof, grant.snapshots)

      await flushUploadBuffers(getAllUploadBufferKeys(input.content))
      const permalink = await uploadToArweave(input)
      const ts = new Date()

      await database.transaction(async (tx) => {
        await tx.insert(table.grantProposal).values({
          permalink,
          proposer: input.authorship.author,
          grantPermalink: input.grant,
          votes: 0,
          ts,
        })
        await tx
          .update(table.community)
          .set({
            grantProposals: sql`${table.community.grantProposals} + 1`,
          })
          .where(eq(table.community.id, community.id))
        await tx
          .update(table.grant)
          .set({
            proposals: sql`${table.grant.proposals} + 1`,
          })
          .where(eq(table.grant.permalink, input.grant))
        await tx.insert(table.storage).values({ permalink, data: input })
        await tx.insert(table.activity).values({
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
        })
      })

      return permalink
    }),
})

export type GrantProposalRouter = typeof grantProposalRouter
