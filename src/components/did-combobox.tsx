import { useMemo, useRef, useState } from 'react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Combobox } from '@headlessui/react'
import clsx from 'clsx'
import { useVirtualizer } from '@tanstack/react-virtual'

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
    () => props.options?.filter(({ disabled }) => !disabled).length === 0,
    [props.options],
  )
  const parentRef = useRef<HTMLUListElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: props.options?.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
  })

  return (
    <Combobox
      as="div"
      value={props.value}
      onChange={props.onChange}
      onClick={props.onClick}
      disabled={disabled}
      className={props.className}
    >
      <Combobox.Label className="block text-sm font-medium text-gray-700">
        {props.label}
      </Combobox.Label>
      <div className="relative mt-1">
        <Combobox.Input
          placeholder={
            props.options
              ? disabled
                ? 'No available DID'
                : undefined
              : 'Loading...'
          }
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
          ref={parentRef}
          unmount={false}
          className={clsx(
            'absolute z-10 max-h-60 min-w-full overflow-auto rounded bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm',
            props.top ? 'bottom-full mb-1' : 'top-full mt-1',
          )}
        >
          {filteredOptions?.length === 0 && query !== '' ? (
            <div className="relative cursor-default select-none py-2 px-4 text-start text-gray-700">
              No DID found
            </div>
          ) : (
            <div
              className="relative w-full"
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => (
                <Combobox.Option
                  key={virtualItem.key}
                  value={props.options?.[virtualItem.index]?.did}
                  disabled={props.options?.[virtualItem.index]?.disabled}
                  className={({ active }) =>
                    clsx(
                      'absolute top-0 left-0 w-full cursor-default select-none py-2 px-3',
                      active
                        ? 'bg-primary-600 text-white'
                        : disabled
                        ? 'text-gray-400'
                        : 'text-gray-900',
                    )
                  }
                  style={{
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  {({ active, selected, disabled }) => (
                    <DidOption
                      active={active}
                      selected={selected}
                      disabled={disabled}
                      text={props.options?.[virtualItem.index]?.did}
                      label={props.options?.[virtualItem.index]?.label}
                    />
                  )}
                </Combobox.Option>
              ))}
            </div>
          )}
        </Combobox.Options>
      </div>
    </Combobox>
  )
}

export function DidOption(props: {
  active?: boolean
  selected?: boolean
  disabled?: boolean
  text?: string
  label?: string
}) {
  return (
    <div
      className={clsx(
        'flex items-center',
        props.disabled ? 'cursor-not-allowed' : undefined,
      )}
    >
      <span
        className={clsx(
          'inline-block h-2 w-2 shrink-0 rounded-full',
          props.disabled ? 'bg-gray-200' : 'bg-primary-400',
        )}
        aria-hidden="true"
      />
      <span
        className={clsx(
          'ml-3 flex-1 truncate text-start',
          props.selected && 'font-semibold',
          props.disabled ? 'text-gray-400' : 'text-gray-800',
        )}
      >
        {props.text}
      </span>
      {props.label ? (
        <span
          className={clsx(
            'mx-2 shrink-0 truncate text-gray-500',
            props.active ? 'text-indigo-200' : 'text-gray-500',
          )}
        >
          {props.label}
        </span>
      ) : null}
    </div>
  )
}
