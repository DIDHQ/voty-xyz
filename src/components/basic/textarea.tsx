import clsx from 'clsx'
import { forwardRef, KeyboardEvent, useCallback } from 'react'
import TextareaAutosize, {
  TextareaAutosizeProps,
} from 'react-textarea-autosize'

export default forwardRef<
  HTMLTextAreaElement,
  TextareaAutosizeProps & { error?: boolean }
>(function Textarea(props, ref) {
  const { error, children, className, ...restProps } = props
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key == 'Tab') {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      e.currentTarget.value =
        e.currentTarget.value.substring(0, start) +
        '\t' +
        e.currentTarget.value.substring(end)
      e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 1
    }
  }, [])

  return (
    <TextareaAutosize
      ref={ref}
      aria-invalid={error ? 'true' : 'false'}
      onKeyDown={handleKeyDown}
      minRows={7}
      {...restProps}
      className={clsx(
        'block h-24 w-full rounded-md border disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm',
        error
          ? 'border-red-300 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500'
          : 'border-gray-200 focus:border-primary-500 focus:ring-primary-300',
        className,
      )}
    />
  )
})
