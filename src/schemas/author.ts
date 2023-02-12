import { z } from 'zod'

import { Proof } from '../types'

export const authorSchema = z.object({
  did: z.string().min(1),
  snapshot: z.string().min(1),
  coin_type: z.number(),
  address: z.string().min(1),
  proof: z.custom<Proof>((val) => /^\d+:.+$/.test(val as string)),
})
export type Author = z.infer<typeof authorSchema>

export type Authorized<T extends object> = T & {
  author: Author
}
