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
        'text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400',
        props.className,
      )}
    >
      {props.children}
    </button>
  )
}
