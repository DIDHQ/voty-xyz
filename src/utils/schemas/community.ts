import { z } from 'zod'

import { workgroupSchema } from './workgroup'

export const communitySchema = z.object({
  name: z.string().min(1, 'Required').max(32, 'Maximum 32 characters'),
  workgroups: z
    .array(workgroupSchema)
    .optional()
    .refine(
      (workgroups) =>
        !workgroups?.length ||
        new Set(workgroups.map(({ id }) => id)).size === workgroups.length,
      { message: 'Workgroup ids are not unique' },
    ),
  extension: z.object({
    logo: z.string(),
    slogan: z.string().max(160, 'Maximum 160 characters').optional(),
    about: z.string().optional(),
    website: z.string().optional(),
    twitter: z.string().optional(),
    discord: z.string().optional(),
    github: z.string().optional(),
  }),
})

export type Community = z.infer<typeof communitySchema>
