import clsx from 'clsx'
import { ButtonHTMLAttributes } from 'react'

export default function PrimaryButton(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean },
) {
  const { loading, disabled, children, className, ...restProps } = props

  return (
    <button
      {...restProps}
      disabled={loading || disabled}
      className={clsx(
        'items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        disabled
          ? 'cursor-not-allowed bg-gray-400 hover:bg-gray-400'
          : loading
          ? 'cursor-wait'
          : 'cursor-pointer',
        className,
      )}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  )
}
