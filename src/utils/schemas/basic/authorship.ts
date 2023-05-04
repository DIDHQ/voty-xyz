import { z } from 'zod'

export const authorshipSchema = z.object({
  author: z.string().min(1),
  coin_type: z.number().int(),
  snapshot: z.string().min(1),
  testnet: z.literal(true).optional(),
})

export type Authorship = z.infer<typeof authorshipSchema>

export function authorized<T extends Zod.ZodRawShape>(obj: Zod.ZodObject<T>) {
  return obj.extend({ authorship: authorshipSchema })
}

export type Authorized<T extends object> = T & {
  authorship: Authorship
}
