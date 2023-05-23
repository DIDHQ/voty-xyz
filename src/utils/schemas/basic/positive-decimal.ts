import { Decimal } from 'decimal.js'
import { z } from 'zod'

export const positiveDecimalSchema = z
  .string()
  .refine(
    (power) => {
      try {
        return new Decimal(power)
      } catch {
        return false
      }
    },
    { message: 'Not decimal' },
  )
  .refine((power) => new Decimal(power).gt(0), {
    message: 'Negative power not allowed',
  })

export type PositiveDecimal = z.infer<typeof positiveDecimalSchema>
