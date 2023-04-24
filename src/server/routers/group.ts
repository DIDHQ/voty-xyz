import { TRPCError } from '@trpc/server'
import { compact, keyBy } from 'lodash-es'
import { z } from 'zod'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/authorship'
import { groupSchema } from '../../utils/schemas/group'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/proof'
import verifySnapshot from '../../utils/verifiers/verify-snapshot'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'
import verifyGroup from '../../utils/verifiers/verify-group'

const schema = proved(authorized(groupSchema))

export const groupRouter = router({
  getById: procedure
    .input(
      z.object({
        community_id: z.string().optional(),
        id: z.string().optional(),
      }),
    )
    .output(schema.extend({ permalink: z.string() }).nullable())
    .query(async ({ input }) => {
      if (!input.community_id || !input.id) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const group = await database.group.findUnique({
        where: {
          id_community_id: { community_id: input.community_id, id: input.id },
        },
      })
      if (!group) {
        return null
      }
      const storage = await database.storage.findUnique({
        where: { permalink: group.permalink },
      })

      return storage
        ? { ...schema.parse(storage.data), permalink: storage.permalink }
        : null
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
  listByCommunity: procedure
    .input(z.object({ community_id: z.string().optional() }))
    .output(z.array(schema))
    .query(async ({ input }) => {
      if (!input.community_id) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const groups = await database.group.findMany({
        where: { community_id: input.community_id },
        orderBy: { id: 'desc' },
      })
      const storages = keyBy(
        await database.storage.findMany({
          where: {
            permalink: { in: groups.map(({ permalink }) => permalink) },
          },
        }),
        ({ permalink }) => permalink,
      )

      return compact(
        groups
          .filter(({ permalink }) => storages[permalink])
          .map(({ permalink }) => {
            try {
              return schema.parse(storages[permalink].data)
            } catch {
              return
            }
          }),
      )
    }),
  create: procedure
    .input(
      schema.refine(
        (group) => group.id.indexOf('.') === group.id.lastIndexOf('.'),
        'Cannot create group with SubDID',
      ),
    )
    .output(z.string())
    .mutation(async ({ input }) => {
      await verifySnapshot(input.authorship)
      await verifyProof(input)
      await verifyAuthorship(input.authorship, input.proof)
      const { community } = await verifyGroup(input)

      const permalink = await uploadToArweave(input)
      const ts = new Date()

      await database.$transaction([
        database.group.create({
          data: {
            id: input.id,
            permalink,
            community_id: community.id,
            community_permalink: input.community,
            ts,
          },
        }),
        database.storage.create({ data: { permalink, data: input } }),
      ])

      return permalink
    }),
  archive: procedure
    .input(
      schema
        .refine(
          (group) => group.id === group.authorship.author,
          'Permission denied',
        )
        .refine(
          (group) => group.id.indexOf('.') === group.id.lastIndexOf('.'),
          'Cannot create group with SubDID',
        ),
    )
    .mutation(async ({ input }) => {
      await verifySnapshot(input.authorship)
      await verifyProof(input)
      await verifyAuthorship(input.authorship, input.proof)
      const { community } = await verifyGroup(input)

      await database.group.delete({
        where: {
          id_community_id: {
            community_id: community.id,
            id: input.id,
          },
        },
      })
    }),
})

export type GroupRouter = typeof groupRouter
