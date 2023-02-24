import { PlusIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useId } from 'react'

import { currentDidAtom } from '../utils/atoms'
import SubscriptionList from './subscription-list'

const Tooltip = dynamic(
  () => import('react-tooltip').then(({ Tooltip }) => Tooltip),
  { ssr: false },
)

export default function Sidebar(props: { className?: string }) {
  const id = useId()
  const currentDid = useAtomValue(currentDidAtom)

  return (
    <aside className={clsx('pt-18', props.className)}>
      <SubscriptionList className="mb-3" />
      {currentDid ? (
        <>
          <Link
            href="/create"
            data-tooltip-id={id}
            data-tooltip-place="right"
            className="group flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 hover:bg-primary-600"
          >
            <PlusIcon className="h-8 w-8 text-primary-600 group-hover:text-white" />
          </Link>
          <Tooltip id={id} className="rounded-none">
            Create community
          </Tooltip>
        </>
      ) : null}
    </aside>
  )
}
