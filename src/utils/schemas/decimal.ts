import Decimal from 'decimal.js'
import { z } from 'zod'

export const decimalSchema = z.string().refine(
  (power) => {
    try {
      new Decimal(power)
      return true
    } catch {
      return false
    }
  },
  { message: 'Not decimal' },
)
