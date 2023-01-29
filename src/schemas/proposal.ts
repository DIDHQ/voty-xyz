import { z } from 'zod'

import { authorSchema } from './author'

export const proposalSchema = z.object({
  did: z.string().min(1),
  community: z.string().min(1),
  group: z.string().min(1),
  // type: z.enum(['single', 'multiple', 'weighted', 'ranked']),
  type: z.enum(['single', 'multiple']),
  title: z.string().min(1),
  body: z.string(),
  discussion: z.string(),
  choices: z.array(z.string().min(1)).min(1),
  snapshots: z.record(z.string(), z.string()),
})
export type Proposal = z.infer<typeof proposalSchema>

export const proposalWithAuthorSchema = proposalSchema.extend({
  author: authorSchema,
})
