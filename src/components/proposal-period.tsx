import clsx from 'clsx'
import { useMemo } from 'react'

import useStatus from '../hooks/use-status'
import { getPeriod, Period } from '../utils/period'
import type { Workgroup } from '../utils/schemas/workgroup'

export default function ProposalPeriod(props: {
  proposal?: string
  duration?: Workgroup['duration']
  className?: string
}) {
  const { data: status, isLoading } = useStatus(props.proposal)
  const period = useMemo(
    () => getPeriod(new Date(), status?.timestamp, props.duration),
    [props.duration, status?.timestamp],
  )

  return isLoading ? null : (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium',
        period
          ? {
              [Period.PENDING]: 'bg-gray-100 text-gray-800',
              [Period.ANNOUNCING]: 'bg-yellow-100 text-yellow-800',
              [Period.ADDING_OPTION]: 'bg-blue-100 text-blue-800',
              [Period.VOTING]: 'bg-green-100 text-green-800',
              [Period.ENDED]: 'bg-red-100 text-red-800',
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
                [Period.PENDING]: 'text-gray-400',
                [Period.ANNOUNCING]: 'text-yellow-400',
                [Period.ADDING_OPTION]: 'text-blue-400',
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
