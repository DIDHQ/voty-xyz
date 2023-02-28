import { z } from 'zod'

export const proposalSchema = z.object({
  community: z.string().min(1),
  workgroup: z.string().min(1),
  title: z.string().min(1, 'Required'),
  voting_type: z.enum(['single', 'multiple']),
  options: z
    .array(z.string().min(1, 'At least 1 option'))
    .refine((options) => new Set(options).size === options.length, {
      message: 'Options are not unique',
    }),
  snapshots: z.record(z.string(), z.string()),
  extension: z
    .object({
      body: z.string().optional(),
    })
    .optional(),
})

export type Proposal = z.infer<typeof proposalSchema>
