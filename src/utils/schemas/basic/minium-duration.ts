import { z } from 'zod'

export const miniumDuration = z.number().int().min(60, 'Minium 1 minute')

export type miniumDuration = z.infer<typeof miniumDuration>
