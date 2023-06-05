import { z } from 'zod'

export const grantProposalSchema = z.object({
  grant: z.string().min(1),
  title: z.string().min(1, 'Required'),
  content: z
    .string()
    .min(1, 'Required')
    .refine(
      (content) =>
        !content.match(/\!\[Uploading_\w{8}-\w{4}-\w{4}-\w{4}-\w{12}\]\(\)/),
      'Images are not fully uploaded yet',
    ),
})

export type GrantProposal = z.infer<typeof grantProposalSchema>
