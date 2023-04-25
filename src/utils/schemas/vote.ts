import Decimal from 'decimal.js'
import { z } from 'zod'

import { decimalSchema } from './decimal'

export const voteSchema = z.object({
  target: z.string().min(1),
  powers: z.record(
    z.string(),
    decimalSchema.refine((power) => new Decimal(power).gt(0), {
      message: 'Negative power not allowed',
    }),
  ),
})

export type Vote = z.infer<typeof voteSchema>
