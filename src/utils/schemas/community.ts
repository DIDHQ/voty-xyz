import { z } from 'zod'

import { groupSchema } from './group'

export const communitySchema = z.object({
  name: z.string().min(1, 'Required').max(32, 'Maximum 32 characters'),
  groups: z
    .array(groupSchema)
    .optional()
    .refine(
      (groups) =>
        !groups?.length ||
        new Set(groups.map(({ id }) => id)).size === groups.length,
      { message: 'Group ids are not unique' },
    ),
  extension: z.object({
    logo: z.string(),
    slogan: z.string().min(1, 'Required').max(160, 'Maximum 160 characters'),
    description: z.string().optional(),
    website: z.string().optional(),
    twitter: z.string().optional(),
    discord: z.string().optional(),
    github: z.string().optional(),
  }),
})

export type Community = z.infer<typeof communitySchema>
