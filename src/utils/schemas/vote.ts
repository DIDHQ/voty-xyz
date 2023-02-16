import { z } from 'zod'

export const voteSchema = z.object({
  proposal: z.string().min(1),
  choice: z.string(),
  power: z.number(),
})
export type Vote = z.infer<typeof voteSchema>
