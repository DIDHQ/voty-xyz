import { useMemo } from 'react'

import useStatus from '../hooks/use-status'
import { getGroupProposalPhase, GroupProposalPhase } from '../utils/phase'
import type { Group } from '../utils/schemas/v1/group'

export default function GroupProposalPhaseText(props: {
  groupProposalPermalink?: string
  phase?: Group['duration']
}) {
  const { data: status, isLoading } = useStatus(props.groupProposalPermalink)
  const phase = useMemo(
    () => getGroupProposalPhase(new Date(), status?.timestamp, props.phase),
    [props.phase, status?.timestamp],
  )

  return isLoading ? null : (
    <span
      className={
        phase
          ? {
              [GroupProposalPhase.CONFIRMING]: 'text-amber-600',
              [GroupProposalPhase.ANNOUNCING]: 'text-sky-600',
              [GroupProposalPhase.VOTING]: 'text-lime-600',
              [GroupProposalPhase.ENDED]: 'text-gray-600',
            }[phase]
          : undefined
      }
    >
      {phase}
    </span>
  )
}
