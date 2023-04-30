import Link from 'next/link'
import { useMemo } from 'react'

import { permalink2Id } from '../utils/permalink'
import { Authorized } from '../utils/schemas/authorship'
import { GrantProposal } from '../utils/schemas/grant-proposal'
import { formatDurationMs } from '../utils/time'

export default function GrantProposalCard(props: {
  grantProposal: Authorized<GrantProposal> & {
    permalink: string
    votes: number
    ts: Date
  }
}) {
  const now = useMemo(() => Date.now(), [])

  return (
    <Link
      shallow
      href={`/proposal/${permalink2Id(props.grantProposal.permalink)}`}
      className="block divide-y rounded-md border transition-colors focus-within:ring-2 focus-within:ring-primary-300 focus-within:ring-offset-2 hover:border-primary-500 hover:bg-gray-50"
    >
      <div className="w-full p-4">
        <p className="truncate text-lg font-medium text-gray-800">
          {props.grantProposal.title}
        </p>
        {props.grantProposal.extension?.content ? (
          <p className="line-clamp-3 text-gray-600">
            {props.grantProposal.extension.content}
          </p>
        ) : null}
      </div>
      <div className="flex w-full divide-x rounded-b-md bg-gray-50 text-sm">
        <div className="w-0 flex-1 px-4 py-2">
          <p className="text-gray-400">Proposer</p>
          <p className="truncate">{props.grantProposal.authorship.author}</p>
        </div>
        <div className="w-0 flex-1 px-4 py-2">
          <p className="truncate text-gray-400">Created at</p>
          <p className="truncate">
            {formatDurationMs(props.grantProposal.ts.getTime() - now)}
            &nbsp;ago
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
