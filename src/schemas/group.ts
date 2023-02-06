import { z } from 'zod'

import { booleanSetsSchema, numberSetsSchema } from './sets'

export const groupSchema = z.object({
  name: z.string().min(1),
  period: z.object({
    proposing: z.number().min(3600),
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
    about: z.string().optional(),
  }),
})
export type Group = z.infer<typeof groupSchema>
