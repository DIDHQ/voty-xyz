import Decimal from 'decimal.js'
import { z } from 'zod'

export const decimalSchema = z.string().refine(
  (power) => {
    try {
      return new Decimal(power)
    } catch {
      return false
    }
  },
  { message: 'Not decimal' },
)
