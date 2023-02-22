import Decimal from 'decimal.js'
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
  power: z.string().refine((power) => new Decimal(power)),
})

export type Vote = z.infer<typeof voteSchema>
