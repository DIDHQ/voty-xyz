import { clsx } from 'clsx'
import { clsxMerge } from '@/src/utils/tailwind-helper'

export default function RadioGroup(props: {
  options: { value: string; name: string }[]
  disabled?: boolean
  value: string
  onChange(value: string): void
  className?: string
}) {
  const { onChange } = props

  return (
    <div className={clsxMerge('space-y-2', props.className)}>
      {props.options.map((option) => (
        <div
          key={option.value}
          onClick={() => (props.disabled ? null : onChange(option.value))}
          className="group relative flex w-fit items-start"
        >
          <div className="flex h-5 items-center">
            <input
              type="radio"
              disabled={props.disabled}
              checked={props.value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 cursor-pointer border-base text-primary-500 transition focus:ring-0 focus:ring-transparent disabled:cursor-not-allowed disabled:opacity-80 group-hover:enabled:border-strong group-hover:enabled:checked:border-transparent"
            />
          </div>

          <div className="ml-3 text-sm">
            <label
              className={clsx(
                'text-strong',
                props.disabled
                  ? 'cursor-not-allowed disabled:opacity-80'
                  : 'cursor-pointer',
              )}
            >
              {option.name}
            </label>
          </div>
        </div>
      ))}
    </div>
  )
}
