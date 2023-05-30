import { z } from 'zod'

export const grantProposalSelectSchema = z.object({
  grant_proposal: z.string().min(1),
})

export type GrantProposalSelect = z.infer<typeof grantProposalSelectSchema>
