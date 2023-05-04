import { z } from 'zod'

export const grantProposalSchema = z.object({
  grant: z.string().min(1),
  title: z.string().min(1, 'Required'),
  content: z.string().min(1, 'Required'),
})

export type GrantProposal = z.infer<typeof grantProposalSchema>
