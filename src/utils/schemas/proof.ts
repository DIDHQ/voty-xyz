import { z } from 'zod'

export const proofSchema = z.object({
  type: z.literal('eth_personal_sign'),
  address: z.string(),
  signature: z.string(),
})

export type Proof = z.infer<typeof proofSchema>

export function proved<T extends Zod.ZodRawShape>(obj: Zod.ZodObject<T>) {
  return obj.extend({ proof: proofSchema })
}

export type Proved<T extends object> = T & {
  proof: Proof
}
