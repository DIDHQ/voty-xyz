import clsx from 'clsx'
import { ReactNode } from 'react'

export default function EmptyState(props: {
  icon?: ReactNode
  title: string
  description?: string
  footer?: ReactNode
  className?: string
}) {
  return (
    <div
      className={clsx('flex flex-col items-center space-y-6', props.className)}
    >
      {props.icon || (
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            width="36"
            height="36"
            rx="8"
            fill="#22C493"
            fillOpacity="0.2"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8 12C8 11.1716 8.67157 10.5 9.5 10.5H26.5C27.3284 10.5 28 11.1716 28 12C28 12.8284 27.3284 13.5 26.5 13.5H9.5C8.67157 13.5 8 12.8284 8 12ZM8 18C8 17.1716 8.67157 16.5 9.5 16.5H26.5C27.3284 16.5 28 17.1716 28 18C28 18.8284 27.3284 19.5 26.5 19.5H9.5C8.67157 19.5 8 18.8284 8 18ZM9.5 22.5C8.67157 22.5 8 23.1716 8 24C8 24.8284 8.67157 25.5 9.5 25.5H20.5C21.3284 25.5 22 24.8284 22 24C22 23.1716 21.3284 22.5 20.5 22.5H9.5Z"
            fill="#22C493"
          />
        </svg>
      )}
      <div className="flex max-w-xl flex-col items-center space-y-4">
        <h3 className="font-medium text-gray-800">{props.title}</h3>
        {props.description ? (
          <p className="text-center text-sm text-gray-500">
            {props.description}
          </p>
        ) : null}
      </div>
      {props.footer}
    </div>
  )
}
