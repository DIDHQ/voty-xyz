import Decimal from 'decimal.js'
import { z } from 'zod'

import { decimalSchema } from './decimal'

export const groupProposalVoteSchema = z.object({
  group_proposal: z.string().min(1),
  powers: z
    .record(
      z.string().min(1),
      decimalSchema.refine((power) => new Decimal(power).gt(0), {
        message: 'Negative power not allowed',
      }),
    )
    .refine((powers) => Object.keys(powers).length > 0),
})

export type GroupProposalVote = z.infer<typeof groupProposalVoteSchema>
