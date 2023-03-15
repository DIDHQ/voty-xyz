import { PlusIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { useId } from 'react'
import { Tooltip } from 'react-tooltip'

import useStatus from '../hooks/use-status'
import { Group } from '../utils/schemas/group'
import Button from './basic/button'

export default function CreateProposalButton(props: {
  entry?: string
  community?: string
  group?: Group
  className?: string
}) {
  const { data: status } = useStatus(props.community)
  const id = useId()

  return status?.timestamp && props.group ? (
    <Link
      href={`/${props.entry}/${props.group.id}/create`}
      className={props.className}
    >
      <Button primary icon={PlusIcon}>
        {props.group.extension.type === 'grant' ? 'Round' : 'Proposal'}
      </Button>
    </Link>
  ) : (
    <>
      <div
        data-tooltip-id={id}
        data-tooltip-place="left"
        className={props.className}
      >
        <Button primary disabled icon={PlusIcon}>
          {props.group?.extension.type === 'grant' ? 'Round' : 'Proposal'}
        </Button>
      </div>
      <Tooltip id={id} className="rounded">
        Waiting for transaction (in about 5 minutes)
      </Tooltip>
    </>
  )
}
