import { useMemo } from 'react'
import clsx from 'clsx'

import useStatus from '../hooks/use-status'
import { GrantPhase, getGrantPhase } from '../utils/phase'
import { Grant } from '../utils/schemas/v1/grant'
import { format2Time, formatTime } from '../utils/time'
import { DetailList } from './basic/detail'

export default function GrantCurrentPhase(props: {
  grantPermalink?: string
  duration?: Grant['duration']
}) {
  const { data: status } = useStatus(props.grantPermalink)
  const phase = useMemo(
    () => getGrantPhase(new Date(), status?.timestamp, props.duration),
    [props.duration, status?.timestamp],
  )

  return (
    <DetailList title="Grant current phase">
      <div
        className={clsx(
          'flex flex-col space-y-1 border-l-4 py-2 pl-4 font-medium',
          {
            [GrantPhase.CONFIRMING]: 'border-amber-500',
            [GrantPhase.ANNOUNCING]: 'border-sky-500',
            [GrantPhase.PROPOSING]: 'border-indigo-500',
            [GrantPhase.VOTING]: 'border-lime-500',
            [GrantPhase.ENDED]: 'border-gray-500',
          }[phase],
        )}
      >
        {!status ? (
          <>
            <span className="text-sm text-gray-400">...</span>
            <span className="text-sm text-gray-600">...</span>
          </>
        ) : phase === GrantPhase.CONFIRMING ? (
          <>
            <span className="text-sm text-gray-400">
              Awaiting blockchain confirmation
            </span>
            <span className="text-sm text-gray-600">in about 5 minutes</span>
          </>
        ) : phase === GrantPhase.ANNOUNCING ? (
          <>
            <span className="text-sm text-gray-400">
              Announcing for publicity
            </span>
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
        ) : phase === GrantPhase.PROPOSING ? (
          <>
            <span className="text-sm text-gray-400">Proposing</span>
            <span className="text-sm text-gray-600">
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
            <span className="text-sm text-gray-400">Voting</span>
            <span className="text-sm text-gray-600">
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
            <span className="text-sm text-gray-400">Ended</span>
            <span className="text-sm text-gray-600">
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
