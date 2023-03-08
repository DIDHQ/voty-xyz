import { useMemo, useState } from 'react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Combobox } from '@headlessui/react'
import clsx from 'clsx'

type Option = {
  did: string
  label?: string
  disabled?: boolean
}

export default function DidCombobox(props: {
  top?: boolean
  options?: Option[]
  label?: string
  value: string
  onChange(value: string): void
  onClick?: () => void
  className?: string
}) {
  const [query, setQuery] = useState('')
  const filteredOptions =
    query === ''
      ? props.options
      : props.options?.filter((option) => {
          return option.did.toLowerCase().includes(query.toLowerCase())
        })
  const disabled = useMemo(
    () => !props.options?.filter(({ disabled }) => !disabled).length,
    [props.options],
  )

  return (
    <Combobox
      as="div"
      value={props.value}
      onChange={props.onChange}
      disabled={disabled}
      className={props.className}
    >
      <Combobox.Label className="block text-sm font-medium text-gray-700">
        {props.label}
      </Combobox.Label>
      <div className="relative mt-1">
        <Combobox.Input
          placeholder={
            props.options?.length === 0 ? 'No available DID' : undefined
          }
          onClick={props.onClick}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded border border-gray-300 bg-white py-2 pl-3 pr-10 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm"
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>
        <Combobox.Options
          className={clsx(
            'absolute z-10 max-h-60 w-fit overflow-auto rounded bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm',
            props.top ? 'bottom-full mb-1' : 'top-full mt-1',
          )}
        >
          {filteredOptions?.length === 0 && query !== '' ? (
            <div className="relative cursor-default select-none py-2 px-4 text-start text-gray-700">
              No DID found
            </div>
          ) : (
            filteredOptions?.map((option) => (
              <Combobox.Option
                key={option.did}
                value={option.did}
                disabled={option.disabled}
                className={({ active }) =>
                  clsx(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active
                      ? 'bg-primary-600 text-white'
                      : option.disabled
                      ? 'text-gray-400'
                      : 'text-gray-900',
                  )
                }
              >
                {({ active, selected, disabled }) => (
                  <>
                    <div
                      className={clsx(
                        'flex items-center',
                        disabled ? 'cursor-not-allowed' : undefined,
                      )}
                    >
                      <span
                        className={clsx(
                          'inline-block h-2 w-2 shrink-0 rounded-full',
                          disabled ? 'bg-gray-200' : 'bg-primary-400',
                        )}
                        aria-hidden="true"
                      />
                      <span
                        className={clsx(
                          'ml-3 truncate',
                          selected && 'font-semibold',
                        )}
                      >
                        {option.did}
                        <span className="sr-only">
                          {' '}
                          is {disabled ? 'offline' : 'online'}
                        </span>
                      </span>
                      {option.label ? (
                        <span
                          className={clsx(
                            'mx-2 truncate text-gray-500',
                            active ? 'text-indigo-200' : 'text-gray-500',
                          )}
                        >
                          {option.label}
                        </span>
                      ) : null}
                    </div>
                    {selected && (
                      <span
                        className={clsx(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-white' : 'text-primary-600',
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </div>
    </Combobox>
  )
}
