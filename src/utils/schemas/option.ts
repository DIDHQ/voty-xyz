import { z } from 'zod'

export const optionSchema = z.object({
  proposal: z.string().min(1),
  title: z.string().min(1),
  extension: z
    .object({
      content: z.string().optional(),
    })
    .optional(),
})

export type Option = z.infer<typeof optionSchema>
