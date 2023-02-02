import clsx from 'clsx'
import Link from 'next/link'
import { useId } from 'react'

export default function Tabs(props: {
  tabs: { name: string; href: string; current: boolean }[]
  className?: string
}) {
  const id = useId()

  return (
    <div className={props.className}>
      <div className="sm:hidden">
        <label htmlFor={id} className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id={id}
          className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          defaultValue={props.tabs.find((tab) => tab.current)?.name}
        >
          {props.tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <nav className="flex space-x-4" aria-label="Tabs">
          {props.tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={clsx(
                tab.current
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700',
                'rounded-md px-3 py-2 text-sm font-medium',
              )}
              aria-current={tab.current ? 'page' : undefined}
              shallow
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
