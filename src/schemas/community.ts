import { z } from 'zod'

import { authorSchema } from './author'
import { groupSchema } from './group'

export const communitySchema = z.object({
  name: z.string().min(1),
  groups: z
    .array(groupSchema)
    .optional()
    .refine(
      (groups) =>
        !groups?.length ||
        new Set(groups?.map(({ extension: { id } }) => id)).size ===
          groups?.length,
      { message: 'groups name are not unique' },
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

export const communityWithAuthorSchema = communitySchema.extend({
  author: authorSchema,
})
