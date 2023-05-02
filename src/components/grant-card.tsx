import clsx from 'clsx'
import Link from 'next/link'
import { useMemo } from 'react'

import { GrantPhase } from '../utils/phase'
import { permalink2Id } from '../utils/permalink'
import { Authorized } from '../utils/schemas/authorship'
import { Grant } from '../utils/schemas/grant'
import { formatDurationMs } from '../utils/time'

export default function GrantCard(props: {
  communityId: string
  grant: Authorized<Grant> & {
    permalink: string
    proposals: number
    ts: Date
    tsAnnouncing: Date | null
    tsProposing: Date | null
    tsVoting: Date | null
  }
}) {
  const now = useMemo(() => Date.now(), [])
  const phase = useMemo(
    () =>
      props.grant.tsAnnouncing &&
      props.grant.tsProposing &&
      props.grant.tsVoting
        ? now < props.grant.tsAnnouncing.getTime()
          ? GrantPhase.ANNOUNCING
          : now < props.grant.tsProposing.getTime()
          ? GrantPhase.PROPOSING
          : now < props.grant.tsVoting.getTime()
          ? GrantPhase.VOTING
          : GrantPhase.ENDED
        : GrantPhase.CONFIRMING,
    [
      props.grant.tsAnnouncing,
      props.grant.tsProposing,
      props.grant.tsVoting,
      now,
    ],
  )

  return (
    <Link
      shallow
      href={`/${props.communityId}/grant/${permalink2Id(
        props.grant.permalink,
      )}`}
      className="block divide-y rounded-md border transition-colors focus-within:ring-2 focus-within:ring-primary-300 focus-within:ring-offset-2 hover:border-primary-500 hover:bg-gray-50"
    >
      <div className="w-full p-4">
        <p className="truncate text-lg font-medium text-gray-800">
          {props.grant.name}
        </p>
        {props.grant?.introduction ? (
          <p className="line-clamp-3 text-gray-600">
            {props.grant.introduction}
          </p>
        ) : null}
      </div>
      <div className="flex w-full divide-x rounded-b-md bg-gray-50 text-sm">
        <div className="w-0 flex-1 px-4 py-2">
          <p className="text-gray-400">Funding</p>
          <p className="truncate">
            {props.grant.funding[0][0]}&nbsp;X&nbsp;
            {props.grant.funding[0][1]}
          </p>
        </div>
        <div className="w-0 flex-1 px-4 py-2">
          {phase === GrantPhase.CONFIRMING ? (
            <>
              <p className="truncate text-gray-400">Transaction confirming</p>
              <p className="truncate">
                <PhaseDot value={phase} className="mb-0.5 mr-1.5" />
                in about 5 minutes
              </p>
            </>
          ) : phase === GrantPhase.ANNOUNCING && props.grant.tsAnnouncing ? (
            <>
              <p className="text-gray-400">Voting starts</p>
              <p>
                <PhaseDot value={phase} className="mb-0.5 mr-1.5" />
                in&nbsp;
                {formatDurationMs(props.grant.tsAnnouncing.getTime() - now)}
              </p>
            </>
          ) : phase === GrantPhase.PROPOSING && props.grant.tsProposing ? (
            <>
              <p className="text-gray-400">Proposing ends</p>
              <p>
                <PhaseDot value={phase} className="mb-0.5 mr-1.5" />
                in&nbsp;
                {formatDurationMs(props.grant.tsProposing.getTime() - now)}
              </p>
            </>
          ) : phase === GrantPhase.VOTING && props.grant.tsVoting ? (
            <>
              <p className="text-gray-400">Voting ends</p>
              <p>
                <PhaseDot value={phase} className="mb-0.5 mr-1.5" />
                in&nbsp;
                {formatDurationMs(props.grant.tsVoting.getTime() - now)}
              </p>
            </>
          ) : phase === GrantPhase.ENDED && props.grant.tsVoting ? (
            <>
              <p className="text-gray-400">Voting ended</p>
              <p>
                <PhaseDot value={phase} className="mb-0.5 mr-1.5" />
                {formatDurationMs(props.grant.tsVoting.getTime() - now)}
                &nbsp;ago
              </p>
            </>
          ) : null}
        </div>
        <div className="hidden w-0 flex-1 px-4 py-2 sm:block">
          <p className="text-gray-400">Proposals</p>
          <p>{props.grant.proposals}</p>
        </div>
      </div>
    </Link>
  )
}

function PhaseDot(props: { value?: GrantPhase; className?: string }) {
  return (
    <svg
      className={clsx(
        'mb-0.5 mr-1.5 inline h-2 w-2',
        props.value
          ? {
              [GrantPhase.CONFIRMING]: 'text-amber-400',
              [GrantPhase.ANNOUNCING]: 'text-sky-400',
              [GrantPhase.PROPOSING]: 'text-indigo-400',
              [GrantPhase.VOTING]: 'text-lime-400',
              [GrantPhase.ENDED]: 'text-gray-400',
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
