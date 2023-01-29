import { z } from 'zod'
import { signatureSchema } from './signature'
import { groupSchema } from './group'

export const communitySchema = z.object({
  did: z.string().min(1),
  profile: z.object({
    avatar: z.string().optional(),
    name: z.string().min(4),
    about: z.string().optional(),
    website: z.string().optional(),
    tos: z.string().optional(),
  }),
  social: z
    .object({
      twitter: z.string(),
      discord: z.string(),
      github: z.string(),
    })
    .optional(),
  groups: z.array(groupSchema).optional(),
})
export type Community = z.infer<typeof communitySchema>

export const communityWithSignatureSchema = communitySchema.extend({
  signature: signatureSchema,
})
export type CommunityWithSignature = z.infer<
  typeof communityWithSignatureSchema
>
