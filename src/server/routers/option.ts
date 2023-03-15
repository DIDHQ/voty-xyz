import { TRPCError } from '@trpc/server'
import { compact, keyBy, last, mapValues } from 'lodash-es'
import { z } from 'zod'

import { uploadToArweave } from '../../utils/upload'
import { database, getByPermalink } from '../../utils/database'
import { authorized } from '../../utils/schemas/authorship'
import { optionSchema } from '../../utils/schemas/option'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/proof'
import verifySnapshot from '../../utils/verifiers/verify-snapshot'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'
import verifyOption from '../../utils/verifiers/verify-option'
import { DataType } from '../../utils/constants'
import { decimalSchema } from '../../utils/schemas/decimal'

const schema = proved(authorized(optionSchema))

export const optionRouter = router({
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().optional() }))
    .output(schema.nullable())
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const option = await getByPermalink(DataType.OPTION, input.permalink)

      return option ? option.data : null
    }),
  list: procedure
    .input(
      z.object({
        proposal: z.string().optional(),
        cursor: z.string().optional(),
      }),
    )
    .output(
      z.object({
        data: z.array(
          schema.extend({
            permalink: z.string(),
            power: decimalSchema,
            ts: z.date(),
          }),
        ),
        next: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.proposal) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const options = await database.option.findMany({
        where: { proposal: input.proposal },
        cursor: input.cursor ? { permalink: input.cursor } : undefined,
        take: 20,
        skip: input.cursor ? 1 : 0,
        orderBy: { ts: 'desc' },
      })
      const powers = mapValues(
        keyBy(
          await database.choice.findMany({
            where: { proposal: input.proposal },
          }),
          ({ option }) => option,
        ),
        ({ power }) => power,
      )

      return {
        data: compact(
          options.map(({ data, permalink, ts }) => {
            try {
              return {
                ...schema.parse(data),
                permalink,
                power: powers[permalink]?.toString() || '0',
                ts,
              }
            } catch {
              return
            }
          }),
        ),
        next: last(options)?.permalink,
      }
    }),
  create: procedure
    .input(schema)
    .output(z.string())
    .mutation(async ({ input }) => {
      await verifySnapshot(input.authorship)
      await verifyProof(input)
      await verifyAuthorship(input.authorship, input.proof)
      const { proposal, community } = await verifyOption(input)

      const permalink = await uploadToArweave(input)
      const ts = new Date()

      await database.$transaction([
        database.option.create({
          data: {
            permalink,
            ts,
            author: input.authorship.author,
            community: proposal.community,
            group: proposal.group,
            proposal: input.proposal,
            data: input,
          },
        }),
        database.proposal.update({
          where: { permalink: input.proposal },
          data: { options_count: { increment: 1 } },
        }),
        database.entry.update({
          where: { did: community.authorship.author },
          data: { options_count: { increment: 1 } },
        }),
      ])

      return permalink
    }),
})

export type OptionRouter = typeof optionRouter
