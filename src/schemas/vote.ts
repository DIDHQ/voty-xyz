import { z } from 'zod'

import { signatureSchema } from './signature'

export const voteSchema = z.object({
  did: z.string().min(1),
  organization: z.string().min(1),
  workgroup: z.string().min(1),
  proposal: z.string().min(1),
  choice: z.union([z.number(), z.array(z.number())]),
})
export type Vote = z.infer<typeof voteSchema>

export const voteWithSignatureSchema = voteSchema.extend({
  signature: signatureSchema,
})
export type VoteWithSignature = z.infer<typeof voteWithSignatureSchema>
