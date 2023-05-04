import { z } from 'zod'

import { positiveDecimalSchema } from '../basic/positive-decimal'

export const groupProposalVoteSchema = z.object({
  group_proposal: z.string().min(1),
  powers: z
    .record(z.string().min(1), positiveDecimalSchema)
    .refine((powers) => Object.keys(powers).length > 0, 'Empty vote'),
  total_power: positiveDecimalSchema,
})

export type GroupProposalVote = z.infer<typeof groupProposalVoteSchema>
