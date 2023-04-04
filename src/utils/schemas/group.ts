import { z } from 'zod'

import { booleanSetsSchema, decimalSetsSchema } from './sets'

export const groupSchema = z.object({
  id: z.string().min(1, 'Required'),
  name: z.string().min(1, 'Required'),
  permission: z.object({
    proposing: booleanSetsSchema,
    voting: decimalSetsSchema,
  }),
  duration: z.object({
    announcing: z.number().int().min(300, 'Minium 5 minutes'),
    voting: z.number().int().min(300, 'Minium 5 minutes'),
  }),
  extension: z.object({
    introduction: z.string().max(160, 'Maximum 160 characters').optional(),
    criteria_for_approval: z.string().min(1, 'Required'),
  }),
})

export type Group = z.infer<typeof groupSchema>
