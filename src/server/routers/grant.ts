import { TRPCError } from '@trpc/server'
import { compact, indexBy, last } from 'remeda'
import { z } from 'zod'
import dayjs from 'dayjs'
import { and, eq, gt, inArray, isNull, lte, sql } from 'drizzle-orm'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/basic/authorship'
import { grantSchema } from '../../utils/schemas/v1/grant'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/basic/proof'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'
import verifyGrant from '../../utils/verifiers/verify-grant'
import { GrantPhase } from '../../utils/phase'
import { commonCoinTypes } from '../../utils/constants'
import {
  getSnapshotTimestamp,
  getPermalinkSnapshot,
} from '../../utils/snapshot'
import { Activity } from '../../utils/schemas/activity'
import {
  flushUploadBuffers,
  getAllUploadBufferKeys,
} from '../../utils/upload-buffer'
import { getImages, getSummary } from '../../utils/markdown'
import { table } from '@/src/utils/schema'

const schema = proved(authorized(grantSchema))

export const grantRouter = router({
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().optional() }))
    .output(
      schema
        .extend({ proposals: z.number(), selectedProposals: z.number() })
        .nullable(),
    )
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const grant = await database.query.grant.findFirst({
        where: ({ permalink }, { eq }) => eq(permalink, input.permalink!),
      })
      const storage = await database.query.storage.findFirst({
        where: ({ permalink }, { eq }) => eq(permalink, input.permalink!),
      })

      const json =
        grant && storage
          ? {
              ...schema.parse(storage.data),
              proposals: grant.proposals,
              selectedProposals: grant.selectedProposals,
            }
          : null

      if (
        json &&
        grant &&
        (!grant.tsAnnouncing || !grant.tsProposing || !grant.tsVoting)
      ) {
        try {
          const timestamp = await getSnapshotTimestamp(
            commonCoinTypes.AR,
            await getPermalinkSnapshot(grant.permalink),
          )
          await database
            .update(table.grant)
            .set({
              ts: timestamp,
              tsAnnouncing: dayjs(timestamp)
                .add(json.duration.announcing * 1000)
                .toDate(),
              tsProposing: dayjs(timestamp)
                .add(json.duration.announcing * 1000)
                .add(json.duration.proposing * 1000)
                .toDate(),
              tsVoting: dayjs(timestamp)
                .add(json.duration.announcing * 1000)
                .add(json.duration.proposing * 1000)
                .add(json.duration.voting * 1000)
                .toDate(),
            })
            .where(eq(table.grant.permalink, grant.permalink))
        } catch (err) {
          console.error(err)
        }
      }

      return json
    }),
  listByCommunityId: procedure
    .input(
      z.object({
        communityId: z.string().optional(),
        phase: z
          .enum([
            GrantPhase.CONFIRMING,
            GrantPhase.ANNOUNCING,
            GrantPhase.PROPOSING,
            GrantPhase.VOTING,
            GrantPhase.ENDED,
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
            proposals: z.number(),
            ts: z.date(),
            tsAnnouncing: z.date().nullable(),
            tsProposing: z.date().nullable(),
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
        input.phase === GrantPhase.CONFIRMING
          ? [isNull(table.grant.tsAnnouncing), isNull(table.grant.tsVoting)]
          : input.phase === GrantPhase.ANNOUNCING
          ? [lte(table.grant.ts, now), gt(table.grant.tsAnnouncing, now)]
          : input.phase === GrantPhase.PROPOSING
          ? [
              lte(table.grant.tsAnnouncing, now),
              gt(table.grant.tsProposing, now),
            ]
          : input.phase === GrantPhase.VOTING
          ? [lte(table.grant.tsProposing, now), gt(table.grant.tsVoting, now)]
          : input.phase === GrantPhase.ENDED
          ? [lte(table.grant.tsVoting, now)]
          : []
      const grants = await database.query.grant.findMany({
        where: and(
          eq(table.grant.communityId, input.communityId),
          ...filter,
          ...(input.cursor ? [lte(table.grant.ts, input.cursor)] : []),
        ),
        limit: 20,
        offset: input.cursor ? 1 : 0,
        orderBy: ({ ts }, { desc }) => desc(ts),
      })
      const storages = grants.length
        ? indexBy(
            await database.query.storage.findMany({
              where: inArray(
                table.storage.permalink,
                grants.map(({ permalink }) => permalink),
              ),
            }),
            ({ permalink }) => permalink,
          )
        : {}

      return {
        data: compact(
          grants
            .filter(({ permalink }) => storages[permalink])
            .map(
              ({
                permalink,
                proposals,
                ts,
                tsAnnouncing,
                tsProposing,
                tsVoting,
              }) => {
                try {
                  const grant = schema.parse(storages[permalink].data)
                  return {
                    ...grant,
                    images: getImages(grant.introduction),
                    introduction: getSummary(grant.introduction),
                    permalink,
                    proposals,
                    ts,
                    tsAnnouncing,
                    tsProposing,
                    tsVoting,
                  }
                } catch {
                  return
                }
              },
            ),
        ),
        next: last(grants)?.ts,
      }
    }),
  create: procedure
    .input(
      schema
        .refine(
          (grant) =>
            grant.permission.proposing.operands.length === 1 &&
            grant.permission.proposing.operands[0].arguments[0] ===
              grant.authorship.author &&
            grant.permission.proposing.operands[0].arguments[1].length === 0,
        )
        .refine(
          (grant) =>
            grant.permission.voting.operands.length === 1 &&
            grant.permission.voting.operands[0].arguments[0] ===
              grant.authorship.author &&
            grant.permission.voting.operands[0].arguments[1].length === 0 &&
            grant.permission.voting.operands[0].arguments[2] === '1',
        )
        .refine(
          (grant) =>
            !grant.permission.selecting ||
            (grant.permission.selecting.operands.length === 1 &&
              grant.permission.selecting.operands[0].arguments[0] ===
                grant.authorship.author &&
              grant.permission.selecting.operands[0].arguments[1].length > 0),
        ),
    )
    .output(z.string())
    .mutation(async ({ input }) => {
      await verifyProof(input)
      await verifyAuthorship(input.authorship, input.proof)
      const { community } = await verifyGrant(input)

      await flushUploadBuffers(getAllUploadBufferKeys(input.introduction))
      const permalink = await uploadToArweave(input)
      const ts = new Date()

      await database.transaction(async (tx) => {
        await tx.insert(table.grant).values({
          permalink,
          communityId: community.id,
          communityPermalink: input.community,
          ts,
        })
        await tx
          .update(table.community)
          .set({
            grants: sql`${table.community.grants} + 1`,
          })
          .where(eq(table.community.id, community.id))
        await tx.insert(table.storage).values({ permalink, data: input })
        await tx.insert(table.activity).values({
          communityId: community.id,
          actor: input.authorship.author,
          type: 'create_grant',
          data: {
            type: 'create_grant',
            community_id: community.id,
            community_permalink: input.community,
            community_name: community.name,
            grant_permalink: permalink,
            grant_name: input.name,
          } satisfies Activity,
          ts,
        })
      })

      return permalink
    }),
})

export type GrantRouter = typeof grantRouter
