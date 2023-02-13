import clsx from 'clsx'
import { ButtonHTMLAttributes, ExoticComponent } from 'react'

export default function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: ExoticComponent<{ className?: string }>
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
        'group flex items-center rounded-md border px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500',
        primary
          ? 'border-transparent bg-indigo-600 text-white hover:bg-indigo-700'
          : 'border-gray-200 bg-white hover:bg-gray-50',
        className,
      )}
    >
      {loading ? (
        <svg
          className="-ml-1 mr-3 h-5 w-5 animate-spin text-white group-disabled:text-gray-500"
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
      ) : props.icon ? (
        <props.icon className="-ml-1 mr-3 h-5 w-5" />
      ) : null}
      {children}
    </button>
  )
}
