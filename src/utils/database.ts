import {
  PrismaClient,
  Community as CommunityModel,
  Proposal as ProposalModel,
  Option as OptionModel,
  Vote as VoteModel,
} from '@prisma/client'
import { keyBy } from 'lodash-es'

import { DataType } from './constants'
import { Authorized } from './schemas/authorship'
import { Proved } from './schemas/proof'
import { Community } from './schemas/community'
import { Proposal } from './schemas/proposal'
import { Option } from './schemas/option'
import { Vote } from './schemas/vote'

export const database = new PrismaClient()

export async function getByPermalink<T extends DataType>(
  type: T,
  permalink: string,
) {
  const data =
    type === DataType.COMMUNITY
      ? await database.community.findUnique({ where: { permalink } })
      : type === DataType.PROPOSAL
      ? await database.proposal.findUnique({ where: { permalink } })
      : type === DataType.OPTION
      ? await database.option.findUnique({ where: { permalink } })
      : type === DataType.VOTE
      ? await database.vote.findUnique({ where: { permalink } })
      : undefined
  if (!data) {
    return
  }
  return data as T extends DataType.COMMUNITY
    ? Omit<CommunityModel, 'data'> & { data: Proved<Authorized<Community>> }
    : T extends DataType.PROPOSAL
    ? Omit<ProposalModel, 'data'> & { data: Proved<Authorized<Proposal>> }
    : T extends DataType.OPTION
    ? Omit<OptionModel, 'data'> & { data: Proved<Authorized<Option>> }
    : T extends DataType.VOTE
    ? Omit<VoteModel, 'data'> & { data: Proved<Authorized<Vote>> }
    : never
}

export async function mapByPermalinks<T extends DataType>(
  type: T,
  permalinks: string[],
) {
  const data: (CommunityModel | ProposalModel | VoteModel)[] =
    type === DataType.COMMUNITY
      ? await database.community.findMany({
          where: { permalink: { in: permalinks } },
        })
      : type === DataType.PROPOSAL
      ? await database.proposal.findMany({
          where: { permalink: { in: permalinks } },
        })
      : type === DataType.OPTION
      ? await database.option.findMany({
          where: { permalink: { in: permalinks } },
        })
      : type === DataType.VOTE
      ? await database.vote.findMany({
          where: { permalink: { in: permalinks } },
        })
      : []
  return keyBy(
    data,
    ({ permalink }) => permalink,
  ) as T extends DataType.COMMUNITY
    ? Record<
        string,
        Omit<CommunityModel, 'data'> & { data: Proved<Authorized<Community>> }
      >
    : T extends DataType.PROPOSAL
    ? Record<
        string,
        Omit<ProposalModel, 'data'> & { data: Proved<Authorized<Proposal>> }
      >
    : T extends DataType.OPTION
    ? Record<
        string,
        Omit<OptionModel, 'data'> & { data: Proved<Authorized<Option>> }
      >
    : T extends DataType.VOTE
    ? Record<
        string,
        Omit<VoteModel, 'data'> & { data: Proved<Authorized<Vote>> }
      >
    : never
}
