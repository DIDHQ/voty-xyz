import { TRPCError } from '@trpc/server'
import { compact, last } from 'lodash-es'
import { z } from 'zod'

import { uploadToArweave } from '../../utils/upload'
import { database, getByPermalink, mapByPermalinks } from '../../utils/database'
import { authorized } from '../../utils/schemas/authorship'
import { communitySchema } from '../../utils/schemas/community'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/proof'
import { DataType } from '../../utils/constants'
import verifySnapshot from '../../utils/verifiers/verify-snapshot'
import verifyAuthorshipProof from '../../utils/verifiers/verify-authorship-proof'

const schema = proved(authorized(communitySchema))

const entrySchema = z.object({
  did: z.string(),
  ts: z.string(),
  community: z.string(),
  subscribers: z.number(),
  proposals: z.number(),
  votes: z.number(),
})

export const communityRouter = router({
  getByEntry: procedure
    .input(z.object({ entry: z.string().optional() }))
    .output(schema.extend({ entry: entrySchema }).nullable())
    .query(async ({ input }) => {
      if (!input.entry) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const entry = await database.entry.findUnique({
        where: { did: input.entry },
      })
      if (!entry) {
        return null
      }
      const community = await getByPermalink(
        DataType.COMMUNITY,
        entry.community,
      )

      return community
        ? { ...community.data, entry: { ...entry, ts: entry.ts.toString() } }
        : null
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
        data: z.array(schema.extend({ entry: entrySchema })),
        next: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const entries = await database.entry.findMany({
        cursor: input.cursor ? { did: input.cursor } : undefined,
        take: 30,
        skip: input.cursor ? 1 : 0,
        orderBy: { ts: 'desc' },
      })
      const communities = await mapByPermalinks(
        DataType.COMMUNITY,
        entries.map(({ community }) => community),
      )

      return {
        data: compact(
          entries
            .filter(({ community }) => communities[community])
            .map((entry) => {
              try {
                return {
                  ...communities[entry.community].data,
                  entry: { ...entry, ts: entry.ts.toString() },
                }
              } catch {
                return
              }
            }),
        ),
        next: last(entries)?.did,
      }
    }),
  create: procedure
    .input(
      schema
        .refine(
          (community) =>
            !community.workgroups ||
            community.workgroups.every((workgroup) =>
              workgroup.permission.proposing.operands.every((operand) => {
                return (
                  operand.function === 'prefixes_dot_suffix_exact_match' &&
                  (operand.arguments[0] === 'bit' ||
                    operand.arguments[0] === community.authorship.author)
                )
              }),
            ),
          { message: 'invalid proposing permission' },
        )
        .refine(
          (community) =>
            !community.workgroups ||
            community.workgroups.every((workgroup) =>
              workgroup.permission.voting.operands.every((operand) => {
                return (
                  operand.function === 'prefixes_dot_suffix_fixed_power' &&
                  (operand.arguments[0] === 'bit' ||
                    operand.arguments[0] === community.authorship.author)
                )
              }),
            ),
          { message: 'invalid voting permission' },
        ),
    )
    .output(z.string())
    .mutation(async ({ input }) => {
      await verifySnapshot(input.authorship)
      await verifyAuthorshipProof(input)
      const permalink = await uploadToArweave(input)
      const ts = new Date()

      await database.$transaction([
        database.community.create({
          data: { permalink, ts, entry: input.authorship.author, data: input },
        }),
        database.entry.upsert({
          where: { did: input.authorship.author },
          create: {
            did: input.authorship.author,
            community: permalink,
            subscribers: 0,
            proposals: 0,
            votes: 0,
            ts,
          },
          update: {
            community: permalink,
            ts,
          },
        }),
      ])

      return permalink
    }),
})

export type CommunityRouter = typeof communityRouter
