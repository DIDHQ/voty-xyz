import { z } from 'zod'

import { booleanSetsSchema, decimalSetsSchema } from '../basic/sets'
import { miniumDuration } from '../basic/minium-duration'

export const grantSchema = z.object({
  community: z.string().min(1, 'Required'),
  snapshots: z.record(z.string(), z.string()),
  name: z.string().min(1, 'Required'),
  introduction: z.string().min(1, 'Required'),
  permission: z.object({
    proposing: booleanSetsSchema,
    selecting: booleanSetsSchema.optional(),
    voting: decimalSetsSchema,
  }),
  duration: z.object({
    announcing: miniumDuration,
    proposing: miniumDuration,
    voting: miniumDuration,
  }),
  funding: z
    .array(z.tuple([z.string().min(1, 'Required'), z.number().int().min(1)]))
    .length(1),
})

export type Grant = z.infer<typeof grantSchema>
