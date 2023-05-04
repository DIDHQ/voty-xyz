import { z } from 'zod'

export const groupProposalSchema = z.object({
  group: z.string().min(1),
  snapshots: z.record(z.string(), z.string()),
  title: z.string().min(1, 'Required'),
  content: z.string().min(1, 'Required'),
  voting_type: z.enum(['single', 'approval']),
  choices: z
    .array(z.string().min(1, 'Required'))
    .min(2, 'At least 2 choices')
    .refine((choices) => new Set(choices).size === choices.length, {
      message: 'Choices are not unique',
    }),
})

export type GroupProposal = z.infer<typeof groupProposalSchema>
