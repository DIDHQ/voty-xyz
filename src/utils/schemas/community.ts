import { z } from 'zod'

import { workgroupSchema } from './workgroup'

export const communitySchema = z.object({
  name: z.string().min(1, 'required').max(32, 'maximum 32 characters'),
  workgroups: z
    .array(workgroupSchema)
    .optional()
    .refine(
      (workgroups) =>
        !workgroups?.length ||
        new Set(workgroups.map(({ id }) => id)).size === workgroups.length,
      { message: 'workgroup ids are not unique' },
    ),
  extension: z
    .object({
      logo: z.string().optional(),
      slogan: z.string().max(160, 'maximum 160 characters').optional(),
      about: z.string().optional(),
      website: z.string().optional(),
      twitter: z.string().optional(),
      discord: z.string().optional(),
      github: z.string().optional(),
    })
    .optional(),
})

export type Community = z.infer<typeof communitySchema>
