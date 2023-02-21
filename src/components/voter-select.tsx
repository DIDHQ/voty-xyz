import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Listbox } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/20/solid'
import pMap from 'p-map'
import clsx from 'clsx'
import { useAtomValue } from 'jotai'

import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import { Workgroup } from '../utils/schemas/workgroup'
import { Snapshots } from '../utils/types'
import Select from './basic/select'
import { calculateNumber } from '../utils/functions/number'
import { trpc } from '../utils/trpc'
import { currentDidAtom } from '../utils/atoms'

export default function VoterSelect(props: {
  proposal?: string
  workgroup?: Workgroup
  snapshots?: Snapshots
  value: string
  onChange(value: string): void
  className?: string
}) {
  const { onChange } = props
  const { account } = useWallet()
  const currentDid = useAtomValue(currentDidAtom)
  const { data: dids } = useDids(account, props.snapshots)
  const { data: votes } = useQuery(
    [dids, props.workgroup, props.snapshots],
    async () => {
      const numbers = await pMap(
        dids!,
        (did) =>
          calculateNumber(
            props.workgroup!.permission.voting,
            did,
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
      enabled: !!dids && !!props.workgroup && !!props.snapshots,
      refetchOnWindowFocus: false,
    },
  )
  const { data: powers } = trpc.vote.groupByProposal.useQuery(
    { proposal: props.proposal, authors: dids },
    { enabled: !!dids && !!props.proposal, refetchOnWindowFocus: false },
  )
  useEffect(() => {
    onChange(
      dids?.find((d) => !powers?.[d] && votes?.[d] && d === currentDid) ||
        dids?.find((d) => !powers?.[d] && votes?.[d]) ||
        '',
    )
  }, [currentDid, dids, votes, onChange, powers])

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
                ? 'bg-primary-600 text-white'
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
                      ? 'text-primary-200'
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
                    active ? 'text-white' : 'text-primary-600',
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
