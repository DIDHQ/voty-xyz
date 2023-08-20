import { forwardRef, InputHTMLAttributes, useCallback, WheelEvent } from 'react'
import { clsxMerge } from '@/src/utils/tailwind-helper'

export default forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
>(function TextInput(props, ref) {
  const { error, className, ...restProps } = props
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
      className={clsxMerge(
        'block w-full rounded-xl border py-[11px] text-sm text-strong transition placeholder:text-subtle focus:ring-0 disabled:cursor-not-allowed disabled:bg-subtle disabled:text-subtle',
        error
          ? 'border-red-300 focus:border-red-500'
          : 'border-base focus:border-strong',
        className
      )}
    />
  )
})
