import {
  mysqlTable,
  index,
  primaryKey,
  varchar,
  json,
  timestamp,
  unique,
  int,
  decimal,
  text,
} from 'drizzle-orm/mysql-core'

export const activity = mysqlTable(
  'Activity',
  {
    communityId: varchar('communityId', { length: 191 }).notNull(),
    type: varchar('type', { length: 191 }).notNull(),
    actor: varchar('actor', { length: 191 }).notNull(),
    data: json('data').notNull(),
    ts: timestamp('ts', { mode: 'date' }).notNull(),
  },
  (table) => {
    return {
      communityIdTsTypeIdx: index('Activity_communityId_ts_type_idx').on(
        table.communityId,
        table.ts,
        table.type,
      ),
      activityActorTs: primaryKey(table.actor, table.ts),
    }
  },
)

export const community = mysqlTable(
  'Community',
  {
    id: varchar('id', { length: 191 }).notNull(),
    permalink: varchar('permalink', { length: 191 }).notNull(),
    subscribers: int('subscribers').default(0).notNull(),
    grants: int('grants').default(0).notNull(),
    grantProposals: int('grantProposals').default(0).notNull(),
    grantProposalVotes: int('grantProposalVotes').default(0).notNull(),
    groupProposals: int('groupProposals').default(0).notNull(),
    groupProposalVotes: int('groupProposalVotes').default(0).notNull(),
    ts: timestamp('ts', { mode: 'date' }).notNull(),
  },
  (table) => {
    return {
      communityPermalink: primaryKey(table.permalink),
      communityIdKey: unique('Community_id_key').on(table.id),
    }
  },
)

export const grant = mysqlTable(
  'Grant',
  {
    permalink: varchar('permalink', { length: 191 }).notNull(),
    communityId: varchar('communityId', { length: 191 }).notNull(),
    communityPermalink: varchar('communityPermalink', {
      length: 191,
    }).notNull(),
    proposals: int('proposals').default(0).notNull(),
    votes: int('votes').default(0).notNull(),
    ts: timestamp('ts', { mode: 'date' }).notNull(),
    tsAnnouncing: timestamp('tsAnnouncing', { mode: 'date' }),
    tsProposing: timestamp('tsProposing', { mode: 'date' }),
    tsVoting: timestamp('tsVoting', { mode: 'date' }),
    selectedProposals: int('selectedProposals').default(0).notNull(),
  },
  (table) => {
    return {
      grantPermalink: primaryKey(table.permalink),
    }
  },
)

export const grantProposal = mysqlTable(
  'GrantProposal',
  {
    permalink: varchar('permalink', { length: 191 }).notNull(),
    grantPermalink: varchar('grantPermalink', { length: 191 }).notNull(),
    proposer: varchar('proposer', { length: 191 }).notNull(),
    votes: int('votes').default(0).notNull(),
    ts: timestamp('ts', { mode: 'date' }).notNull(),
    selected: varchar('selected', { length: 191 }),
  },
  (table) => {
    return {
      grantProposalPermalink: primaryKey(table.permalink),
      grantProposalGrantPermalinkProposerKey: unique(
        'GrantProposal_grantPermalink_proposer_key',
      ).on(table.grantPermalink, table.proposer),
    }
  },
)

export const grantProposalSelect = mysqlTable(
  'GrantProposalSelect',
  {
    permalink: varchar('permalink', { length: 191 }).notNull(),
    grantPermalink: varchar('grantPermalink', { length: 191 }).notNull(),
    proposalPermalink: varchar('proposalPermalink', { length: 191 }).notNull(),
    selector: varchar('selector', { length: 191 }).notNull(),
    ts: timestamp('ts', { mode: 'date' }).notNull(),
  },
  (table) => {
    return {
      grantProposalSelectPermalink: primaryKey(table.permalink),
      grantProposalSelectProposalPermalinkKey: unique(
        'GrantProposalSelect_proposalPermalink_key',
      ).on(table.proposalPermalink),
    }
  },
)

export const grantProposalVote = mysqlTable(
  'GrantProposalVote',
  {
    permalink: varchar('permalink', { length: 191 }).notNull(),
    grantPermalink: varchar('grantPermalink', { length: 191 }).notNull(),
    proposalPermalink: varchar('proposalPermalink', { length: 191 }).notNull(),
    voter: varchar('voter', { length: 191 }).notNull(),
    ts: timestamp('ts', { mode: 'date' }).notNull(),
  },
  (table) => {
    return {
      proposalPermalinkIdx: index('GrantProposalVote_proposalPermalink_idx').on(
        table.proposalPermalink,
      ),
      grantProposalVotePermalink: primaryKey(table.permalink),
      grantProposalVoteGrantPermalinkVoterKey: unique(
        'GrantProposalVote_grantPermalink_voter_key',
      ).on(table.grantPermalink, table.voter),
    }
  },
)

export const grantProposalVoteChoice = mysqlTable(
  'GrantProposalVoteChoice',
  {
    proposalPermalink: varchar('proposalPermalink', { length: 191 }).notNull(),
    choice: varchar('choice', { length: 191 }).notNull(),
    power: decimal('power', { precision: 65, scale: 30 }).notNull(),
  },
  (table) => {
    return {
      grantProposalVoteChoiceChoiceProposalPermalink: primaryKey(
        table.choice,
        table.proposalPermalink,
      ),
    }
  },
)

export const group = mysqlTable(
  'Group',
  {
    id: varchar('id', { length: 191 }).notNull(),
    permalink: varchar('permalink', { length: 191 }).notNull(),
    communityId: varchar('communityId', { length: 191 }).notNull(),
    communityPermalink: varchar('communityPermalink', {
      length: 191,
    }).notNull(),
    proposals: int('proposals').default(0).notNull(),
    votes: int('votes').default(0).notNull(),
    ts: timestamp('ts', { mode: 'date' }).notNull(),
  },
  (table) => {
    return {
      groupPermalink: primaryKey(table.permalink),
      groupIdCommunityIdKey: unique('Group_id_communityId_key').on(
        table.id,
        table.communityId,
      ),
    }
  },
)

export const groupProposal = mysqlTable(
  'GroupProposal',
  {
    permalink: varchar('permalink', { length: 191 }).notNull(),
    communityId: varchar('communityId', { length: 191 }).notNull(),
    groupId: varchar('groupId', { length: 191 }).notNull(),
    groupPermalink: varchar('groupPermalink', { length: 191 }).notNull(),
    proposer: varchar('proposer', { length: 191 }).notNull(),
    votes: int('votes').default(0).notNull(),
    ts: timestamp('ts', { mode: 'date' }).notNull(),
    tsAnnouncing: timestamp('tsAnnouncing', { mode: 'date' }),
    tsVoting: timestamp('tsVoting', { mode: 'date' }),
  },
  (table) => {
    return {
      communityIdGroupIdIdx: index('GroupProposal_communityId_groupId_idx').on(
        table.communityId,
        table.groupId,
      ),
      groupProposalPermalink: primaryKey(table.permalink),
    }
  },
)

export const groupProposalVote = mysqlTable(
  'GroupProposalVote',
  {
    permalink: varchar('permalink', { length: 191 }).notNull(),
    proposalPermalink: varchar('proposalPermalink', { length: 191 }).notNull(),
    voter: varchar('voter', { length: 191 }).notNull(),
    ts: timestamp('ts', { mode: 'date' }).notNull(),
  },
  (table) => {
    return {
      groupProposalVotePermalink: primaryKey(table.permalink),
      groupProposalVoteProposalPermalinkVoterKey: unique(
        'GroupProposalVote_proposalPermalink_voter_key',
      ).on(table.proposalPermalink, table.voter),
    }
  },
)

export const groupProposalVoteChoice = mysqlTable(
  'GroupProposalVoteChoice',
  {
    proposalPermalink: varchar('proposalPermalink', { length: 191 }).notNull(),
    choice: varchar('choice', { length: 191 }).notNull(),
    power: decimal('power', { precision: 65, scale: 30 }).notNull(),
  },
  (table) => {
    return {
      groupProposalVoteChoiceChoiceProposalPermalink: primaryKey(
        table.choice,
        table.proposalPermalink,
      ),
    }
  },
)

export const storage = mysqlTable(
  'Storage',
  {
    permalink: varchar('permalink', { length: 191 }).notNull(),
    data: json('data').notNull(),
  },
  (table) => {
    return {
      storagePermalink: primaryKey(table.permalink),
    }
  },
)

export const subscription = mysqlTable(
  'Subscription',
  {
    communityId: varchar('communityId', { length: 191 }).notNull(),
    subscriber: varchar('subscriber', { length: 191 }).notNull(),
    ts: timestamp('ts', { mode: 'date' }).notNull(),
  },
  (table) => {
    return {
      subscriptionCommunityIdSubscriber: primaryKey(
        table.communityId,
        table.subscriber,
      ),
    }
  },
)

export const uploadBuffer = mysqlTable(
  'UploadBuffer',
  {
    key: varchar('key', { length: 191 }).notNull(),
    metadata: json('metadata').notNull(),
    type: varchar('type', { length: 191 }).notNull(),
    data: text('data').notNull(),
    ts: timestamp('ts', { mode: 'date' }).notNull(),
  },
  (table) => {
    return {
      uploadBufferKey: primaryKey(table.key),
    }
  },
)

export const table = {
  activity,
  community,
  grant,
  grantProposal,
  grantProposalSelect,
  grantProposalVote,
  grantProposalVoteChoice,
  group,
  groupProposal,
  groupProposalVote,
  groupProposalVoteChoice,
  storage,
  subscription,
  uploadBuffer,
}
