import { clsx } from 'clsx'
import { RadioGroup } from '@headlessui/react'
import { clsxMerge } from '@/src/utils/tailwind-helper';

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
      className={props.className}>
      <div 
        className="space-y-3">
        {props.options.map(option => (
          <RadioGroup.Option
            key={option.name}
            value={option.value}
            className={({ checked }) =>
              clsxMerge(
                'group flex items-center justify-between gap-3 rounded-xl border border-base p-4 transition',
                props.disabled
                  ? 'cursor-not-allowed opacity-80'
                  : 'cursor-pointer hover:border-strong',
                checked
                  ? 'border-primary-500 hover:border-primary-500'
                  : ''
              )
            }>
            {({ checked, disabled }) => (
              <>
                <span
                  className={clsxMerge(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition',
                    disabled ? 'cursor-not-allowed' : 'cursor-pointer group-hover:border-strong',
                    checked
                      ? 'border-transparent bg-primary-500 group-hover:border-transparent'
                      : 'border-base bg-white'
                  )}>
                  <span 
                    className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                
                <div
                  className="flex-1">
                  <RadioGroup.Label
                    className={clsx(
                      'text-sm text-strong',
                    )}>
                    {option.name}
                  </RadioGroup.Label>
                  
                  <RadioGroup.Description
                    className={clsx(
                      'text-xs-regular text-subtle',
                    )}>
                    {option.description}
                  </RadioGroup.Description>
                </div>
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}
