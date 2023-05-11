import { z } from 'zod'

export const activitySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.union([
      z.literal('create_community'),
      z.literal('modify_community'),
    ]),
    community_id: z.string(),
    community_permalink: z.string(),
    community_name: z.string(),
  }),
  z.object({
    type: z.literal('create_grant'),
    community_id: z.string(),
    community_permalink: z.string(),
    community_name: z.string(),
    grant_permalink: z.string(),
    grant_name: z.string(),
  }),
  z.object({
    type: z.literal('create_grant_proposal'),
    community_id: z.string(),
    community_permalink: z.string(),
    community_name: z.string(),
    grant_permalink: z.string(),
    grant_name: z.string(),
    grant_proposal_permalink: z.string(),
    grant_proposal_title: z.string(),
  }),
  z.object({
    type: z.union([
      z.literal('create_group'),
      z.literal('modify_group'),
      z.literal('archive_group'),
    ]),
    community_id: z.string(),
    community_permalink: z.string(),
    community_name: z.string(),
    group_id: z.string(),
    group_permalink: z.string(),
    group_name: z.string(),
  }),
  z.object({
    type: z.literal('create_group_proposal'),
    community_id: z.string(),
    community_permalink: z.string(),
    community_name: z.string(),
    group_id: z.string(),
    group_permalink: z.string(),
    group_name: z.string(),
    group_proposal_permalink: z.string(),
    group_proposal_title: z.string(),
  }),
])

export type Activity = z.infer<typeof activitySchema>
