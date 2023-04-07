import { TRPCError } from '@trpc/server'
import { compact, keyBy, last, mapValues } from 'lodash-es'
import { z } from 'zod'

import { uploadToArweave } from '../../utils/upload'
import { database, getByPermalink } from '../../utils/database'
import { authorized } from '../../utils/schemas/authorship'
import { communitySchema } from '../../utils/schemas/community'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/proof'
import { DataType } from '../../utils/constants'
import verifySnapshot from '../../utils/verifiers/verify-snapshot'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'

const schema = proved(authorized(communitySchema))

export const communityRouter = router({
  getByEntry: procedure
    .input(z.object({ entry: z.string().optional() }))
    .output(schema.extend({ permalink: z.string() }).nullable())
    .query(async ({ input }) => {
      if (!input.entry) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const community = await database.community.findUnique({
        where: { entry: input.entry },
      })

      return community
        ? {
            ...schema.parse(community.data),
            permalink: community.permalink,
          }
        : null
    }),
  checkExistences: procedure
    .input(z.object({ entries: z.array(z.string()).optional() }))
    .output(z.record(z.string(), z.boolean()))
    .query(async ({ input }) => {
      if (!input.entries?.length) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const communities = await database.community.findMany({
        where: { entry: { in: input.entries } },
        select: { entry: true },
      })

      return mapValues(
        keyBy(communities, ({ entry }) => entry),
        (entry) => !!entry,
      )
    }),
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().optional() }))
    .output(schema.nullable())
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const community = await getByPermalink(
        DataType.COMMUNITY,
        input.permalink,
      )

      return community ? community.data : null
    }),
  list: procedure
    .input(z.object({ cursor: z.string().optional() }))
    .output(
      z.object({
        data: z.array(schema),
        next: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const communities = await database.community.findMany({
        cursor: input.cursor ? { entry: input.cursor } : undefined,
        take: 30,
        skip: input.cursor ? 1 : 0,
        orderBy: { ts: 'desc' },
      })

      return {
        data: compact(
          communities.map((community) => {
            try {
              return schema.parse(community)
            } catch {
              return
            }
          }),
        ),
        next: last(communities)?.entry,
      }
    }),
  upsert: procedure
    .input(
      schema
        .refine(
          (community) =>
            !community.groups ||
            community.groups.every(
              (group) =>
                group.permission.proposing.operands.length === 1 &&
                group.permission.proposing.operands[0].arguments[0] ===
                  community.authorship.author &&
                group.permission.proposing.operands[0].arguments[1].length > 0,
            ),
          { message: 'Invalid proposing permission' },
        )
        .refine(
          (community) =>
            !community.groups ||
            community.groups.every((group) =>
              group.permission.voting.operands.every((operand) => {
                return operand.arguments[0] === community.authorship.author
              }),
            ),
          { message: 'Invalid voting permission' },
        ),
    )
    .output(z.string())
    .mutation(async ({ input }) => {
      if (
        input.authorship.author.indexOf('.') !==
        input.authorship.author.lastIndexOf('.')
      ) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
      await verifySnapshot(input.authorship)
      await verifyProof(input)
      await verifyAuthorship(input.authorship, input.proof)

      const permalink = await uploadToArweave(input)
      const ts = new Date()

      await database.community.upsert({
        where: { entry: input.authorship.author },
        create: {
          entry: input.authorship.author,
          permalink,
          ts,
          data: input,
          subscribers: 0,
          proposals: 0,
          votes: 0,
        },
        update: {
          permalink,
          ts,
          data: input,
        },
      })

      return permalink
    }),
})

export type CommunityRouter = typeof communityRouter
