import clsx from 'clsx'
import { forwardRef, Fragment, KeyboardEvent, useCallback } from 'react'
import TextareaAutosize, {
  TextareaAutosizeProps,
} from 'react-textarea-autosize'

export default forwardRef<
  HTMLTextAreaElement,
  TextareaAutosizeProps & { shadow?: string; error?: boolean }
>(function Textarea(props, ref) {
  const { shadow, error, children, className, ...restProps } = props
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
    <div className={clsx('relative', className)}>
      {shadow && props.value ? (
        <span className="absolute z-0 select-none border border-transparent px-3 py-2 text-base text-gray-400 sm:text-sm">
          {(props.value as string | undefined)
            ?.split('\n')
            .map((line, index) => (
              <Fragment key={index}>
                <span className="text-transparent">{line}</span>
                <span>{shadow}</span>
                <br />
              </Fragment>
            ))}
        </span>
      ) : null}
      <TextareaAutosize
        ref={ref}
        aria-invalid={error ? 'true' : 'false'}
        onKeyDown={handleKeyDown}
        minRows={7}
        {...restProps}
        className={clsx(
          'block w-full rounded-md border bg-transparent placeholder:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm',
          error
            ? 'border-red-300 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500'
            : 'border-gray-200 focus:border-primary-500 focus:ring-primary-300',
        )}
      />
    </div>
  )
})
