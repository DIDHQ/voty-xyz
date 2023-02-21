import clsx from 'clsx'
import { forwardRef } from 'react'
import TextareaAutosize, {
  TextareaAutosizeProps,
} from 'react-textarea-autosize'

export default forwardRef<
  HTMLTextAreaElement,
  TextareaAutosizeProps & { error?: boolean }
>(function Textarea(props, ref) {
  const { error, children, className, ...restProps } = props

  return (
    <TextareaAutosize
      ref={ref}
      aria-invalid={error ? 'true' : 'false'}
      {...restProps}
      minRows={3}
      className={clsx(
        'block h-24 w-full border disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm',
        error
          ? 'border-red-300 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500'
          : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500',
        className,
      )}
    />
  )
})
