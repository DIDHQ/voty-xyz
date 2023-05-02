import { z } from 'zod'

export const communitySchema = z.object({
  id: z.string().min(1, 'Required'),
  name: z.string().min(1, 'Required').max(32, 'Maximum 32 characters'),
  logo: z.string(),
  slogan: z.string().min(1, 'Required').max(128, 'Maximum 128 characters'),
  description: z.string().optional(),
  how_to_join: z.string().optional(),
  links: z
    .object({
      website: z.string().optional(),
      twitter: z.string().optional(),
      discord: z.string().optional(),
      github: z.string().optional(),
    })
    .optional(),
})

export type Community = z.infer<typeof communitySchema>
