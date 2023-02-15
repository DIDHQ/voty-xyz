import { TRPCError } from '@trpc/server'
import { compact, keyBy, last } from 'lodash-es'
import { z } from 'zod'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { communityWithAuthorSchema } from '../../utils/schemas'
import verifyCommunity from '../../utils/verifiers/verify-community'
import { procedure, router } from '../trpc'

const textDecoder = new TextDecoder()

export const communityRouter = router({
  getByEntry: procedure
    .input(z.object({ entry: z.string().nullish() }))
    .output(
      communityWithAuthorSchema.merge(z.object({ permalink: z.string() })),
    )
    .query(async ({ input }) => {
      if (!input.entry) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
      const entry = await database.entry.findUnique({
        where: { did: input.entry },
      })
      if (!entry) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }
      const community = await database.community.findUnique({
        where: { permalink: entry?.community },
      })
      if (!community) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }
      return {
        permalink: community.permalink,
        ...communityWithAuthorSchema.parse(
          JSON.parse(textDecoder.decode(community.data)),
        ),
      }
    }),
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().nullish() }))
    .output(communityWithAuthorSchema)
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
      const community = await database.community.findUnique({
        where: { permalink: input.permalink },
      })
      if (!community) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }
      return communityWithAuthorSchema.parse(
        JSON.parse(textDecoder.decode(community.data)),
      )
    }),
  list: procedure
    .input(z.object({ cursor: z.string().nullish() }))
    .output(
      z.object({
        data: z.array(
          communityWithAuthorSchema.merge(z.object({ permalink: z.string() })),
        ),
        next: z.string().nullish(),
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
            .map(({ community }) => communities[community])
            .filter((community) => community)
            .map(({ permalink, data }) => {
              try {
                return {
                  permalink,
                  ...communityWithAuthorSchema.parse(
                    JSON.parse(textDecoder.decode(data)),
                  ),
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
    .input(communityWithAuthorSchema)
    .output(z.string())
    .mutation(async ({ input }) => {
      const { community } = await verifyCommunity(input)
      const { permalink, data } = await uploadToArweave(community)
      const ts = new Date()

      await database.$transaction([
        database.community.create({
          data: { permalink, ts, entry: community.author.did, data },
        }),
        database.entry.upsert({
          where: { did: community.author.did },
          create: {
            did: community.author.did,
            community: permalink,
            subscribers: 0,
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
