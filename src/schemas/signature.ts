import { z } from 'zod'

export const signatureSchema = z.object({
  did: z.string().min(1),
  snapshot: z.string().min(1),
  coin_type: z.number(),
  address: z.string().min(1),
  data: z.string().min(1),
})
export type Signature = z.infer<typeof signatureSchema>
