import { z } from 'zod'

import { authorSchema } from './author'

export const voteSchema = z.object({
  proposal: z.string().min(1),
  choice: z.union([z.number(), z.array(z.number())]),
  power: z.number(),
})
export type Vote = z.infer<typeof voteSchema>

export const voteWithAuthorSchema = voteSchema.extend({
  author: authorSchema,
})
