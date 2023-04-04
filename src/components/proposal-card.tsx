import clsx from 'clsx'
import Link from 'next/link'
import { useMemo } from 'react'

import { Phase } from '../utils/phase'
import { permalink2Id } from '../utils/permalink'
import { Authorized } from '../utils/schemas/authorship'
import { Group } from '../utils/schemas/group'
import { Proposal } from '../utils/schemas/proposal'
import { formatDurationMs } from '../utils/time'

export default function ProposalCard(props: {
  proposal: Authorized<Proposal> & {
    permalink: string
    g: Group
    votes: number
    options_count: number
    ts: Date
    ts_announcing: Date | null
    ts_adding_option: Date | null
    ts_voting: Date | null
  }
}) {
  const group = props.proposal.g
  const now = useMemo(() => Date.now(), [])
  const phase = useMemo(
    () =>
      props.proposal.ts_announcing && props.proposal.ts_voting
        ? now < props.proposal.ts_announcing.getTime()
          ? Phase.ANNOUNCING
          : props.proposal.ts_adding_option &&
            now < props.proposal.ts_adding_option.getTime()
          ? Phase.PROPOSING
          : now < props.proposal.ts_voting.getTime()
          ? Phase.VOTING
          : Phase.ENDED
        : Phase.CONFIRMING,
    [
      props.proposal.ts_announcing,
      props.proposal.ts_voting,
      props.proposal.ts_adding_option,
      now,
    ],
  )

  return (
    <Link
      shallow
      href={`/${
        group.extension.type === 'grant' ? 'round' : 'proposal'
      }/${permalink2Id(props.proposal.permalink)}`}
      className="block divide-y rounded-md border transition-colors focus-within:ring-2 focus-within:ring-primary-300 focus-within:ring-offset-2 hover:border-primary-500 hover:bg-gray-50"
    >
      <div className="w-full p-4">
        <p className="truncate text-lg font-medium text-gray-800">
          {props.proposal.title}
        </p>
        {props.proposal.extension?.content ? (
          <p className="line-clamp-3 text-gray-600">
            {props.proposal.extension.content}
          </p>
        ) : null}
      </div>
      <div className="flex w-full divide-x rounded-b-md bg-gray-50 text-sm">
        <div className="w-0 flex-1 px-4 py-2">
          {group.extension.type === 'grant' &&
          props.proposal.extension?.funding?.[0] ? (
            <>
              <p>Funding</p>
              <p className="truncate text-gray-400">
                {props.proposal.extension.funding[0][0]}&nbsp;X&nbsp;
                {props.proposal.extension.funding[0][1]}
              </p>
            </>
          ) : (
            <>
              <p>Proposer</p>
              <p className="truncate text-gray-400">
                {props.proposal.authorship.author}
              </p>
            </>
          )}
        </div>
        <div className="w-0 flex-1 px-4 py-2">
          {phase === Phase.CONFIRMING ? (
            <>
              <p className="truncate">Transaction confirming</p>
              <p className="truncate text-gray-400">
                <PhaseDot value={phase} className="mb-0.5 mr-1.5" />
                in about 5 minutes
              </p>
            </>
          ) : phase === Phase.ANNOUNCING && props.proposal.ts_announcing ? (
            <>
              <p>
                {group.extension.type === 'grant' ? 'Proposing' : 'Voting'}
                &nbsp; starts
              </p>
              <p className="text-gray-400">
                <PhaseDot value={phase} className="mb-0.5 mr-1.5" />
                in&nbsp;
                {formatDurationMs(props.proposal.ts_announcing.getTime() - now)}
              </p>
            </>
          ) : phase === Phase.PROPOSING && props.proposal.ts_adding_option ? (
            <>
              <p>Proposing ends</p>
              <p className="text-gray-400">
                <PhaseDot value={phase} className="mb-0.5 mr-1.5" />
                in&nbsp;
                {formatDurationMs(
                  props.proposal.ts_adding_option.getTime() - now,
                )}
              </p>
            </>
          ) : phase === Phase.VOTING && props.proposal.ts_voting ? (
            <>
              <p>Voting ends</p>
              <p className="text-gray-400">
                <PhaseDot value={phase} className="mb-0.5 mr-1.5" />
                in&nbsp;
                {formatDurationMs(props.proposal.ts_voting.getTime() - now)}
              </p>
            </>
          ) : phase === Phase.ENDED && props.proposal.ts_voting ? (
            <>
              <p>Voting ended</p>
              <p className="text-gray-400">
                <PhaseDot value={phase} className="mb-0.5 mr-1.5" />
                {formatDurationMs(props.proposal.ts_voting.getTime() - now)}
                &nbsp;ago
              </p>
            </>
          ) : null}
        </div>
        <div className="hidden w-0 flex-1 px-4 py-2 sm:block">
          <p>{group.extension.type === 'grant' ? 'Proposals' : 'Votes'}</p>
          <p className="text-gray-400">
            {group.extension.type === 'grant'
              ? props.proposal.options_count
              : props.proposal.votes}
          </p>
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
              [Phase.CONFIRMING]: 'text-slate-400',
              [Phase.ANNOUNCING]: 'text-amber-400',
              [Phase.PROPOSING]: 'text-sky-400',
              [Phase.VOTING]: 'text-lime-400',
              [Phase.ENDED]: 'text-stone-400',
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
