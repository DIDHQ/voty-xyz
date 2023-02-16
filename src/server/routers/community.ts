import { TRPCError } from '@trpc/server'
import { compact, keyBy, last } from 'lodash-es'
import { z } from 'zod'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { communityWithAuthorSchema } from '../../utils/schemas/community'
import verifyCommunity from '../../utils/verifiers/verify-community'
import { procedure, router } from '../trpc'

const textDecoder = new TextDecoder()

export const communityRouter = router({
  getByEntry: procedure
    .input(z.object({ entry: z.string().optional() }))
    .output(
      communityWithAuthorSchema.extend({ permalink: z.string() }).optional(),
    )
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
        permalink: community.permalink,
        ...communityWithAuthorSchema.parse(
          JSON.parse(textDecoder.decode(community.data)),
        ),
      }
    }),
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().optional() }))
    .output(communityWithAuthorSchema.optional())
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
      return communityWithAuthorSchema.parse(
        JSON.parse(textDecoder.decode(community.data)),
      )
    }),
  list: procedure
    .input(z.object({ cursor: z.string().optional() }))
    .output(
      z.object({
        data: z.array(
          communityWithAuthorSchema.extend({ permalink: z.string() }),
        ),
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
          data: { permalink, ts, entry: community.authorship.did, data },
        }),
        database.entry.upsert({
          where: { did: community.authorship.did },
          create: {
            did: community.authorship.did,
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
