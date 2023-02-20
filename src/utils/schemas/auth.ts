import { z } from 'zod'

export const authSchema = z.object({
  message: z.literal('welcome to voty'),
})

export type Auth = z.infer<typeof authSchema>
