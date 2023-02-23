import { PlusIcon } from '@heroicons/react/20/solid'
import { useMemo } from 'react'

import useDids from '../hooks/use-dids'
import useWallet from '../hooks/use-wallet'
import TextButton from './basic/text-button'

export default function CreateWorkgroupButton(props: {
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
    <TextButton href={`/${props.entry}/create`} className={props.className}>
      <PlusIcon className="h-5 w-5" />
    </TextButton>
  ) : null
}
