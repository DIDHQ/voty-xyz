import { z } from 'zod'

import { choiceIsEmpty } from '../voting'

export const voteSchema = z.object({
  proposal: z.string().min(1),
  choice: z
    .string()
    .refine(
      (choice) =>
        !choiceIsEmpty('single', choice) && !choiceIsEmpty('multiple', choice),
    ),
  power: z.number(),
})

export type Vote = z.infer<typeof voteSchema>
