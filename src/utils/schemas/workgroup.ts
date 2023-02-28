import { z } from 'zod'

import { booleanSetsSchema, decimalSetsSchema } from './sets'

export const workgroupSchema = z.object({
  id: z.string().min(1, 'required'),
  name: z.string().min(1, 'required'),
  duration: z.object({
    announcement: z.number().min(3600, 'minium 1 hour'),
    voting: z.number().min(3600, 'minium 1 hour'),
  }),
  permission: z.object({
    proposing: booleanSetsSchema,
    voting: decimalSetsSchema,
  }),
  extension: z.object({
    terms_and_conditions: z.string().min(1, 'required'),
  }),
})

export type Workgroup = z.infer<typeof workgroupSchema>
