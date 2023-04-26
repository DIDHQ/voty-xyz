import clsx from 'clsx'
import Link from 'next/link'
import { useMemo } from 'react'

import { Phase } from '../utils/phase'
import { permalink2Id } from '../utils/permalink'
import { Authorized } from '../utils/schemas/authorship'
import { GroupProposal } from '../utils/schemas/group-proposal'
import { formatDurationMs } from '../utils/time'

export default function GroupProposalCard(props: {
  groupProposal: Authorized<GroupProposal> & {
    permalink: string
    votes: number
    ts: Date
    tsPending: Date | null
    tsVoting: Date | null
  }
}) {
  const now = useMemo(() => Date.now(), [])
  const phase = useMemo(
    () =>
      props.groupProposal.tsPending && props.groupProposal.tsVoting
        ? now < props.groupProposal.tsPending.getTime()
          ? Phase.ANNOUNCING
          : now < props.groupProposal.tsVoting.getTime()
          ? Phase.VOTING
          : Phase.ENDED
        : Phase.CONFIRMING,
    [props.groupProposal.tsPending, props.groupProposal.tsVoting, now],
  )

  return (
    <Link
      shallow
      href={`/proposal/${permalink2Id(props.groupProposal.permalink)}`}
      className="block divide-y rounded-md border transition-colors focus-within:ring-2 focus-within:ring-primary-300 focus-within:ring-offset-2 hover:border-primary-500 hover:bg-gray-50"
    >
      <div className="w-full p-4">
        <p className="truncate text-lg font-medium text-gray-800">
          {props.groupProposal.title}
        </p>
        {props.groupProposal.extension?.content ? (
          <p className="line-clamp-3 text-gray-600">
            {props.groupProposal.extension.content}
          </p>
        ) : null}
      </div>
      <div className="flex w-full divide-x rounded-b-md bg-gray-50 text-sm">
        <div className="w-0 flex-1 px-4 py-2">
          <p className="text-gray-400">Proposer</p>
          <p className="truncate">{props.groupProposal.authorship.author}</p>
        </div>
        <div className="w-0 flex-1 px-4 py-2">
          {phase === Phase.CONFIRMING ? (
            <>
              <p className="truncate text-gray-400">Transaction confirming</p>
              <p className="truncate">
                <PhaseDot value={phase} className="mb-0.5 mr-1.5" />
                in about 5 minutes
              </p>
            </>
          ) : phase === Phase.ANNOUNCING && props.groupProposal.tsPending ? (
            <>
              <p className="text-gray-400">Voting starts</p>
              <p>
                <PhaseDot value={phase} className="mb-0.5 mr-1.5" />
                in&nbsp;
                {formatDurationMs(
                  props.groupProposal.tsPending.getTime() - now,
                )}
              </p>
            </>
          ) : phase === Phase.VOTING && props.groupProposal.tsVoting ? (
            <>
              <p className="text-gray-400">Voting ends</p>
              <p>
                <PhaseDot value={phase} className="mb-0.5 mr-1.5" />
                in&nbsp;
                {formatDurationMs(props.groupProposal.tsVoting.getTime() - now)}
              </p>
            </>
          ) : phase === Phase.ENDED && props.groupProposal.tsVoting ? (
            <>
              <p className="text-gray-400">Voting ended</p>
              <p>
                <PhaseDot value={phase} className="mb-0.5 mr-1.5" />
                {formatDurationMs(props.groupProposal.tsVoting.getTime() - now)}
                &nbsp;ago
              </p>
            </>
          ) : null}
        </div>
        <div className="hidden w-0 flex-1 px-4 py-2 sm:block">
          <p className="text-gray-400">Votes</p>
          <p>{props.groupProposal.votes}</p>
        </div>
      </div>
    </Link>
  )
}

function PhaseDot(props: { value?: Phase; className?: string }) {
  return (
    <svg
      className={clsx(
        'mb-0.5 mr-1.5 inline h-2 w-2',
        props.value
          ? {
              [Phase.CONFIRMING]: 'text-amber-400',
              [Phase.ANNOUNCING]: 'text-sky-400',
              [Phase.VOTING]: 'text-lime-400',
              [Phase.ENDED]: 'text-gray-400',
            }[props.value]
          : undefined,
        props.className,
      )}
      fill="currentColor"
      viewBox="0 0 8 8"
    >
      {props.value ? <circle cx={4} cy={4} r={3} /> : null}
    </svg>
  )
}
