import { TRPCError } from '@trpc/server'
import { compact, indexBy, last, mapValues } from 'remeda'
import { z } from 'zod'

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

      const community = await database.community.findUnique({
        where: { id: input.id },
      })
      if (!community) {
        return null
      }
      const storage = await database.storage.findUnique({
        where: { permalink: community.permalink },
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

      const communities = await database.community.findMany({
        where: { id: { in: input.ids } },
        select: { id: true },
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

      const storage = await database.storage.findUnique({
        where: { permalink: input.permalink },
      })

      return storage ? schema.parse(storage.data) : null
    }),
  list: procedure
    .input(z.object({ cursor: z.string().optional() }))
    .output(z.object({ data: z.array(schema), next: z.string().optional() }))
    .query(async ({ input }) => {
      const pinnedCommunities = input.cursor
        ? []
        : await database.community.findMany({
            where: { id: { in: selectedCommunities } },
            orderBy: { ts: 'desc' },
          })
      const commonCommunities = await database.community.findMany({
        where: { id: { notIn: selectedCommunities } },
        cursor: input.cursor ? { id: input.cursor } : undefined,
        take: 30,
        skip: input.cursor ? 1 : 0,
        orderBy: { ts: 'desc' },
      })
      const communities = [...pinnedCommunities, ...commonCommunities]
      const storages = indexBy(
        await database.storage.findMany({
          where: {
            permalink: { in: communities.map(({ permalink }) => permalink) },
          },
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
        next: last(communities)?.id,
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
      const community = await database.community.findUnique({
        where: { id: input.id },
      })

      await database.$transaction([
        database.community.upsert({
          where: { id: input.id },
          create: { id: input.id, permalink, ts },
          update: { permalink, ts },
        }),
        database.storage.create({ data: { permalink, data: input } }),
        database.activity.create({
          data: {
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
          },
        }),
      ])

      return permalink
    }),
})

export type CommunityRouter = typeof communityRouter
