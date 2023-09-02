import { PlusIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

import useStatus from '../hooks/use-status'
import { Group } from '../utils/schemas/v1/group'
import Button from './basic/button'
import Tooltip from './basic/tooltip'

export default function GroupProposalCreateButton(props: {
  communityId?: string
  group?: Group & { permalink: string }
  className?: string
}) {
  const { data: status } = useStatus(props.group?.permalink)

  return status?.timestamp && props.group ? (
    <Link
      href={`/${props.communityId}/group/${props.group.id}/create`}
      className={props.className}
    >
      <Button className="gap-1" icon={PlusIcon}>
        Proposal
      </Button>
    </Link>
  ) : (
    <Tooltip
      place="top"
      text="Waiting for workgroup to be confirmed (in about 5 minutes)"
    >
      <Button className="gap-1" disabled icon={PlusIcon}>
        Proposal
      </Button>
    </Tooltip>
  )
}
