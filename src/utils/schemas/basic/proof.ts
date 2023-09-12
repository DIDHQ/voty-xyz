import { z } from 'zod'

export const proofSchema = z.object({
  type: z.string(),
  address: z.string().min(1),
  template: z.string().min(1).optional(),
  signature: z.string().min(1),
  backup_addr: z.string().optional().nullable()
})

export type Proof = z.infer<typeof proofSchema>

export function proved<T extends Zod.ZodRawShape>(obj: Zod.ZodObject<T>) {
  return obj.extend({ proof: proofSchema })
}

export type Proved<T extends object> = T & {
  proof: Proof
}
