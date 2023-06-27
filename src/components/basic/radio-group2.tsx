import { clsx } from 'clsx'
import { RadioGroup } from '@headlessui/react'

export default function RadioGroup2(props: {
  options: { value: string; name: string; description?: string }[]
  disabled?: boolean
  value: 'single' | 'approval'
  onChange(value: 'single' | 'approval'): void
  className?: string
}) {
  return (
    <RadioGroup
      disabled={props.disabled}
      value={props.value}
      onChange={props.onChange}
      className={props.className}
    >
      <div className="-space-y-px rounded-md bg-white">
        {props.options.map((option, index) => (
          <RadioGroup.Option
            key={option.name}
            value={option.value}
            className={({ checked }) =>
              clsx(
                index === 0 ? 'rounded-t-md' : '',
                index === props.options.length - 1 ? 'rounded-b-md' : '',
                checked
                  ? 'z-10 border-primary-200 bg-primary-50'
                  : 'border-gray-200',
                props.disabled
                  ? 'cursor-not-allowed bg-gray-50'
                  : 'cursor-pointer',
                'relative flex border p-4 focus:outline-none',
              )
            }
          >
            {({ active, checked, disabled }) => (
              <>
                <span
                  className={clsx(
                    checked
                      ? 'border-transparent bg-primary-600'
                      : 'border-gray-300 bg-white',
                    active ? 'ring-2 ring-primary-600 ring-offset-2' : '',
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <span className="ml-3 flex flex-col">
                  <RadioGroup.Label
                    as="span"
                    className={clsx(
                      checked ? 'text-primary-900' : 'text-gray-900',
                      'block text-sm font-medium',
                    )}
                  >
                    {option.name}
                  </RadioGroup.Label>
                  <RadioGroup.Description
                    as="span"
                    className={clsx(
                      checked ? 'text-primary-700' : 'text-gray-500',
                      'block text-sm',
                    )}
                  >
                    {option.description}
                  </RadioGroup.Description>
                </span>
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}
