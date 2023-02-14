import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { database } from '../../utils/database'
import { proposalWithAuthorSchema } from '../../utils/schemas'
import { procedure, router } from '../trpc'

const textDecoder = new TextDecoder()

export const proposalRouter = router({
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().nullish() }))
    .output(proposalWithAuthorSchema)
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      const proposal = await database.proposal.findUnique({
        where: { permalink: input.permalink },
      })
      if (!proposal) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return proposalWithAuthorSchema.parse(
        JSON.parse(textDecoder.decode(proposal.data)),
      )
    }),
})

export type proposalRouter = typeof proposalRouter
