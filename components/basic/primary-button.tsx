import clsx from 'clsx'
import { HTMLAttributes } from 'react'

export default function PrimaryButton(
  props: HTMLAttributes<HTMLButtonElement>,
) {
  const { children, className, ...restProps } = props

  return (
    <button
      {...restProps}
      className={clsx(
        'inline-flex items-center rounded border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        className,
      )}
    >
      {children}
    </button>
  )
}
