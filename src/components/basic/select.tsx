import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { clsx } from 'clsx'
import { ReactNode } from 'react'

export default function Select(props: {
  options?: string[]
  value?: string
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
                'flex h-9 min-w-[148px] cursor-pointer items-center justify-between gap-4 rounded-xl bg-white pl-3 pr-2 text-left shadow-base focus:outline-none',
                props.className,
              )}
            >
              <span className="block truncate text-sm-medium text-moderate">
                {props.value}
              </span>

              <span>
                <ChevronDownIcon className="h-5 w-5 text-subtle" />
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
                props.top ? 'bottom-full mb-2' : 'top-full mt-2',
                props.full ? 'w-full' : undefined,
              )}
            >
              <Listbox.Options className="z-10 max-h-60 min-w-[148px] overflow-auto rounded-xl bg-white p-3 text-sm-medium shadow-lg focus:outline-none">
                {props.renderItem
                  ? props.options?.map(props.renderItem)
                  : props.options?.map((option) => (
                      <Listbox.Option
                        key={option}
                        value={option}
                        disabled={props.disables?.[option]}
                        className={({ active, selected, disabled }) =>
                          clsx(
                            selected
                              ? 'bg-primary-500/5 text-primary-500'
                              : active
                              ? 'text-primary-500'
                              : disabled
                              ? 'cursor-not-allowed opacity-80'
                              : 'text-moderate',
                            'relative cursor-pointer select-none rounded-md px-3 py-2 transition',
                          )
                        }
                      >
                        <span className="block truncate">{option}</span>
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
