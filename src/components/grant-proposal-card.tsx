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
import Thumbnail from './basic/thumbnail'

export default function GrantProposalCard(props: {
  communityId: string
  phase: GrantPhase
  grantProposal: Authorized<GrantProposal> & {
    images: string[]
    permalink: string
    votes: number
    readingTime: number
    ts: Date
    funding?: string
  }
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
        props.grantProposal.funding
          ? 'focus-within:ring-amber-300 hover:border-amber-500 hover:bg-amber-50'
          : 'focus-within:ring-primary-300 hover:border-primary-500 hover:bg-gray-50',
      )}
    >
      <div className="flex w-full p-4">
        <div className="w-0 flex-1">
          {props.grantProposal.funding ? (
            <Tooltip
              place="top"
              text={`This proposal won ${props.grantProposal.funding}`}
              className="float-right ml-4"
            >
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10 transition-colors group-hover:bg-amber-100">
                <CrownIcon className="mr-0.5 h-4 w-4 text-amber-700" />
                WON
              </span>
            </Tooltip>
          ) : null}
          <p className="truncate text-lg font-medium text-gray-800">
            {props.grantProposal.title}
          </p>
          <p className="line-clamp-3 text-gray-600">
            {props.grantProposal.content}
          </p>
        </div>
        <Thumbnail
          src={props.grantProposal.images[0]}
          className="ml-4 shrink-0"
        />
      </div>
      <div className="flex w-full divide-x rounded-b-md bg-gray-50 text-sm">
        <div className="w-0 flex-1 px-4 py-2">
          <p className="text-gray-400">Proposer</p>
          <p className="truncate">
            {formatDid(props.grantProposal.authorship.author)}
          </p>
        </div>
        {props.phase === GrantPhase.VOTING ||
        props.phase === GrantPhase.ENDED ? (
          <div className="w-0 flex-1 px-4 py-2">
            <p className="text-gray-400">Votes</p>
            <p>{props.grantProposal.votes}</p>
          </div>
        ) : (
          <div className="w-0 flex-1 px-4 py-2">
            <p className="truncate text-gray-400">Proposed at</p>
            <p className="truncate">
              {formatDurationMs(
                props.grantProposal.ts.getTime() - now.getTime(),
              )}{' '}
              ago
            </p>
          </div>
        )}
        <div className="hidden w-0 flex-1 px-4 py-2 sm:block">
          <p className="text-gray-400">Reading time</p>
          <p>{formatDurationMs(props.grantProposal.readingTime)}</p>
        </div>
      </div>
    </Link>
  )
}
