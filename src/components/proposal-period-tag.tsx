import clsx from 'clsx'
import { useMemo } from 'react'

import useStatus from '../hooks/use-status'
import useWorkgroup from '../hooks/use-workgroup'
import { getPeriod, Period } from '../utils/period'
import { Proposal } from '../utils/schemas/proposal'
import { trpc } from '../utils/trpc'

export default function ProposalPeriodTag(props: {
  proposal?: Proposal & { permalink: string }
  className?: string
}) {
  const { data: status, isLoading } = useStatus(props.proposal?.permalink)
  const { data: community, isLoading: isCommunityLoading } =
    trpc.community.getByPermalink.useQuery(
      { permalink: props.proposal?.community },
      { enabled: !!props.proposal?.community, refetchOnWindowFocus: false },
    )
  const workgroup = useWorkgroup(community, props.proposal?.workgroup)
  const period = useMemo(
    () => getPeriod(new Date(), status?.timestamp, workgroup?.duration),
    [workgroup?.duration, status?.timestamp],
  )

  return isLoading || isCommunityLoading ? null : (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-3 py-0.5 text-sm font-medium',
        period
          ? {
              [Period.CONFIRMING]: 'border-gray-200 bg-gray-100 text-gray-800',
              [Period.PENDING]:
                'border-yellow-200 bg-yellow-100 text-yellow-800',
              [Period.VOTING]: 'border-green-200 bg-green-100 text-green-800',
              [Period.ENDED]: 'border-red-200 bg-red-100 text-red-800',
            }[period]
          : undefined,
        props.className,
      )}
    >
      <svg
        className={clsx(
          '-ml-1 mr-1.5 h-2 w-2',
          period
            ? {
                [Period.CONFIRMING]: 'text-gray-400',
                [Period.PENDING]: 'text-yellow-400',
                [Period.VOTING]: 'text-green-400',
                [Period.ENDED]: 'text-red-400',
              }[period]
            : undefined,
        )}
        fill="currentColor"
        viewBox="0 0 8 8"
      >
        {period ? <circle cx={4} cy={4} r={3} /> : null}
      </svg>
      {period}
    </span>
  )
}
