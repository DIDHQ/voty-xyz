import { useMemo } from 'react'

import useStatus from '../hooks/use-status'
import { Group } from '../utils/schemas/v1/group'
import { format2Time, formatTime } from '../utils/time'
import { GroupProposalPhase, getGroupProposalPhase } from '../utils/phase'
import useNow from '../hooks/use-now'
import { DetailList } from './basic/detail'

export default function GroupProposalCurrentPhase(props: {
  groupProposalPermalink?: string
  duration?: Group['duration']
}) {
  const { data: status } = useStatus(props.groupProposalPermalink)
  const now = useNow()
  const phase = useMemo(
    () => getGroupProposalPhase(now, status?.timestamp, props.duration),
    [now, props.duration, status?.timestamp],
  )

  return (
    <DetailList title="Proposal phase">
      <div className="flex flex-col space-y-2 py-2 text-sm font-medium">
        {!status ? (
          <>
            <span className="text-gray-600">...</span>
            <span className="text-gray-600">...</span>
          </>
        ) : phase === GroupProposalPhase.CONFIRMING ? (
          <>
            <span className="text-amber-600">
              Awaiting blockchain confirmation
            </span>
            <span className="text-gray-600">about 5 minutes</span>
          </>
        ) : phase === GroupProposalPhase.ANNOUNCING ? (
          <>
            <span className="text-sky-600">Announcing for publicity</span>
            <span className="text-gray-600">
              {status?.timestamp && props.duration
                ? format2Time(
                    status.timestamp.getTime(),
                    status.timestamp.getTime() +
                      props.duration.announcing * 1000,
                  )
                : '...'}
            </span>
            <span className="text-gray-400">Upcoming: Proposing</span>
            <span className="text-gray-400">
              {status?.timestamp && props.duration
                ? format2Time(
                    status.timestamp.getTime() +
                      props.duration.announcing * 1000,
                    status.timestamp.getTime() +
                      (props.duration.announcing + props.duration.voting) *
                        1000,
                  )
                : '...'}
            </span>
          </>
        ) : phase === GroupProposalPhase.VOTING ? (
          <>
            <span className="text-lime-600">Voting</span>
            <span className="text-gray-600">
              {status?.timestamp && props.duration
                ? format2Time(
                    status.timestamp.getTime() +
                      props.duration.announcing * 1000,
                    status.timestamp.getTime() +
                      (props.duration.announcing + props.duration.voting) *
                        1000,
                  )
                : '...'}
            </span>
          </>
        ) : phase === GroupProposalPhase.ENDED ? (
          <>
            <span className="text-gray-600">Ended</span>
            <span className="text-gray-600">
              {status?.timestamp && props.duration
                ? `at ${formatTime(
                    status.timestamp.getTime() +
                      (props.duration.announcing + props.duration.voting) *
                        1000,
                  )}`
                : '...'}
            </span>
          </>
        ) : null}
      </div>
    </DetailList>
  )
}
