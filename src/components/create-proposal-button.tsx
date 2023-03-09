import { PlusIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { useId } from 'react'
import { Tooltip } from 'react-tooltip'

import useStatus from '../hooks/use-status'
import Button from './basic/button'

export default function CreateProposalButton(props: {
  entry?: string
  workgroup?: string
  community?: string
  className?: string
}) {
  const { data: status } = useStatus(props.community)
  const id = useId()

  return status?.timestamp ? (
    <Link
      href={`/${props.entry}/${props.workgroup}/create`}
      className={props.className}
    >
      <Button primary icon={PlusIcon}>
        Proposal
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
          Proposal
        </Button>
      </div>
      <Tooltip id={id} className="rounded">
        Waiting for workgroup transaction (in about 5 minutes)
      </Tooltip>
    </>
  )
}
