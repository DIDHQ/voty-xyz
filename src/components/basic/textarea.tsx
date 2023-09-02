import { forwardRef, Fragment, KeyboardEvent, useCallback } from 'react'
import TextareaAutosize, {
  TextareaAutosizeProps,
} from 'react-textarea-autosize'
import { clsxMerge } from '@/src/utils/tailwind-helper'

export default forwardRef<
  HTMLTextAreaElement,
  TextareaAutosizeProps & { shadow?: string; error?: boolean }
>(function Textarea(props, ref) {
  const { shadow, error, className, ...restProps } = props
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
    <div className={clsxMerge('relative', className)}>
      {shadow && props.value ? (
        <span className="pointer-events-none absolute z-0 select-none border border-transparent px-3 py-[10px] text-sm text-subtle">
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
        className={clsxMerge(
          'block w-full rounded-xl border py-[10px] text-sm text-strong transition placeholder:text-subtle focus:ring-0 disabled:cursor-not-allowed disabled:bg-subtle disabled:text-subtle',
          error
            ? 'border-red-300 focus:border-red-500'
            : 'border-base focus:border-strong',
        )}
      />
    </div>
  )
})
