import { useMemo } from 'react'

import useStatus from '../hooks/use-status'
import { getPeriod, Period } from '../utils/period'
import type { Workgroup } from '../utils/schemas/workgroup'

export default function ProposalPeriodText(props: {
  proposal?: string
  duration?: Workgroup['duration']
}) {
  const { data: status, isLoading } = useStatus(props.proposal)
  const period = useMemo(
    () => getPeriod(new Date(), status?.timestamp, props.duration),
    [props.duration, status?.timestamp],
  )

  return isLoading ? null : (
    <span
      className={
        period
          ? {
              [Period.CONFIRMING]: 'text-blue-600',
              [Period.PENDING]: 'text-yellow-600',
              [Period.VOTING]: 'text-green-600',
              [Period.ENDED]: 'text-gray-600',
            }[period]
          : undefined
      }
    >
      {period}
    </span>
  )
}
