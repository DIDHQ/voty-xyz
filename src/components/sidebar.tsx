import { PlusIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { useId } from 'react'
import { Tooltip } from 'react-tooltip'

import SubscriptionList from './subscription-list'

export default function Sidebar() {
  const id = useId()

  return (
    <aside className="fixed left-0 z-50 hidden h-screen w-18 flex-col items-center border-r border-gray-200 sm:flex">
      <Link
        href="/"
        className="flex h-18 w-18 cursor-pointer items-center justify-center border-b border-gray-200"
      >
        <img
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="LOGO"
          className="h-8 w-auto"
        />
      </Link>
      <SubscriptionList className="mb-3" />
      <Link
        href="/create"
        data-tooltip-id={id}
        data-tooltip-place="right"
        className="group flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 hover:bg-indigo-600"
      >
        <PlusIcon className="h-8 w-8 text-indigo-600 group-hover:text-white" />
      </Link>
      <Tooltip id={id}>Create community</Tooltip>
    </aside>
  )
}
