import { z } from 'zod'
import { signatureSchema } from './signature'
import { workgroupSchema } from './workgroup'

export const organizationSchema = z.object({
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
  workgroups: z.array(workgroupSchema).optional(),
})
export type Organization = z.infer<typeof organizationSchema>

export const organizationWithSignatureSchema = organizationSchema.extend({
  signature: signatureSchema,
})
export type OrganizationWithSignature = z.infer<
  typeof organizationWithSignatureSchema
>
