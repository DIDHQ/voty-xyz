import { z } from 'zod'

import { booleanSetsSchema, numberSetsSchema } from './sets'

export const workgroupSchema = z.object({
  name: z.string().min(1),
  duration: z.object({
    announcement: z.number().min(3600),
    adding_option: z.number().min(3600).optional(),
    voting: z.number().min(3600),
  }),
  permission: z.object({
    proposing: booleanSetsSchema,
    adding_option: booleanSetsSchema.optional(),
    voting: numberSetsSchema,
  }),
  extension: z.object({
    id: z.string().min(1),
    terms_and_conditions: z.string().min(1),
    about: z.string().optional(),
  }),
})

export type Workgroup = z.infer<typeof workgroupSchema>
