import Link from 'next/link'
import { useMemo } from 'react'

import useStatus from '../hooks/use-status'
import useWorkgroup from '../hooks/use-workgroup'
import { getPeriod, Period } from '../utils/period'
import { permalink2Id } from '../utils/permalink'
import { Authorized } from '../utils/schemas/authorship'
import { Proposal } from '../utils/schemas/proposal'
import { formatDuration } from '../utils/time'
import { trpc } from '../utils/trpc'
import ProposalPeriodTag from './proposal-period-tag'

export default function ProposalCard(props: {
  proposal: Authorized<Proposal> & { permalink: string; votes: number }
}) {
  const { data: community } = trpc.community.getByPermalink.useQuery(
    { permalink: props.proposal.community },
    { refetchOnWindowFocus: false },
  )
  const workgroup = useWorkgroup(community, props.proposal.workgroup)
  const { data: status } = useStatus(props.proposal.permalink)
  const now = useMemo(() => new Date(), [])
  const period = useMemo(
    () => getPeriod(now, status?.timestamp, workgroup?.duration),
    [status?.timestamp, workgroup?.duration, now],
  )

  return (
    <Link
      shallow
      href={`/proposal/${permalink2Id(props.proposal.permalink)}`}
      className="block divide-y rounded border transition-colors focus-within:ring-2 focus-within:ring-primary-500 hover:border-primary-500 hover:bg-gray-50"
    >
      <div className="w-full p-4">
        <div className="flex w-full items-center justify-between">
          <p className="truncate text-lg font-medium text-gray-800">
            {props.proposal.title}
          </p>
          <ProposalPeriodTag proposal={props.proposal} className="ml-4" />
        </div>
        {props.proposal.extension?.content ? (
          <p className="text-gray-600 line-clamp-3">
            {props.proposal.extension.content}
          </p>
        ) : null}
      </div>
      <div className="flex w-full divide-x bg-gray-50 text-sm">
        <div className="flex-1 px-4 py-2">
          <p>Proposer</p>
          <p className="text-gray-400">{props.proposal.authorship.author}</p>
        </div>
        <div className="flex-1 px-4 py-2">
          {status?.timestamp && workgroup ? (
            period === Period.PENDING ? (
              <>
                <p>Voting starts</p>
                <p className="text-gray-400">
                  in&nbsp;
                  {formatDuration(
                    status.timestamp.getTime() / 1000 +
                      workgroup.duration.announcement -
                      now.getTime() / 1000,
                  )}
                </p>
              </>
            ) : period === Period.VOTING ? (
              <>
                <p>Voting ends</p>
                <p className="text-gray-400">
                  in&nbsp;
                  {formatDuration(
                    status.timestamp.getTime() / 1000 +
                      workgroup.duration.announcement +
                      workgroup.duration.voting -
                      now.getTime() / 1000,
                  )}
                </p>
              </>
            ) : period === Period.ENDED ? (
              <>
                <p>Voting ended</p>
                <p className="text-gray-400">
                  {formatDuration(
                    status.timestamp.getTime() / 1000 +
                      workgroup.duration.announcement +
                      workgroup.duration.voting -
                      now.getTime() / 1000,
                  )}
                  &nbsp;ago
                </p>
              </>
            ) : null
          ) : null}
        </div>
        <div className="flex-1 px-4 py-2">
          <p>Votes</p>
          <p className="text-gray-400">{props.proposal.votes}</p>
        </div>
      </div>
    </Link>
  )
}
