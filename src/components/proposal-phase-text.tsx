import { useMemo } from 'react'

import useStatus from '../hooks/use-status'
import { getPhase, Phase } from '../utils/phase'
import type { Group } from '../utils/schemas/group'

export default function ProposalPhaseText(props: {
  proposal?: string
  phase?: Group['duration']
}) {
  const { data: status, isLoading } = useStatus(props.proposal)
  const phase = useMemo(
    () => getPhase(new Date(), status?.timestamp, props.phase),
    [props.phase, status?.timestamp],
  )

  return isLoading ? null : (
    <span
      className={
        phase
          ? {
              [Phase.CONFIRMING]: 'text-amber-600',
              [Phase.ANNOUNCING]: 'text-sky-600',
              [Phase.VOTING]: 'text-lime-600',
              [Phase.ENDED]: 'text-stone-600',
            }[phase]
          : undefined
      }
    >
      {phase}
    </span>
  )
}
