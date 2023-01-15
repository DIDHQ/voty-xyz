import clsx from 'clsx'
import { ButtonHTMLAttributes } from 'react'

export default function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    primary?: boolean
    loading?: boolean
  },
) {
  const { primary, loading, disabled, children, className, ...restProps } =
    props

  return (
    <button
      {...restProps}
      disabled={loading || disabled}
      className={clsx(
        'flex items-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
        primary
          ? 'bg-indigo-600 hover:bg-indigo-700 border-transparent text-white'
          : 'bg-white hover:bg-gray-50 border-gray-300 shadow-sm',
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
            strokeWidth="4"
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
