import { z } from 'zod'

import { authorSchema } from './author'

export const proposalSchema = z.object({
  community: z.string().min(1),
  group: z.number(),
  title: z.string().min(1),
  voting_type: z.enum(['single', 'multiple', 'weighted']),
  options: z
    .array(z.string().min(1))
    .refine((options) => new Set(options).size === options.length, {
      message: 'options are not unique',
    }),
  snapshots: z.record(z.string(), z.string()),
  extension: z
    .object({
      body: z.string().optional(),
    })
    .optional(),
})
export type Proposal = z.infer<typeof proposalSchema>

export const proposalWithAuthorSchema = proposalSchema.extend({
  author: authorSchema,
})
