import { clsx } from 'clsx'
import Link from 'next/link'
import { useMemo } from 'react'

import { GroupProposalPhase } from '../utils/phase'
import { permalink2Id } from '../utils/permalink'
import { Authorized } from '../utils/schemas/basic/authorship'
import { GroupProposal } from '../utils/schemas/v1/group-proposal'
import { formatDurationMs } from '../utils/time'
import useNow from '../hooks/use-now'
import { formatDid } from '../utils/did/utils'
import Thumbnail from './basic/thumbnail'

export default function GroupProposalCard(props: {
  groupProposal: Authorized<GroupProposal> & {
    images: string[]
    permalink: string
    communityId: string
    groupId: string
    votes: number
    ts: Date
    tsAnnouncing: Date | null
    tsVoting: Date | null
  }
}) {
  const now = useNow()
  const phase = useMemo(
    () =>
      props.groupProposal.tsAnnouncing && props.groupProposal.tsVoting
        ? now.getTime() < props.groupProposal.tsAnnouncing.getTime()
          ? GroupProposalPhase.ANNOUNCING
          : now.getTime() < props.groupProposal.tsVoting.getTime()
          ? GroupProposalPhase.VOTING
          : GroupProposalPhase.ENDED
        : GroupProposalPhase.CONFIRMING,
    [props.groupProposal.tsAnnouncing, props.groupProposal.tsVoting, now],
  )

  return (
    <Link
      shallow
      href={`/${props.groupProposal.communityId}/group/${
        props.groupProposal.groupId
      }/proposal/${permalink2Id(props.groupProposal.permalink)}`}
      className="block divide-y rounded-md border transition-colors focus-within:ring-2 focus-within:ring-primary-300 focus-within:ring-offset-2 hover:border-primary-500 hover:bg-gray-50"
    >
      <div className="flex w-full p-4">
        <div className="w-0 flex-1">
          <p className="truncate text-lg font-medium text-gray-800">
            {props.groupProposal.title}
          </p>
          <p className="line-clamp-3 text-gray-600">
            {props.groupProposal.content}
          </p>
        </div>
        <Thumbnail
          src={props.groupProposal.images[0]}
          className="ml-4 shrink-0"
        />
      </div>
      <div className="flex w-full divide-x rounded-b-md bg-gray-50 text-sm">
        <div className="w-0 flex-1 px-4 py-2">
          <p className="text-gray-400">Proposer</p>
          <p className="truncate">
            {formatDid(props.groupProposal.authorship.author)}
          </p>
        </div>
        <div className="w-0 flex-1 px-4 py-2">
          {phase === GroupProposalPhase.CONFIRMING ? (
            <>
              <p className="truncate text-gray-400">Transaction confirming</p>
              <p className="truncate">
                <PhaseDot value={phase} className="mb-0.5 mr-1.5" />
                in about 5 minutes
              </p>
            </>
          ) : phase === GroupProposalPhase.ANNOUNCING &&
            props.groupProposal.tsAnnouncing ? (
            <>
              <p className="text-gray-400">Voting starts</p>
              <p>
                <PhaseDot value={phase} className="mb-0.5 mr-1.5" />
                in{' '}
                {formatDurationMs(
                  props.groupProposal.tsAnnouncing.getTime() - now.getTime(),
                )}
              </p>
            </>
          ) : phase === GroupProposalPhase.VOTING &&
            props.groupProposal.tsVoting ? (
            <>
              <p className="text-gray-400">Voting ends</p>
              <p>
                <PhaseDot value={phase} className="mb-0.5 mr-1.5" />
                in{' '}
                {formatDurationMs(
                  props.groupProposal.tsVoting.getTime() - now.getTime(),
                )}
              </p>
            </>
          ) : phase === GroupProposalPhase.ENDED &&
            props.groupProposal.tsVoting ? (
            <>
              <p className="text-gray-400">Voting ended</p>
              <p>
                <PhaseDot value={phase} className="mb-0.5 mr-1.5" />
                {formatDurationMs(
                  props.groupProposal.tsVoting.getTime() - now.getTime(),
                )}{' '}
                ago
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

function PhaseDot(props: { value?: GroupProposalPhase; className?: string }) {
  return (
    <svg
      className={clsx(
        'mb-0.5 mr-1.5 inline h-2 w-2',
        props.value
          ? {
              [GroupProposalPhase.CONFIRMING]: 'text-amber-400',
              [GroupProposalPhase.ANNOUNCING]: 'text-sky-400',
              [GroupProposalPhase.VOTING]: 'text-lime-400',
              [GroupProposalPhase.ENDED]: 'text-gray-400',
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
