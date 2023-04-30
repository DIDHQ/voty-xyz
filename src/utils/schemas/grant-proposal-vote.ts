import { z } from 'zod'

import { positiveDecimalSchema } from './positive-decimal'

export const grantProposalVoteSchema = z.object({
  grant_proposal: z.string().min(1),
  powers: z
    .record(z.string().min(1), positiveDecimalSchema)
    .refine((powers) => Object.keys(powers).length > 0, 'Empty vote'),
  total_power: positiveDecimalSchema,
})

export type GrantProposalVote = z.infer<typeof grantProposalVoteSchema>
