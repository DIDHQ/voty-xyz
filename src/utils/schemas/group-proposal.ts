import { z } from 'zod'

export const groupProposalSchema = z.object({
  group: z.string().min(1),
  title: z.string().min(1, 'Required'),
  voting_type: z.enum(['single', 'approval']),
  options: z
    .array(z.string().min(1, 'Required'))
    .min(2, 'At least 2 options')
    .refine((options) => new Set(options).size === options.length, {
      message: 'Options are not unique',
    }),
  snapshots: z.record(z.string(), z.string()),
  extension: z.object({
    content: z.string().min(1, 'Required'),
  }),
})

export type GroupProposal = z.infer<typeof groupProposalSchema>
