import { z } from 'zod'

export const proposalSchema = z.object({
  community: z.string().min(1),
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
  extension: z
    .object({
      content: z.string().optional(),
    })
    .optional(),
})

export type Proposal = z.infer<typeof proposalSchema>
