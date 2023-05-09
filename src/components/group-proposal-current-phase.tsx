import { useMemo } from 'react'

import useStatus from '../hooks/use-status'
import { Group } from '../utils/schemas/v1/group'
import { format2Time, formatTime } from '../utils/time'
import { DetailList } from './basic/detail'
import { GroupProposalPhase, getGroupProposalPhase } from '../utils/phase'

export default function GroupProposalCurrentPhase(props: {
  groupProposalPermalink?: string
  duration?: Group['duration']
}) {
  const { data: status } = useStatus(props.groupProposalPermalink)
  const phase = useMemo(
    () => getGroupProposalPhase(new Date(), status?.timestamp, props.duration),
    [props.duration, status?.timestamp],
  )

  return (
    <DetailList title="Proposal current phase">
      <div className="flex flex-col space-y-1 border-l-4 border-amber-500 py-2 pl-4 font-medium">
        {phase === GroupProposalPhase.CONFIRMING ? (
          <>
            <span className="text-sm text-gray-400">Confirming</span>
            <span className="text-sm text-gray-600">in about 5 minutes</span>
          </>
        ) : phase === GroupProposalPhase.ANNOUNCING ? (
          <>
            <span className="text-sm text-gray-400">Announcing</span>
            <span className="text-sm text-gray-600">
              {status?.timestamp && props.duration
                ? format2Time(
                    status.timestamp.getTime(),
                    status.timestamp.getTime() +
                      props.duration.announcing * 1000,
                  )
                : '...'}
            </span>
          </>
        ) : phase === GroupProposalPhase.VOTING ? (
          <>
            <span className="text-sm text-gray-400">Voting</span>
            <span className="text-sm text-gray-600">
              {status?.timestamp && props.duration
                ? format2Time(
                    status.timestamp.getTime(),
                    status.timestamp.getTime() +
                      (props.duration.announcing + props.duration.voting) *
                        1000,
                  )
                : '...'}
            </span>
          </>
        ) : phase === GroupProposalPhase.ENDED ? (
          <>
            <span className="text-sm text-gray-400">Ended at</span>
            <span className="text-sm text-gray-600">
              {status?.timestamp && props.duration
                ? formatTime(
                    status.timestamp.getTime() +
                      (props.duration.announcing + props.duration.voting) *
                        1000,
                  )
                : '...'}
            </span>
          </>
        ) : null}
      </div>
    </DetailList>
  )
}
