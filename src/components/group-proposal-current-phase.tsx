import { useMemo } from 'react'
import clsx from 'clsx'

import useStatus from '../hooks/use-status'
import { Group } from '../utils/schemas/v1/group'
import { format2Time, formatTime } from '../utils/time'
import { DetailList } from './basic/detail'
import { GroupProposalPhase, getGroupProposalPhase } from '../utils/phase'
import useNow from '../hooks/use-now'

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
    <DetailList title="Proposal current phase">
      <div
        className={clsx(
          'flex flex-col space-y-1 border-l-4 py-2 pl-4 font-medium',
          {
            [GroupProposalPhase.CONFIRMING]: 'border-amber-500',
            [GroupProposalPhase.ANNOUNCING]: 'border-sky-500',
            [GroupProposalPhase.VOTING]: 'border-lime-500',
            [GroupProposalPhase.ENDED]: 'border-gray-500',
          }[phase],
        )}
      >
        {!status ? (
          <>
            <span className="text-sm text-gray-400">...</span>
            <span className="text-sm text-gray-600">...</span>
          </>
        ) : phase === GroupProposalPhase.CONFIRMING ? (
          <>
            <span className="text-sm text-gray-400">
              Awaiting blockchain confirmation
            </span>
            <span className="text-sm text-gray-600">in about 5 minutes</span>
          </>
        ) : phase === GroupProposalPhase.ANNOUNCING ? (
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
            <span className="text-sm text-gray-400">Ended</span>
            <span className="text-sm text-gray-600">
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
