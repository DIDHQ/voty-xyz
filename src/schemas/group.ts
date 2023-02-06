import { z } from 'zod'

import { booleanSetsSchema, numberSetsSchema } from './sets'

export const groupSchema = z.object({
  name: z.string().min(1),
  permission: z.object({
    submitting_proposal: booleanSetsSchema,
    adding_option: booleanSetsSchema.optional(),
    voting_power: numberSetsSchema,
  }),
  timing: z.object({
    publicity: z.number().min(3600),
    voting: z.number().min(3600),
    adding_option: z.number().min(3600),
  }),
  extension: z.object({
    id: z.string().min(1),
    about: z.string().optional(),
  }),
})
export type Group = z.infer<typeof groupSchema>
