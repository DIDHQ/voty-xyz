import { z } from 'zod'
import { signatureSchema } from './signature'
import { workgroupSchema } from './workgroup'

export const organizationSchema = z.object({
  profile: z.object({
    avatar: z.string().optional(),
    name: z.string().min(1),
    about: z.string().optional(),
    website: z.string().optional(),
    tos: z.string().optional(),
  }),
  communities: z
    .array(
      z.object({
        type: z.enum(['twitter', 'discord', 'github']),
        value: z.string().min(1),
      }),
    )
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
