import Link from 'next/link'
import { TrophyIcon } from '@heroicons/react/20/solid'

import { permalink2Id } from '../utils/permalink'
import { Authorized } from '../utils/schemas/basic/authorship'
import { GrantProposal } from '../utils/schemas/v1/grant-proposal'
import { formatDurationMs } from '../utils/time'
import useNow from '../hooks/use-now'
import { formatDid } from '../utils/did/utils'
import Tooltip from './basic/tooltip'

export default function GrantProposalCard(props: {
  communityId: string
  grantProposal: Authorized<GrantProposal> & {
    permalink: string
    votes: number
    ts: Date
  }
  funding?: string
}) {
  const now = useNow()

  return (
    <Link
      shallow
      href={`/${props.communityId}/grant/${permalink2Id(
        props.grantProposal.grant,
      )}/proposal/${permalink2Id(props.grantProposal.permalink)}`}
      className="block divide-y rounded-md border transition-colors focus-within:ring-2 focus-within:ring-primary-300 focus-within:ring-offset-2 hover:border-primary-500 hover:bg-gray-50"
    >
      <div className="w-full p-4">
        {props.funding ? (
          <Tooltip
            place="top"
            text={`This proposal won ${props.funding}`}
            className="float-right"
          >
            <TrophyIcon className="h-5 w-5 text-amber-600" />
          </Tooltip>
        ) : null}
        <p className="truncate text-lg font-medium text-gray-800">
          {props.grantProposal.title}
        </p>
        {props.grantProposal?.content ? (
          <p className="line-clamp-3 text-gray-600">
            {props.grantProposal.content}
          </p>
        ) : null}
      </div>
      <div className="flex w-full divide-x rounded-b-md bg-gray-50 text-sm">
        <div className="w-0 flex-1 px-4 py-2">
          <p className="text-gray-400">Proposer</p>
          <p className="truncate">
            {formatDid(props.grantProposal.authorship.author)}
          </p>
        </div>
        <div className="w-0 flex-1 px-4 py-2">
          <p className="truncate text-gray-400">Proposed at</p>
          <p className="truncate">
            {formatDurationMs(props.grantProposal.ts.getTime() - now.getTime())}{' '}
            ago
          </p>
        </div>
        <div className="hidden w-0 flex-1 px-4 py-2 sm:block">
          <p className="text-gray-400">Votes</p>
          <p>{props.grantProposal.votes}</p>
        </div>
      </div>
    </Link>
  )
}
