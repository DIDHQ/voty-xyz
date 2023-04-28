import { TRPCError } from '@trpc/server'
import { compact, keyBy } from 'lodash-es'
import { z } from 'zod'

import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { authorized } from '../../utils/schemas/authorship'
import { grantSchema } from '../../utils/schemas/grant'
import { procedure, router } from '../trpc'
import { proved } from '../../utils/schemas/proof'
import verifySnapshot from '../../utils/verifiers/verify-snapshot'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'
import verifyGrant from '../../utils/verifiers/verify-grant'

const schema = proved(authorized(grantSchema))

export const grantRouter = router({
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

      const grants = await database.grant.findMany({
        where: { communityId: input.communityId },
      })
      const storages = keyBy(
        await database.storage.findMany({
          where: {
            permalink: { in: grants.map(({ permalink }) => permalink) },
          },
        }),
        ({ permalink }) => permalink,
      )

      return compact(
        grants
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
    .input(schema)
    .output(z.string())
    .mutation(async ({ input }) => {
      await verifySnapshot(input.authorship)
      await verifyProof(input)
      await verifyAuthorship(input.authorship, input.proof)
      const { community } = await verifyGrant(input)

      const permalink = await uploadToArweave(input)
      const ts = new Date()

      await database.$transaction([
        database.grant.create({
          data: {
            permalink,
            communityId: community.id,
            communityPermalink: input.community,
            ts,
          },
        }),
        database.community.update({
          where: { id: community.id },
          data: { grants: { increment: 1 } },
        }),
        database.storage.create({ data: { permalink, data: input } }),
      ])

      return permalink
    }),
})

export type GrantRouter = typeof grantRouter
