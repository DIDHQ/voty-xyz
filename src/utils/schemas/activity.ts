import { z } from 'zod'

export const activitySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(''),
  }),
])

export type Activity = z.infer<typeof activitySchema>
