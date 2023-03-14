import { z } from 'zod'

import { booleanSetsSchema, decimalSetsSchema } from './sets'

export const groupSchema = z.object({
  id: z.string().min(1, 'Required'),
  name: z.string().min(1, 'Required'),
  permission: z.object({
    proposing: booleanSetsSchema,
    adding_option: booleanSetsSchema.optional(),
    voting: decimalSetsSchema,
  }),
  duration: z.object({
    pending: z.number().min(3600, 'Minium 1 hour'),
    adding_option: z.number().min(3600, 'Minium 1 hour').optional(),
    voting: z.number().min(3600, 'Minium 1 hour'),
  }),
  extension: z.object({
    introduction: z.string().max(160, 'Maximum 160 characters').optional(),
    terms_and_conditions: z.string().min(1, 'Required'),
  }),
})

export type Group = z.infer<typeof groupSchema>
