import { PlusIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { useMemo } from 'react'

import useDids from '../hooks/use-dids'
import useWallet from '../hooks/use-wallet'
import TextButton from './basic/text-button'

export default function CreateGroupButton(props: {
  entry?: string
  className?: string
}) {
  const { account } = useWallet()
  const { data: dids } = useDids(account)
  const isAdmin = useMemo(
    () => !!(props.entry && dids?.includes(props.entry)),
    [dids, props.entry],
  )

  return isAdmin ? (
    <Link href={`/${props.entry}/create`} className={props.className}>
      <TextButton>
        <PlusIcon className="h-5 w-5" />
      </TextButton>
    </Link>
  ) : null
}
