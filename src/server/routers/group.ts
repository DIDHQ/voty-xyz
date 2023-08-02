import { TRPCError } from '@trpc/server'
import { compact, indexBy } from 'remeda'
import { z } from 'zod'
import { and, eq, inArray } from 'drizzle-orm'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/basic/authorship'
import { groupSchema } from '../../utils/schemas/v1/group'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/basic/proof'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'
import verifyGroup from '../../utils/verifiers/verify-group'
import { Activity } from '../../utils/schemas/activity'
import { table } from '@/src/utils/schema'

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

      const group = await database.query.group.findFirst({
        where: ({ communityId, id }, { and, eq }) =>
          and(eq(communityId, input.communityId!), eq(id, input.id!)),
      })
      if (!group) {
        return null
      }
      const storage = await database.query.storage.findFirst({
        where: ({ permalink }, { eq }) => eq(permalink, group.permalink),
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

      const storage = await database.query.storage.findFirst({
        where: ({ permalink }, { eq }) => eq(permalink, input.permalink!),
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

      const groups = await database.query.group.findMany({
        where: ({ communityId }, { eq }) => eq(communityId, input.communityId!),
        orderBy: ({ id }, { desc }) => desc(id),
      })
      const storages = groups.length
        ? indexBy(
            await database.query.storage.findMany({
              where: inArray(
                table.storage.permalink,
                groups.map(({ permalink }) => permalink),
              ),
            }),
            ({ permalink }) => permalink,
          )
        : {}

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
              group.authorship.author &&
            group.permission.proposing.operands[0].arguments[1].length > 0,
        )
        .refine((group) =>
          group.permission.voting.operands.every(
            (operand) => operand.arguments[0] === group.authorship.author,
          ),
        ),
    )
    .output(z.string())
    .mutation(async ({ input }) => {
      await verifyProof(input)
      await verifyAuthorship(input.authorship, input.proof)
      const { community } = await verifyGroup(input)

      const permalink = await uploadToArweave(input)
      const ts = new Date()
      const group = await database.query.group.findFirst({
        where: ({ id, communityId }, { and, eq }) =>
          and(eq(id, input.id), eq(communityId, community.id)),
      })

      await database.transaction(async (tx) => {
        await tx
          .insert(table.group)
          .values({
            permalink,
            id: input.id,
            communityId: community.id,
            communityPermalink: input.community,
            ts,
          })
          .onDuplicateKeyUpdate({
            set: { permalink, communityPermalink: input.community, ts },
          })
        await tx.insert(table.storage).values({ permalink, data: input })
        await tx.insert(table.activity).values({
          communityId: community.id,
          actor: input.authorship.author,
          type: group ? 'update_group' : 'create_group',
          data: {
            type: group ? 'update_group' : 'create_group',
            community_id: community.id,
            community_permalink: input.community,
            community_name: community.name,
            group_id: input.id,
            group_permalink: permalink,
            group_name: input.name,
          } satisfies Activity,
          ts,
        })
      })

      return permalink
    }),
  archive: procedure.input(schema).mutation(async ({ input }) => {
    await verifyProof(input)
    await verifyAuthorship(input.authorship, input.proof)
    const { community } = await verifyGroup(input)

    const group = await database.query.group.findFirst({
      where: ({ id, communityId }, { and, eq }) =>
        and(eq(id, input.id), eq(communityId, community.id)),
    })
    if (!group) {
      return
    }

    const ts = new Date()

    await database.transaction(async (tx) => {
      await tx
        .delete(table.group)
        .where(
          and(
            eq(table.group.communityId, community.id),
            eq(table.group.id, input.id),
          ),
        )
      await tx.insert(table.activity).values({
        communityId: community.id,
        actor: input.authorship.author,
        type: 'delete_group',
        data: {
          type: 'delete_group',
          community_id: community.id,
          community_permalink: input.community,
          community_name: community.name,
          group_id: input.id,
          group_permalink: group.permalink,
          group_name: input.name,
        } satisfies Activity,
        ts,
      })
    })
  }),
})

export type GroupRouter = typeof groupRouter
