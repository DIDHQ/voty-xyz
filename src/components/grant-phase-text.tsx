import { useMemo } from 'react'

import useStatus from '../hooks/use-status'
import { getGrantPhase, GrantPhase } from '../utils/phase'
import type { Grant } from '../utils/schemas/v1/grant'

export default function GrantPhaseText(props: {
  grantPermalink?: string
  phase?: Grant['duration']
}) {
  const { data: status, isLoading } = useStatus(props.grantPermalink)
  const phase = useMemo(
    () => getGrantPhase(new Date(), status?.timestamp, props.phase),
    [props.phase, status?.timestamp],
  )

  return isLoading ? null : (
    <span
      className={
        phase
          ? {
              [GrantPhase.CONFIRMING]: 'text-amber-600',
              [GrantPhase.ANNOUNCING]: 'text-sky-600',
              [GrantPhase.PROPOSING]: 'text-indigo-600',
              [GrantPhase.VOTING]: 'text-lime-600',
              [GrantPhase.ENDED]: 'text-gray-600',
            }[phase]
          : undefined
      }
    >
      {phase}
    </span>
  )
}
