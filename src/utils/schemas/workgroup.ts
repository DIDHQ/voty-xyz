import { z } from 'zod'

import { booleanSetsSchema, decimalSetsSchema } from './sets'

export const workgroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  duration: z.object({
    announcement: z.number().min(0),
    adding_option: z.number().min(0).optional(),
    voting: z.number().min(0),
  }),
  permission: z.object({
    proposing: booleanSetsSchema,
    adding_option: booleanSetsSchema.optional(),
    voting: decimalSetsSchema,
  }),
  extension: z.object({
    terms_and_conditions: z.string().min(1),
    about: z.string().optional(),
  }),
})

export type Workgroup = z.infer<typeof workgroupSchema>
