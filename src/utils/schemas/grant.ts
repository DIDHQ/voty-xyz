import { z } from 'zod'

import { booleanSetsSchema, decimalSetsSchema } from './sets'

export const grantSchema = z.object({
  name: z.string().min(1, 'Required'),
  community: z.string().min(1, 'Required'),
  permission: z.object({
    proposing: booleanSetsSchema,
    voting: decimalSetsSchema,
  }),
  duration: z.object({
    announcing: z.number().int().min(60, 'Minium 1 minute'),
    proposing: z.number().int().min(60, 'Minium 1 minute'),
    voting: z.number().int().min(60, 'Minium 1 minute'),
  }),
  snapshots: z.record(z.string(), z.string()),
  extension: z.object({
    introduction: z.string().min(1, 'Required'),
    funding: z
      .array(z.tuple([z.string().min(1, 'Required'), z.number().int().min(1)]))
      .length(1),
  }),
})

export type Grant = z.infer<typeof grantSchema>
