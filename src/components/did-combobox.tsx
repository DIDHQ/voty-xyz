import { useMemo, useRef, useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Combobox } from '@headlessui/react'
import { clsx } from 'clsx'
import { useVirtualizer } from '@tanstack/react-virtual'

import { Bars3BottomLeftIcon } from '@heroicons/react/24/outline'
import { formatDid } from '../utils/did/utils'
import { clsxMerge } from '../utils/tailwind-helper'

type Option = {
  did: string
  label?: string
  disabled?: boolean
}

export default function DidCombobox(props: {
  top?: boolean
  options?: Option[]
  enabledSecondLevels?: Record<string, boolean>
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
        <Combobox.Label className="mb-2 block text-sm font-medium text-semistrong">
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
          className="w-full rounded-xl border border-base bg-white py-[11px] pl-3 pr-10 text-sm-regular transition focus:border-strong focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-subtle"
        />

        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-2 focus:outline-none">
          <ChevronDownIcon className="h-5 w-5 text-subtle" />
        </Combobox.Button>

        <Combobox.Options
          ref={parentRef}
          unmount={false}
          className={clsx(
            'absolute z-10 max-h-60 min-w-full overflow-auto rounded-xl border border-base/40 bg-white p-3 text-sm shadow-lg focus:outline-none',
            props.top ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          {filteredOptions?.length === 0 && query !== '' ? (
            <div className="relative flex cursor-default select-none flex-col items-center px-4 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-500/10 text-primary-500">
                <Bars3BottomLeftIcon className="h-6 w-6" />
              </div>

              <span className="mt-2 text-sm text-moderate">No DID found</span>
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
                  className={({ active, selected, disabled }) =>
                    clsxMerge(
                      'absolute left-0 top-0 flex w-full cursor-pointer select-none items-center rounded-md px-3 py-2 transition-colors',
                      active && !disabled ? 'bg-subtle' : undefined,
                      selected && active ? 'bg-primary-500/5' : undefined,
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
                      enabledSecondLevel={
                        props.enabledSecondLevels?.[
                          props.options?.[virtualItem.index]?.did ?? ''
                        ]
                      }
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
  enabledSecondLevel?: boolean
  selected?: boolean
  disabled?: boolean
  text?: string
  label?: string
  className?: string
}) {
  return (
    <div
      className={clsxMerge(
        'flex w-full items-center',
        props.disabled ? 'cursor-not-allowed' : undefined,
        props.className,
      )}
    >
      <span
        className={clsx(
          'inline-block h-1.5 w-1.5 shrink-0 rounded-full',
          props.disabled ? 'bg-gray-300' : 'bg-primary-500',
        )}
      />

      <span
        className={clsxMerge(
          'ml-[10px] flex-1 truncate text-start text-sm',
          props.disabled ? 'text-subtle' : 'text-strong',
          props.selected && 'font-medium text-primary-500',
        )}
      >
        {props.text ? formatDid(props.text, props.enabledSecondLevel) : null}
      </span>

      {props.label ? (
        <span
          className={clsx(
            'mx-2 shrink-0 truncate text-xs',
            props.active
              ? 'text-strong'
              : props.disabled
              ? 'text-subtle'
              : 'text-moderate',
          )}
        >
          {props.label}
        </span>
      ) : null}
    </div>
  )
}
