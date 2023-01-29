import { z } from 'zod'

export const authorSchema = z.object({
  did: z.string().min(1),
  snapshot: z.string().min(1),
  coin_type: z.number(),
  address: z.string().min(1),
  signature: z.string().min(1),
})
export type Author = z.infer<typeof authorSchema>

export type Authorized<T extends object> = T & {
  author: Author
}
