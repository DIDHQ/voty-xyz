import { z } from 'zod'

export const authorSchema = z.object({
  did: z.string().min(1),
  coin_type: z.number(),
  snapshot: z.string().min(1),
  proof: z.object({
    type: z.literal('eth_personal_sign'),
    address: z.string(),
    signature: z.string(),
  }),
  testnet: z.literal(true).optional(),
})
export type Author = z.infer<typeof authorSchema>

export type Authorized<T extends object> = T & {
  author: Author
}
