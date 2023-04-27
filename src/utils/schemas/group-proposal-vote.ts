import { z } from 'zod'

import { choiceIsEmpty } from '../choice'
import { positiveDecimalSchema } from './positive-decimal'

export const groupProposalVoteSchema = z.object({
  group_proposal: z.string().min(1),
  choice: z
    .string()
    .refine(
      (choice) =>
        !choiceIsEmpty('single', choice) && !choiceIsEmpty('approval', choice),
      { message: 'Empty choice' },
    ),
  power: positiveDecimalSchema,
})

export type GroupProposalVote = z.infer<typeof groupProposalVoteSchema>
