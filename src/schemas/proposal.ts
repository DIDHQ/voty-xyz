import { z } from 'zod'
import { signatureSchema } from './signature'

export const proposalSchema = z.object({
  organization: z.string().min(1),
  workgroup: z.string().min(1),
  type: z.enum(['single', 'multiple', 'weighted', 'ranked']),
  title: z.string().min(1),
  body: z.string(),
  discussion: z.string(),
  choices: z.array(z.string().min(1)).min(1),
  snapshots: z.record(z.string(), z.string()),
  start: z.number(),
  end: z.number(),
})
export type Proposal = z.infer<typeof proposalSchema>

export const proposalWithSignatureSchema = proposalSchema.extend({
  signature: signatureSchema,
})
export type ProposalWithSignature = z.infer<typeof proposalWithSignatureSchema>
