import { z } from 'zod'

export const authorSchema = z.object({
  did: z.string().min(1),
  snapshot: z.string().min(1),
  coin_type: z.number(),
  proof: z.object({
    type: z.literal('evm_address_signature'),
    address: z.string(),
    signature: z.string(),
  }),
  testnet: z.literal(true).optional(),
})
export type Author = z.infer<typeof authorSchema>

export type Authorized<T extends object> = T & {
  author: Author
}
