import { useMemo } from 'react'

import useStatus from '../hooks/use-status'
import { Group } from '../utils/schemas/v1/group'
import { format2Time, formatTime } from '../utils/time'
import { GroupProposalPhase, getGroupProposalPhase } from '../utils/phase'
import useNow from '../hooks/use-now'
import Card from './basic/card'
import { PhaseInfo, PhaseInfoSection } from './phase-info'

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
    <Card title="Proposal phase">
      {!status ? (
        <div className="text-strong">...</div>
      ) : phase === GroupProposalPhase.CONFIRMING ? (
        <PhaseInfo
          status="Awaiting blockchain confirmation"
          statusColor="yellow"
          time="about 5 minutes"
          timeLabel="Estimated Time"
        />
      ) : phase === GroupProposalPhase.ANNOUNCING ? (
        <PhaseInfo
          status="Announcing for publicity"
          statusColor="blue"
          time={
            status?.timestamp && props.duration
              ? format2Time(
                  status.timestamp.getTime(),
                  status.timestamp.getTime() + props.duration.announcing * 1000,
                )
              : '...'
          }
          timeLabel="Duration"
        >
          <PhaseInfoSection title="Upcoming: Proposing">
            <div className="mt-2 text-sm font-medium text-strong">
              {status?.timestamp && props.duration
                ? format2Time(
                    status.timestamp.getTime() +
                      props.duration.announcing * 1000,
                    status.timestamp.getTime() +
                      (props.duration.announcing + props.duration.voting) *
                        1000,
                  )
                : '...'}
            </div>
          </PhaseInfoSection>
        </PhaseInfo>
      ) : phase === GroupProposalPhase.VOTING ? (
        <PhaseInfo
          status="Voting"
          statusColor="green"
          time={
            status?.timestamp && props.duration
              ? format2Time(
                  status.timestamp.getTime() + props.duration.announcing * 1000,
                  status.timestamp.getTime() +
                    (props.duration.announcing + props.duration.voting) * 1000,
                )
              : '...'
          }
          timeLabel="Duration"
        />
      ) : phase === GroupProposalPhase.ENDED ? (
        <PhaseInfo
          status="Ended"
          time={
            status?.timestamp && props.duration
              ? `${formatTime(
                  status.timestamp.getTime() +
                    (props.duration.announcing + props.duration.voting) * 1000,
                )}`
              : '...'
          }
          timeLabel="Ended at"
        />
      ) : null}
    </Card>
  )
}
