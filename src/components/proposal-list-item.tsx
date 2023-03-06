import { BoltIcon, ClockIcon, HandRaisedIcon } from '@heroicons/react/20/solid'
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

export default function ProposalListItem(props: {
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
      className="-mx-4 block space-y-2 rounded p-4 transition-colors focus-within:ring-2 focus-within:ring-primary-500 hover:bg-gray-100"
    >
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
      <div className="flex w-full items-center justify-start text-sm text-gray-400">
        <HandRaisedIcon
          className="mr-1.5 h-4 w-4 shrink-0"
          aria-hidden="true"
        />
        <p>{props.proposal.authorship.author}</p>
        {period === Period.PENDING || period === Period.ANNOUNCING ? null : (
          <>
            <BoltIcon
              className="ml-4 mr-1.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <p>{props.proposal.votes}</p>
          </>
        )}
        {period === Period.ANNOUNCING && status?.timestamp && workgroup ? (
          <>
            <ClockIcon
              className="ml-4 mr-1.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <p>
              start in{' '}
              {formatDuration(
                status.timestamp.getTime() / 1000 +
                  workgroup.duration.announcement -
                  now.getTime() / 1000,
              )}
            </p>
          </>
        ) : null}
        {period === Period.VOTING && status?.timestamp && workgroup ? (
          <>
            <ClockIcon
              className="ml-4 mr-1.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <p>
              end in{' '}
              {formatDuration(
                status.timestamp.getTime() / 1000 +
                  workgroup.duration.announcement +
                  workgroup.duration.voting -
                  now.getTime() / 1000,
              )}
            </p>
          </>
        ) : null}
      </div>
    </Link>
  )
}
