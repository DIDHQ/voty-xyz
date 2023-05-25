import Link from 'next/link'
import { clsx } from 'clsx'

import { permalink2Id } from '../utils/permalink'
import { Authorized } from '../utils/schemas/basic/authorship'
import { GrantProposal } from '../utils/schemas/v1/grant-proposal'
import { formatDurationMs } from '../utils/time'
import useNow from '../hooks/use-now'
import { formatDid } from '../utils/did/utils'
import { GrantPhase } from '../utils/phase'
import Tooltip from './basic/tooltip'
import { CrownIcon } from './icons'

export default function GrantProposalCard(props: {
  communityId: string
  phase: GrantPhase
  grantProposal: Authorized<GrantProposal> & {
    permalink: string
    votes: number
    readingTime: number
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
      className={clsx(
        'group block divide-y rounded-md border transition-colors focus-within:ring-2 focus-within:ring-offset-2',
        props.funding
          ? 'focus-within:ring-amber-300 hover:border-amber-500 hover:bg-amber-50'
          : 'focus-within:ring-primary-300 hover:border-primary-500 hover:bg-gray-50',
      )}
    >
      <div className="w-full p-4">
        {props.funding ? (
          <Tooltip
            place="top"
            text={`This proposal won ${props.funding}`}
            className="float-right"
          >
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10 group-hover:bg-amber-100">
              <CrownIcon className="mr-0.5 h-4 w-4 text-amber-700" />
              WON
            </span>
          </Tooltip>
        ) : null}
        <p
          className={clsx(
            'truncate text-lg font-medium',
            props.funding ? 'text-amber-600' : 'text-gray-800',
          )}
        >
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
          <p className="text-gray-400">Reading time</p>
          <p>{formatDurationMs(props.grantProposal.readingTime)}</p>
        </div>
        {props.phase === GrantPhase.VOTING ||
        props.phase === GrantPhase.ENDED ? (
          <div className="hidden w-0 flex-1 px-4 py-2 sm:block">
            <p className="text-gray-400">Votes</p>
            <p>{props.grantProposal.votes}</p>
          </div>
        ) : (
          <div className="hidden w-0 flex-1 px-4 py-2 sm:block">
            <p className="truncate text-gray-400">Proposed at</p>
            <p className="truncate">
              {formatDurationMs(
                props.grantProposal.ts.getTime() - now.getTime(),
              )}{' '}
              ago
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}
