import { z } from 'zod'

import { booleanSetsSchema, decimalSetsSchema } from './sets'

export const grantSchema = z.object({
  name: z.string().min(1, 'Required'),
  community: z.string().min(1),
  permission: z.object({
    proposing: booleanSetsSchema,
    voting: decimalSetsSchema,
  }),
  duration: z.object({
    pending: z.number().int().min(60, 'Minium 1 minute'),
    proposing: z.number().int().min(60, 'Minium 1 minute'),
    voting: z.number().int().min(60, 'Minium 1 minute'),
  }),
  extension: z.object({
    introduction: z.string().max(256, 'Maximum 256 characters').optional(),
    funding: z
      .array(z.tuple([z.string().min(1, 'Required'), z.number().int().min(1)]))
      .length(1),
  }),
})

export type Grant = z.infer<typeof grantSchema>
