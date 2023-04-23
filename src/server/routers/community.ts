import { TRPCError } from '@trpc/server'
import { compact, keyBy, last, mapValues } from 'lodash-es'
import { z } from 'zod'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/authorship'
import { communitySchema } from '../../utils/schemas/community'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/proof'
import verifySnapshot from '../../utils/verifiers/verify-snapshot'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'

const schema = proved(authorized(communitySchema))

export const communityRouter = router({
  getById: procedure
    .input(z.object({ id: z.string().optional() }))
    .output(schema.nullable())
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

      return storage ? schema.parse(storage) : null
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
        keyBy(communities, ({ id }) => id),
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

      return storage ? schema.parse(storage) : null
    }),
  list: procedure
    .input(z.object({ cursor: z.string().optional() }))
    .output(z.object({ data: z.array(schema), next: z.string().optional() }))
    .query(async ({ input }) => {
      const communities = await database.community.findMany({
        cursor: input.cursor ? { id: input.cursor } : undefined,
        take: 30,
        skip: input.cursor ? 1 : 0,
        orderBy: { ts: 'desc' },
      })
      const storages = keyBy(
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
          (community) =>
            community.id.indexOf('.') === community.id.lastIndexOf('.'),
          'Cannot create community with SubDID',
        ),
    )
    .output(z.string())
    .mutation(async ({ input }) => {
      await verifySnapshot(input.authorship)
      await verifyProof(input)
      await verifyAuthorship(input.authorship, input.proof)

      const permalink = await uploadToArweave(input)
      const ts = new Date()

      await database.$transaction([
        database.community.create({ data: { id: input.id, permalink, ts } }),
        database.storage.create({ data: { permalink, data: input } }),
      ])

      return permalink
    }),
})

export type CommunityRouter = typeof communityRouter
