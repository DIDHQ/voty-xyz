import { TRPCError } from '@trpc/server'
import { compact, keyBy, last } from 'lodash-es'
import { z } from 'zod'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/authorship'
import { communitySchema } from '../../utils/schemas/community'
import verifyCommunity from '../../utils/verifiers/verify-community'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/proof'

const textDecoder = new TextDecoder()

const schema = proved(authorized(communitySchema))

const entrySchema = z.object({
  did: z.string(),
  ts: z.date(),
  community: z.string(),
  subscribers: z.number(),
  proposals: z.number(),
  votes: z.number(),
})

export const communityRouter = router({
  getByEntry: procedure
    .input(z.object({ entry: z.string().optional() }))
    .output(schema.extend({ entry: entrySchema }).optional())
    .query(async ({ input }) => {
      if (!input.entry) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
      const entry = await database.entry.findUnique({
        where: { did: input.entry },
      })
      if (!entry) {
        return
      }
      const community = await database.community.findUnique({
        where: { permalink: entry?.community },
      })
      if (!community) {
        return
      }
      return {
        ...schema.parse(JSON.parse(textDecoder.decode(community.data))),
        entry,
      }
    }),
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().optional() }))
    .output(schema.optional())
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
      const community = await database.community.findUnique({
        where: { permalink: input.permalink },
      })
      if (!community) {
        return
      }
      return schema.parse(JSON.parse(textDecoder.decode(community.data)))
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
        take: 50,
        orderBy: { ts: 'desc' },
      })
      const communities = keyBy(
        await database.community.findMany({
          where: {
            permalink: { in: entries.map(({ community }) => community) },
          },
        }),
        ({ permalink }) => permalink,
      )
      return {
        data: compact(
          entries
            .filter(({ community }) => communities[community])
            .map((entry) => {
              try {
                return {
                  ...schema.parse(
                    JSON.parse(
                      textDecoder.decode(communities[entry.community].data),
                    ),
                  ),
                  entry,
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
    .input(schema)
    .output(z.string())
    .mutation(async ({ input }) => {
      const { community } = await verifyCommunity(input)
      const { permalink, data } = await uploadToArweave(community)
      const ts = new Date()

      await database.$transaction([
        database.community.create({
          data: { permalink, ts, entry: community.authorship.author, data },
        }),
        database.entry.upsert({
          where: { did: community.authorship.author },
          create: {
            did: community.authorship.author,
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
