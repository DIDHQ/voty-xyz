import { clsx } from 'clsx'
import { ReactNode } from 'react'

export function DetailList(props: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{props.title}</h3>
      <dl className="mt-2 border-t">{props.children}</dl>
    </div>
  )
}

export function DetailItem(props: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className="flex justify-between py-2 text-sm font-medium">
      <dt className="mr-4 shrink-0 truncate text-gray-400">{props.title}</dt>
      <dd
        className={clsx(
          'w-0 flex-1 overflow-visible break-words text-right text-gray-600',
          props.className,
        )}
      >
        {props.children}
      </dd>
    </div>
  )
}
