import { z } from 'zod'

export const activitySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('create_community'),
    community_id: z.string(),
    community_permalink: z.string(),
    community_name: z.string(),
  }),
  z.object({
    type: z.literal('modify_community'),
    community_id: z.string(),
    community_permalink: z.string(),
    community_name: z.string(),
  }),
  z.object({
    type: z.literal('create_group'),
    group_id: z.string(),
    group_permalink: z.string(),
    group_name: z.string(),
  }),
  z.object({
    type: z.literal('modify_group'),
    group_id: z.string(),
    group_permalink: z.string(),
    group_name: z.string(),
  }),
  z.object({
    type: z.literal('archive_group'),
    group_id: z.string(),
    group_permalink: z.string(),
    group_name: z.string(),
  }),
])

export type Activity = z.infer<typeof activitySchema>
