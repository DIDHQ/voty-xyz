import { z } from 'zod'

import { authorSchema } from './author'

export const optionSchema = z.object({
  proposal: z.string().min(1),
  title: z.string(),
})
export type Option = z.infer<typeof optionSchema>

export const optionWithAuthorSchema = optionSchema.extend({
  author: authorSchema,
})
