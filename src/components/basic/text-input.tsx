import clsx from 'clsx'
import { forwardRef, InputHTMLAttributes } from 'react'

export default forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
>(function TextInput(props, ref) {
  const { error, children, className, ...restProps } = props

  return (
    <input
      ref={ref}
      aria-invalid={error ? 'true' : 'false'}
      type="text"
      {...restProps}
      className={clsx(
        'block w-full border disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm',
        error
          ? 'border-red-300 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500'
          : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500',
        className,
      )}
    />
  )
})
