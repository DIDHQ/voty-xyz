import { clsx } from 'clsx'
import { forwardRef, InputHTMLAttributes, useCallback, WheelEvent } from 'react'

export default forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
>(function TextInput(props, ref) {
  const { error, children, className, ...restProps } = props
  const handleWheel = useCallback(
    (e: WheelEvent<HTMLInputElement>) => {
      if (props.type === 'number') {
        e.currentTarget.blur()
      }
    },
    [props.type],
  )

  return (
    <input
      ref={ref}
      aria-invalid={error ? 'true' : 'false'}
      type="text"
      onWheel={handleWheel}
      {...restProps}
      className={clsx(
        'block w-full rounded-md border placeholder:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:placeholder:text-gray-400 sm:text-sm',
        error
          ? 'border-red-300 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500'
          : 'border-gray-200 focus:border-primary-500 focus:ring-primary-300',
        className,
      )}
    />
  )
})
