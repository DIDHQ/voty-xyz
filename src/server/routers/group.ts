import { TRPCError } from '@trpc/server'
import { compact, keyBy } from 'lodash-es'
import { z } from 'zod'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/basic/authorship'
import { groupSchema } from '../../utils/schemas/group'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/basic/proof'
import verifySnapshot from '../../utils/verifiers/verify-snapshot'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'
import verifyGroup from '../../utils/verifiers/verify-group'

const schema = proved(authorized(groupSchema))

export const groupRouter = router({
  getById: procedure
    .input(
      z.object({
        communityId: z.string().optional(),
        id: z.string().optional(),
      }),
    )
    .output(schema.extend({ permalink: z.string() }).nullable())
    .query(async ({ input }) => {
      if (!input.communityId || !input.id) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const group = await database.group.findUnique({
        where: {
          id_communityId: { communityId: input.communityId, id: input.id },
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
  listByCommunityId: procedure
    .input(z.object({ communityId: z.string().optional() }))
    .output(z.array(schema))
    .query(async ({ input }) => {
      if (!input.communityId) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const groups = await database.group.findMany({
        where: { communityId: input.communityId },
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
      schema
        .refine(
          (group) => group.id.indexOf('.') === group.id.lastIndexOf('.'),
          'Cannot create group with SubDID',
        )
        .refine(
          (group) =>
            group.permission.proposing.operands.length === 1 &&
            group.permission.proposing.operands[0].arguments[0] ===
              group.authorship.author,
        )
        .refine((group) =>
          group.permission.voting.operands.every(
            (operand) => operand.arguments[0] === group.authorship.author,
          ),
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
        database.group.upsert({
          where: {
            id_communityId: { id: input.id, communityId: community.id },
          },
          create: {
            permalink,
            id: input.id,
            communityId: community.id,
            communityPermalink: input.community,
            ts,
          },
          update: {
            permalink,
            communityPermalink: input.community,
            ts,
          },
        }),
        database.storage.create({ data: { permalink, data: input } }),
      ])

      return permalink
    }),
  archive: procedure.input(schema).mutation(async ({ input }) => {
    await verifySnapshot(input.authorship)
    await verifyProof(input)
    await verifyAuthorship(input.authorship, input.proof)
    const { community } = await verifyGroup(input)

    await database.group.delete({
      where: {
        id_communityId: {
          communityId: community.id,
          id: input.id,
        },
      },
    })
  }),
})

export type GroupRouter = typeof groupRouter
