import clsx from 'clsx'
import { useMemo } from 'react'

import useStatus from '../hooks/use-status'
import { getPeriod, Period } from '../utils/duration'
import { Workgroup } from '../utils/schemas/workgroup'
import { formatTime } from '../utils/time'
import { DetailList, DetailItem } from './basic/detail'

export default function ProposalSchedule(props: {
  proposal?: string
  duration: Workgroup['duration']
}) {
  const { data: status } = useStatus(props.proposal)
  const period = useMemo(
    () =>
      status?.timestamp
        ? getPeriod(Date.now() / 1000, status?.timestamp, props.duration)
        : Period.PENDING,
    [props.duration, status?.timestamp],
  )

  return (
    <DetailList title="Schedule">
      <DetailItem title="Status">
        <span
          className={clsx(
            'my-[-2px] inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium',
            period
              ? {
                  [Period.PENDING]: 'bg-gray-100 text-gray-800',
                  [Period.ANNOUNCING]: 'bg-yellow-100 text-yellow-800',
                  [Period.ADDING_OPTION]: 'bg-blue-100 text-blue-800',
                  [Period.VOTING]: 'bg-green-100 text-green-800',
                  [Period.ENDED]: 'bg-red-100 text-red-800',
                }[period]
              : undefined,
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
            <circle cx={4} cy={4} r={3} />
          </svg>
          {period}
        </span>
      </DetailItem>
      <DetailItem title="Start">
        {status?.timestamp
          ? formatTime((status.timestamp + props.duration.announcement) * 1000)
          : '-'}
      </DetailItem>
      <DetailItem title="End">
        {status?.timestamp
          ? formatTime(
              (status.timestamp +
                props.duration.announcement +
                (props.duration.adding_option || 0) +
                props.duration.voting) *
                1000,
            )
          : '-'}
      </DetailItem>
    </DetailList>
  )
}
