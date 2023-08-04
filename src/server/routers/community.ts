import { TRPCError } from '@trpc/server'
import { compact, indexBy, last, mapValues } from 'remeda'
import { z } from 'zod'
import { and, eq, inArray, lte, notInArray, sql } from 'drizzle-orm'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/basic/authorship'
import { Community, communitySchema } from '../../utils/schemas/v1/community'
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

const schemaWithoutLogo = schema.omit({ logo: true })

const schemaListItem = schemaWithoutLogo.omit({
  links: true,
  about: true,
  authorship: true,
  proof: true,
})

const selectedCommunities = process.env.SELECTED_COMMUNITIES?.split(',') || []

type CommunityWithoutLogo = Omit<Community, 'logo'>

type CommunityListItem = Omit<Community, 'logo' | 'links' | 'about'>

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
      const [storage] = await database
        .select()
        .from(table.storage)
        .where(eq(table.storage.permalink, community.permalink))
        .limit(1)

      return storage
        ? {
            ...schema.parse(storage.data),
            permalink: storage.permalink,
          }
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
    .output(schemaWithoutLogo.nullable())
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const [storage] = await database
        .select({
          permalink: table.storage.permalink,
          data: sql<CommunityWithoutLogo>`JSON_REMOVE(${table.storage.data}, '$.logo')`,
        })
        .from(table.storage)
        .where(eq(table.storage.permalink, input.permalink))
        .limit(1)

      return storage ? schemaWithoutLogo.parse(storage.data) : null
    }),
  list: procedure
    .input(z.object({ cursor: z.date().optional() }))
    .output(
      z.object({
        data: z.array(schemaListItem.extend({ permalink: z.string() })),
        next: z.date().optional(),
      }),
    )
    .query(async ({ input }) => {
      const [pinnedCommunities, commonCommunities] = await Promise.all([
        input.cursor || !selectedCommunities.length
          ? []
          : database.query.community.findMany({
              where: inArray(table.community.id, selectedCommunities),
              orderBy: ({ ts }, { desc }) => desc(ts),
            }),
        database.query.community.findMany({
          where: and(
            ...(selectedCommunities.length
              ? [notInArray(table.community.id, selectedCommunities)]
              : []),
            ...(input.cursor ? [lte(table.community.ts, input.cursor)] : []),
          ),
          limit: 30,
          offset: input.cursor ? 1 : 0,
          orderBy: ({ ts }, { desc }) => desc(ts),
        }),
      ])
      const communities = [...pinnedCommunities, ...commonCommunities]
      const storages = communities.length
        ? indexBy(
            await database
              .select({
                permalink: table.storage.permalink,
                data: sql<CommunityListItem>`JSON_REMOVE(${table.storage.data}, '$.logo', '$.about', '$.links')`,
              })
              .from(table.storage)
              .where(
                inArray(
                  table.storage.permalink,
                  communities.map(({ permalink }) => permalink),
                ),
              ),
            ({ permalink }) => permalink,
          )
        : {}

      return {
        data: compact(
          communities
            .filter(({ permalink }) => storages[permalink])
            .map(({ permalink }) => {
              try {
                return {
                  permalink,
                  ...schemaListItem.parse(storages[permalink]!.data),
                }
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

      await database.transaction(async (tx) => {
        await tx
          .insert(table.community)
          .values({ id: input.id, permalink, ts })
          .onDuplicateKeyUpdate({ set: { permalink, ts } })
        await tx.insert(table.storage).values({ permalink, data: input })
        await tx.insert(table.activity).values({
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
        })
      })

      return permalink
    }),
})

export type CommunityRouter = typeof communityRouter
