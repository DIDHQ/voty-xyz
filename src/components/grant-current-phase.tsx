import { useMemo } from 'react'

import useStatus from '../hooks/use-status'
import { GrantPhase, getGrantPhase } from '../utils/phase'
import { Grant } from '../utils/schemas/v1/grant'
import { format2Time, formatTime } from '../utils/time'
import useNow from '../hooks/use-now'
import Card from './basic/card'
import { PhaseInfo, PhaseInfoSection } from './phase-info'

export default function GrantCurrentPhase(props: {
  grantPermalink?: string
  duration?: Grant['duration']
}) {
  const { data: status } = useStatus(props.grantPermalink)
  const now = useNow()
  const phase = useMemo(
    () => getGrantPhase(now, status?.timestamp, props.duration),
    [now, props.duration, status?.timestamp],
  )

  return (
    <Card title="Grant phase">
      {!status ? (
        <div className="text-strong">...</div>
      ) : phase === GrantPhase.CONFIRMING ? (
        <PhaseInfo
          status="Awaiting blockchain confirmation"
          statusColor="yellow"
          time="about 5 minutes"
          timeLabel="Estimated Time"
        />
      ) : phase === GrantPhase.ANNOUNCING ? (
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
                      (props.duration.announcing + props.duration.proposing) *
                        1000,
                  )
                : '...'}
            </div>
          </PhaseInfoSection>
        </PhaseInfo>
      ) : phase === GrantPhase.PROPOSING ? (
        <PhaseInfo
          status="Proposing"
          statusColor="blue"
          time={
            status?.timestamp && props.duration
              ? format2Time(
                  status.timestamp.getTime() + props.duration.announcing * 1000,
                  status.timestamp.getTime() +
                    (props.duration.announcing + props.duration.proposing) *
                      1000,
                )
              : '...'
          }
          timeLabel="Duration"
        >
          <PhaseInfoSection title="Upcoming: Voting">
            <div className="mt-2 text-sm font-medium text-strong">
              {status?.timestamp && props.duration
                ? format2Time(
                    status.timestamp.getTime() +
                      (props.duration.announcing + props.duration.proposing) *
                        1000,
                    status.timestamp.getTime() +
                      (props.duration.announcing +
                        props.duration.proposing +
                        props.duration.voting) *
                        1000,
                  )
                : '...'}
            </div>
          </PhaseInfoSection>
        </PhaseInfo>
      ) : phase === GrantPhase.VOTING ? (
        <PhaseInfo
          status="Voting"
          statusColor="green"
          time={
            status?.timestamp && props.duration
              ? format2Time(
                  status.timestamp.getTime() +
                    (props.duration.announcing + props.duration.proposing) *
                      1000,
                  status.timestamp.getTime() +
                    (props.duration.announcing +
                      props.duration.proposing +
                      props.duration.voting) *
                      1000,
                )
              : '...'
          }
          timeLabel="Duration"
        />
      ) : phase === GrantPhase.ENDED ? (
        <PhaseInfo
          status="Ended"
          time={
            status?.timestamp && props.duration
              ? `${formatTime(
                  status.timestamp.getTime() +
                    (props.duration.announcing +
                      props.duration.proposing +
                      props.duration.voting) *
                      1000,
                )}`
              : '...'
          }
          timeLabel="Ended at"
        />
      ) : null}
    </Card>
  )
}
