import clsx from 'clsx'
import { forwardRef, TextareaHTMLAttributes } from 'react'

export default forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }
>(function TextInput(props, ref) {
  const { error, children, className, ...restProps } = props

  return (
    <textarea
      ref={ref}
      aria-invalid={error ? 'true' : 'false'}
      {...restProps}
      className={clsx(
        'block h-24 w-full rounded-md disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm',
        error
          ? 'border-red-300 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500'
          : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500',
        className,
      )}
    />
  )
})
