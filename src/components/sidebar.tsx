import { PlusIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

import SubscriptionList from './subscription-list'

export default function Sidebar() {
  return (
    <aside className="fixed left-0 z-50 flex h-screen w-16 flex-col items-center border-r border-gray-200">
      <Link
        href="/"
        className="flex h-16 w-16 cursor-pointer items-center justify-center border-b border-gray-200"
      >
        <img
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="LOGO"
          className="h-8 w-auto"
        />
      </Link>
      <Link
        href="/create"
        className="group mt-2 flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 hover:bg-indigo-600"
      >
        <PlusIcon className="h-8 w-8 text-indigo-600 group-hover:text-white" />
      </Link>
      <SubscriptionList className="" />
    </aside>
  )
}
