import clsx from 'clsx'
import { ReactNode } from 'react'

export default function Card(props: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={clsx(
        'border border-gray-200 bg-white sm:rounded-lg',
        props.className,
      )}
    >
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {props.title}
        </h3>
        {props.description ? (
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {props.description}
          </p>
        ) : null}
      </div>
      <div className="border-t px-4 py-5 sm:px-6">{props.children}</div>
    </div>
  )
}
