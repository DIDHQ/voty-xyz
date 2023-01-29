import { z } from 'zod'

import { authorSchema } from './author'

export const proposalSchema = z.object({
  community: z.string().min(1),
  group: z.string().min(1),
  title: z.string().min(1),
  voting_type: z.enum(['single', 'multiple', 'weighted']),
  options: z.array(z.string().min(1)).min(1),
  snapshots: z.record(z.string(), z.string()),
  extend: z
    .object({
      body: z.string().optional(),
    })
    .optional(),
})
export type Proposal = z.infer<typeof proposalSchema>

export const proposalWithAuthorSchema = proposalSchema.extend({
  author: authorSchema,
})
