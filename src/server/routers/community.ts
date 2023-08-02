import { TRPCError } from '@trpc/server'
import { compact, indexBy, last, mapValues } from 'remeda'
import { z } from 'zod'
import { and, inArray, lte, notInArray } from 'drizzle-orm'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/basic/authorship'
import { communitySchema } from '../../utils/schemas/v1/community'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/basic/proof'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'
import { Activity } from '../../utils/schemas/activity'
import { isSubDID } from '../../utils/did/utils'
import {
  flushUploadBuffers,
  getAllUploadBufferKeys,
} from '../../utils/upload-buffer'
import { table } from '@/src/utils/schema'

const schema = proved(authorized(communitySchema))

const selectedCommunities = process.env.SELECTED_COMMUNITIES?.split(',') || []

export const communityRouter = router({
  getById: procedure
    .input(z.object({ id: z.string().optional() }))
    .output(schema.extend({ permalink: z.string() }).nullable())
    .query(async ({ input }) => {
      if (!input.id) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const community = await database.query.community.findFirst({
        where: ({ id }, { eq }) => eq(id, input.id!),
      })
      if (!community) {
        return null
      }
      const storage = await database.query.storage.findFirst({
        where: ({ permalink }, { eq }) => eq(permalink, community.permalink),
      })

      return storage
        ? { ...schema.parse(storage.data), permalink: storage.permalink }
        : null
    }),
  checkExistences: procedure
    .input(z.object({ ids: z.array(z.string()).optional() }))
    .output(z.record(z.string(), z.boolean()))
    .query(async ({ input }) => {
      if (!input.ids?.length) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const communities = await database.query.community.findMany({
        where: inArray(table.community.id, input.ids),
        columns: { id: true },
      })

      return mapValues(
        indexBy(communities, ({ id }) => id),
        (community) => !!community,
      )
    }),
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().optional() }))
    .output(schema.nullable())
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const storage = await database.query.storage.findFirst({
        where: ({ permalink }, { eq }) => eq(permalink, input.permalink!),
      })

      return storage ? schema.parse(storage.data) : null
    }),
  list: procedure
    .input(z.object({ cursor: z.date().optional() }))
    .output(z.object({ data: z.array(schema), next: z.date().optional() }))
    .query(async ({ input }) => {
      const pinnedCommunities = input.cursor
        ? []
        : await database.query.community.findMany({
            where: inArray(table.community.id, selectedCommunities),
            orderBy: ({ ts }, { desc }) => desc(ts),
          })
      const commonCommunities = await database.query.community.findMany({
        where: input.cursor
          ? and(
              notInArray(table.community.id, selectedCommunities),
              lte(table.community.ts, input.cursor),
            )
          : notInArray(table.community.id, selectedCommunities),
        limit: 30,
        offset: input.cursor ? 1 : 0,
        orderBy: ({ ts }, { desc }) => desc(ts),
      })
      const communities = [...pinnedCommunities, ...commonCommunities]
      const storages = indexBy(
        await database.query.storage.findMany({
          where: inArray(
            table.storage.permalink,
            communities.map(({ permalink }) => permalink),
          ),
        }),
        ({ permalink }) => permalink,
      )

      return {
        data: compact(
          communities
            .filter(({ permalink }) => storages[permalink])
            .map(({ permalink }) => {
              try {
                return schema.parse(storages[permalink].data)
              } catch {
                return
              }
            }),
        ),
        next: last(communities)?.ts,
      }
    }),
  create: procedure
    .input(
      schema
        .refine(
          (community) => community.id === community.authorship.author,
          'Permission denied',
        )
        .refine(
          (community) => !isSubDID(community.id),
          'Cannot create community with SubDID',
        ),
    )
    .output(z.string())
    .mutation(async ({ input }) => {
      await verifyProof(input)
      await verifyAuthorship(input.authorship, input.proof)

      await flushUploadBuffers(getAllUploadBufferKeys(input.about))
      const permalink = await uploadToArweave(input)
      const ts = new Date()
      const community = await database.query.community.findFirst({
        where: ({ id }, { eq }) => eq(id, input.id),
      })

      await database.transaction((tx) =>
        Promise.all([
          tx
            .insert(table.community)
            .values({ id: input.id, permalink, ts })
            .onDuplicateKeyUpdate({ set: { permalink, ts } }),
          tx.insert(table.storage).values({ permalink, data: input }),
          tx.insert(table.activity).values({
            communityId: input.id,
            actor: input.authorship.author,
            type: community ? 'update_community' : 'create_community',
            data: {
              type: community ? 'update_community' : 'create_community',
              community_id: input.id,
              community_permalink: permalink,
              community_name: input.name,
            } satisfies Activity,
            ts,
          }),
        ]),
      )

      return permalink
    }),
})

export type CommunityRouter = typeof communityRouter
