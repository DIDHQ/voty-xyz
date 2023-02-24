import { z } from 'zod'

import { booleanSetsSchema, decimalSetsSchema } from './sets'

export const workgroupSchema = z.object({
  id: z.string().min(1, 'required'),
  name: z.string().min(1, 'required'),
  duration: z.object({
    announcement: z.number().min(3600, 'minium 1 hour'),
    adding_option: z.number().min(3600, 'minium 1 hour').optional(),
    voting: z.number().min(3600, 'minium 1 hour'),
  }),
  permission: z.object({
    proposing: booleanSetsSchema,
    adding_option: booleanSetsSchema.optional(),
    voting: decimalSetsSchema,
  }),
  extension: z.object({
    terms_and_conditions: z.string().min(1, 'required'),
    about: z.string().optional(),
  }),
})

export type Workgroup = z.infer<typeof workgroupSchema>
