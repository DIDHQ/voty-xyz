import { clsx } from 'clsx'

export default function RadioGroup(props: {
  options: { value: string; name: string }[]
  disabled?: boolean
  value: string
  onChange(value: string): void
  className?: string
}) {
  const { onChange } = props

  return (
    <div className={clsx('space-y-2', props.className)}>
      {props.options.map((option) => (
        <div
          key={option.value}
          onClick={() => (props.disabled ? null : onChange(option.value))}
          className="relative flex w-fit cursor-pointer items-start"
        >
          <div className="flex h-5 items-center">
            <input
              type="radio"
              disabled={props.disabled}
              checked={props.value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 cursor-pointer border-gray-300 text-primary-600 focus:ring-primary-300 disabled:cursor-not-allowed disabled:bg-gray-50 checked:disabled:bg-primary-600"
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              className={clsx(
                'text-gray-700',
                props.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
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
