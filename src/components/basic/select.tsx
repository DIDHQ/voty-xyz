import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { ReactNode } from 'react'

export default function Select(props: {
  options?: string[]
  value: string
  disables?: { [key: string]: boolean }
  renderItem?: (option: string) => ReactNode
  full?: boolean
  top?: boolean
  onChange(value: string): void
  className?: string
}) {
  return (
    <Listbox value={props.value} onChange={props.onChange}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button
              className={clsx(
                'relative w-full cursor-default rounded-md border border-gray-200 bg-white py-2 pl-3 pr-10 text-left focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-300 sm:text-sm',
                props.className,
              )}
            >
              <span className="block h-5 truncate text-sm text-gray-800">
                {props.value}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              show={open}
              as="div"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              className={clsx(
                'absolute z-50',
                props.top ? 'bottom-full mb-1' : 'top-full mt-1',
                props.full ? 'w-full' : undefined,
              )}
            >
              <Listbox.Options className="z-10 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                {props.renderItem
                  ? props.options?.map(props.renderItem)
                  : props.options?.map((option) => (
                      <Listbox.Option
                        key={option}
                        value={option}
                        disabled={props.disables?.[option]}
                        className={({ active, disabled }) =>
                          clsx(
                            active
                              ? 'bg-primary-600 text-white'
                              : disabled
                              ? 'cursor-not-allowed text-gray-400'
                              : 'text-gray-900',
                            'relative cursor-default select-none py-2 pl-3 pr-9',
                          )
                        }
                      >
                        {({ selected, active }) => (
                          <>
                            <span
                              className={clsx(
                                selected ? 'font-semibold' : 'font-normal',
                                'block truncate',
                              )}
                            >
                              {option}
                            </span>
                            {selected ? (
                              <span
                                className={clsx(
                                  active ? 'text-white' : 'text-primary-600',
                                  'absolute inset-y-0 right-0 flex items-center pr-4',
                                )}
                              >
                                <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
}
