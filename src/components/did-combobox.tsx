import { useMemo, useRef, useState } from 'react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Combobox } from '@headlessui/react'
import { clsx } from 'clsx'
import { useVirtualizer } from '@tanstack/react-virtual'

import { formatDid } from '../utils/did/utils'

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
    estimateSize: () => 40,
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
      {props.label ? (
        <Combobox.Label className="mb-1 block text-sm font-medium text-gray-700">
          {props.label}
        </Combobox.Label>
      ) : null}
      <div className="relative">
        <Combobox.Input<string>
          placeholder={
            props.options
              ? disabled
                ? 'No eligible DIDs.'
                : undefined
              : 'Loading...'
          }
          displayValue={formatDid}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-300 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm"
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r px-2 focus:outline-none">
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
        </Combobox.Button>
        <Combobox.Options
          ref={parentRef}
          unmount={false}
          className={clsx(
            'absolute z-10 max-h-60 min-w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm',
            props.top ? 'bottom-full mb-1' : 'top-full mt-1',
          )}
        >
          {filteredOptions?.length === 0 && query !== '' ? (
            <div className="relative cursor-default select-none px-4 py-2 text-start text-gray-700">
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
                      'absolute left-0 top-0 flex w-full cursor-default select-none items-center px-3 py-2',
                      active ? 'bg-primary-600' : undefined,
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
        'flex w-full items-center',
        props.disabled ? 'cursor-not-allowed' : undefined,
      )}
    >
      <span
        className={clsx(
          'inline-block h-2 w-2 shrink-0 rounded-full',
          props.disabled ? 'bg-gray-200' : 'bg-primary-400',
        )}
      />
      <span
        className={clsx(
          'ml-3 flex-1 truncate text-start',
          props.selected && 'font-semibold',
          props.active
            ? 'text-white'
            : props.disabled
            ? 'text-gray-400'
            : 'text-gray-800',
        )}
      >
        {props.text ? formatDid(props.text) : null}
      </span>
      {props.label ? (
        <span
          className={clsx(
            'mx-2 shrink-0 truncate',
            props.active
              ? 'text-gray-100'
              : props.disabled
              ? 'text-gray-300'
              : 'text-gray-500',
          )}
        >
          {props.label}
        </span>
      ) : null}
    </div>
  )
}
