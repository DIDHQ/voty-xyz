import { z } from 'zod'

export const miniumDuration = z
  .number()
  .int()
  .min(5 * 60, 'Minium 5 minutes')

export type miniumDuration = z.infer<typeof miniumDuration>
