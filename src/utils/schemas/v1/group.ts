import { z } from 'zod'

import { booleanSetsSchema, decimalSetsSchema } from '../basic/sets'

export const groupSchema = z.object({
  id: z.string().min(1, 'Required'),
  community: z.string().min(1),
  name: z.string().min(1, 'Required'),
  introduction: z.string().max(256, 'Maximum 256 characters').optional(),
  permission: z.object({
    proposing: booleanSetsSchema,
    voting: decimalSetsSchema,
  }),
  duration: z.object({
    announcing: z.number().int().min(60, 'Minium 1 minute'),
    voting: z.number().int().min(60, 'Minium 1 minute'),
  }),
  terms_and_conditions: z.string().min(1, 'Required'),
})

export type Group = z.infer<typeof groupSchema>
