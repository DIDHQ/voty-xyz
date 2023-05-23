import { useMemo } from 'react'

import useStatus from '../hooks/use-status'
import { GrantPhase, getGrantPhase } from '../utils/phase'
import { Grant } from '../utils/schemas/v1/grant'
import { format2Time, formatTime } from '../utils/time'
import useNow from '../hooks/use-now'
import { DetailList } from './basic/detail'

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
    <DetailList title="Grant current phase">
      <div className="flex flex-col space-y-2 py-2 text-sm font-medium">
        {!status ? (
          <>
            <span className="text-gray-600">...</span>
            <span className="text-gray-600">...</span>
          </>
        ) : phase === GrantPhase.CONFIRMING ? (
          <>
            <span className="text-amber-600">
              Awaiting blockchain confirmation
            </span>
            <span className="text-gray-600">in about 5 minutes</span>
          </>
        ) : phase === GrantPhase.ANNOUNCING ? (
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
          </>
        ) : phase === GrantPhase.PROPOSING ? (
          <>
            <span className="text-indigo-600">Proposing</span>
            <span className="text-gray-600">
              {status?.timestamp && props.duration
                ? format2Time(
                    status.timestamp.getTime() +
                      props.duration.announcing * 1000,
                    status.timestamp.getTime() +
                      (props.duration.announcing + props.duration.proposing) *
                        1000,
                  )
                : '...'}
            </span>
          </>
        ) : phase === GrantPhase.VOTING ? (
          <>
            <span className="text-lime-600">Voting</span>
            <span className="text-gray-600">
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
            </span>
          </>
        ) : phase === GrantPhase.ENDED ? (
          <>
            <span className="text-gray-600">Ended</span>
            <span className="text-gray-600">
              {status?.timestamp && props.duration
                ? `at ${formatTime(
                    status.timestamp.getTime() +
                      (props.duration.announcing +
                        props.duration.proposing +
                        props.duration.voting) *
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
