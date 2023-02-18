import { z } from 'zod'

import { workgroupSchema } from './workgroup'

export const communitySchema = z.object({
  name: z.string().min(1),
  workgroups: z
    .array(workgroupSchema)
    .optional()
    .refine(
      (workgroups) =>
        !workgroups?.length ||
        new Set(workgroups.map(({ extension: { id } }) => id)).size ===
          workgroups.length,
      { message: 'workgroups name are not unique' },
    ),
  extension: z
    .object({
      avatar: z.string().optional(),
      about: z.string().optional(),
      website: z.string().optional(),
      twitter: z.string().optional(),
      discord: z.string().optional(),
      github: z.string().optional(),
    })
    .optional(),
})

export type Community = z.infer<typeof communitySchema>
