import { z } from 'zod'

import { authorSchema } from './author'

export const voteSchema = z.object({
  did: z.string().min(1),
  community: z.string().min(1),
  group: z.string().min(1),
  proposal: z.string().min(1),
  choice: z.union([z.number(), z.array(z.number())]),
  power: z.number(),
})
export type Vote = z.infer<typeof voteSchema>

export const voteWithSignatureSchema = voteSchema.extend({
  author: authorSchema,
})
export type VoteWithSignature = z.infer<typeof voteWithSignatureSchema>
