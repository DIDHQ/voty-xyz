import { z } from 'zod'

import { booleanSetsSchema, decimalSetsSchema } from '../basic/sets'
import { miniumDuration } from '../basic/minium-duration'

export const groupSchema = z.object({
  id: z.string().min(1, 'Required'),
  community: z.string().min(1),
  name: z.string().min(1, 'Required'),
  introduction: z
    .string()
    .min(1, 'Required')
    .max(256, 'Maximum 256 characters'),
  permission: z.object({
    proposing: booleanSetsSchema,
    voting: decimalSetsSchema,
  }),
  duration: z.object({
    announcing: miniumDuration,
    voting: miniumDuration,
  }),
  terms_and_conditions: z.string().min(1, 'Required'),
})

export type Group = z.infer<typeof groupSchema>
