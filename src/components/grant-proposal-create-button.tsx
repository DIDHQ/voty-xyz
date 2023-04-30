import { PlusIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { useMemo } from 'react'

import useStatus from '../hooks/use-status'
import { Grant } from '../utils/schemas/grant'
import Button from './basic/button'
import Tooltip from './basic/tooltip'
import { permalink2Id } from '../utils/permalink'
import { GrantPhase, getGrantPhase } from '../utils/phase'
import { formatDurationMs } from '../utils/time'

export default function GrantProposalCreateButton(props: {
  communityId?: string
  grant?: Grant & { permalink: string }
  className?: string
}) {
  const now = useMemo(() => new Date(), [])
  const { data: status } = useStatus(props.grant?.permalink)
  const phase = useMemo(
    () => getGrantPhase(now, status?.timestamp, props.grant?.duration),
    [now, props.grant?.duration, status?.timestamp],
  )

  return phase === GrantPhase.CONFIRMING ? (
    <div className={props.className}>
      <Tooltip
        place="top"
        text="Waiting for grant changes to be confirmed (in about 5 minutes)"
      >
        <Button primary disabled icon={PlusIcon}>
          Proposal
        </Button>
      </Tooltip>
    </div>
  ) : phase === GrantPhase.ANNOUNCING && status?.timestamp && props.grant ? (
    <div className={props.className}>
      <Tooltip
        place="top"
        text={`Waiting for proposing start (in ${formatDurationMs(
          status.timestamp.getTime() +
            props.grant.duration.announcing * 1000 -
            now.getTime(),
        )})`}
      >
        <Button primary disabled icon={PlusIcon}>
          Proposal
        </Button>
      </Tooltip>
    </div>
  ) : props.communityId && props.grant && phase === GrantPhase.PROPOSING ? (
    <div className={props.className}>
      <Link
        href={`/${props.communityId}/grant/${permalink2Id(
          props.grant.permalink,
        )}/create`}
      >
        <Button primary icon={PlusIcon}>
          Proposal
        </Button>
      </Link>
    </div>
  ) : null
}
