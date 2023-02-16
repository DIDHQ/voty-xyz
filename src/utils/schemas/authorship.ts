import { z } from 'zod'

export const authorshipSchema = z.object({
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

export type Authorship = z.infer<typeof authorshipSchema>

export function authorized<T extends Zod.ZodRawShape>(obj: Zod.ZodObject<T>) {
  return obj.extend({ authorship: authorshipSchema })
}

export type Authorized<T extends object> = T & {
  authorship: Authorship
}
