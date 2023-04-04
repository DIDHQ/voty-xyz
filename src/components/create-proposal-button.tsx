import { PlusIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

import useStatus from '../hooks/use-status'
import { Group } from '../utils/schemas/group'
import Button from './basic/button'
import Tooltip from './basic/tooltip'

export default function CreateProposalButton(props: {
  entry?: string
  community?: string
  group?: Group
  className?: string
}) {
  const { data: status } = useStatus(props.community)

  return status?.timestamp && props.group ? (
    <Link
      href={`/${props.entry}/${props.group.id}/create`}
      className={props.className}
    >
      <Button primary icon={PlusIcon}>
        Proposal
      </Button>
    </Link>
  ) : (
    <Tooltip
      place="top"
      text="Waiting for community changes to be confirmed (in about 5 minutes)"
    >
      <Button primary disabled icon={PlusIcon}>
        Proposal
      </Button>
    </Tooltip>
  )
}
