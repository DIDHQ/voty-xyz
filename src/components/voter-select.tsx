import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import pMap from 'p-map'
import { Listbox } from '@headlessui/react'
import clsx from 'clsx'
import { CheckIcon } from '@heroicons/react/20/solid'

import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import { Group } from '../utils/schemas'
import { DID, Snapshots } from '../utils/types'
import Select from './basic/select'
import { calculateNumber } from '../utils/functions/number'
import { fetchJson } from '../utils/fetcher'

export default function VoterSelect(props: {
  proposal?: string
  group?: Group
  snapshots?: Snapshots
  value: string
  onChange(value: string): void
  className?: string
}) {
  const { onChange } = props
  const { account, did } = useWallet()
  const { data: dids } = useDids(account)
  const { data: votes } = useQuery(
    [dids, props.group, props.snapshots],
    async () => {
      const numbers = await pMap(
        dids!,
        (did) =>
          calculateNumber(
            props.group!.permission.voting,
            did as DID,
            props.snapshots!,
          ),
        { concurrency: 5 },
      )
      return dids!.reduce((obj, did, index) => {
        obj[did] = numbers[index]
        return obj
      }, {} as { [key: string]: number })
    },
    {
      enabled: !!dids && !!props.group && !!props.snapshots,
      refetchOnWindowFocus: false,
    },
  )
  const { data: powers } = useQuery(
    [dids, props.proposal],
    async () => {
      const { powers } = await fetchJson<{ powers: { [did: string]: number } }>(
        '/api/voted',
        {
          method: 'POST',
          body: JSON.stringify({ proposal: props.proposal, authors: dids }),
          headers: { 'content-type': 'application/json' },
        },
      )
      return powers
    },
    { enabled: !!dids && !!props.proposal, refetchOnWindowFocus: false },
  )
  useEffect(() => {
    onChange(
      dids?.find((d) => !powers?.[d] && votes?.[d] && d === did) ||
        dids?.find((d) => !powers?.[d] && votes?.[d]) ||
        '',
    )
  }, [did, dids, votes, onChange, powers])

  return (
    <Select
      top
      options={dids}
      renderItem={(option) => (
        <Listbox.Option
          key={option}
          value={option}
          disabled={!!powers?.[option] || !votes?.[option]}
          className={({ active, disabled }) =>
            clsx(
              active
                ? 'bg-indigo-600 text-white'
                : disabled
                ? 'cursor-not-allowed text-gray-400'
                : 'text-gray-900',
              'relative cursor-default select-none py-2 pl-3 pr-9',
            )
          }
        >
          {({ selected, active, disabled }) => (
            <>
              <div className="flex">
                <span
                  className={clsx(
                    selected ? 'font-semibold' : 'font-normal',
                    'truncate',
                  )}
                >
                  {option}
                </span>
                <span
                  className={clsx(
                    active
                      ? 'text-indigo-200'
                      : disabled
                      ? 'text-gray-400'
                      : 'text-gray-500',
                    'ml-2 truncate',
                  )}
                >
                  {powers?.[option] ? 'voted' : votes?.[option]}
                </span>
              </div>
              {selected ? (
                <span
                  className={clsx(
                    active ? 'text-white' : 'text-indigo-600',
                    'absolute inset-y-0 right-0 flex items-center pr-4',
                  )}
                >
                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                </span>
              ) : null}
            </>
          )}
        </Listbox.Option>
      )}
      value={props.value}
      onChange={props.onChange}
      className={props.className}
    />
  )
}
