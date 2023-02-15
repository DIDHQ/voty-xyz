import clsx from 'clsx'
import { ButtonHTMLAttributes } from 'react'

export default function TextButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        'rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400',
        props.className,
      )}
    >
      {props.children}
    </button>
  )
}
