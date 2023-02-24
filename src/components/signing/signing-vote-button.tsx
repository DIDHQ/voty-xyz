import { Listbox } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/20/solid'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import Decimal from 'decimal.js'
import pMap from 'p-map'
import {
  ExoticComponent,
  ReactNode,
  useCallback,
  useEffect,
  useId,
} from 'react'
import { useFormContext } from 'react-hook-form'
import { Tooltip } from 'react-tooltip'

import useAsync from '../../hooks/use-async'
import useDids from '../../hooks/use-dids'
import useSignDocument from '../../hooks/use-sign-document'
import useWallet from '../../hooks/use-wallet'
import { calculateDecimal } from '../../utils/functions/number'
import { Vote } from '../../utils/schemas/vote'
import { Workgroup } from '../../utils/schemas/workgroup'
import { trpc } from '../../utils/trpc'
import { Snapshots } from '../../utils/types'
import Button from '../basic/button'
import Notification from '../basic/notification'
import Select from '../basic/select'

export default function SigningVoteButton(props: {
  value: string
  onChange(value: string): void
  proposal?: string
  snapshots?: Snapshots
  workgroup?: Workgroup
  icon?: ExoticComponent<{ className?: string }>
  onSuccess: (permalink: string) => void
  disabled?: boolean
  waiting?: boolean
  children: ReactNode
}) {
  const { onSuccess } = props
  const { account } = useWallet()
  const { data: dids } = useDids(account, props.snapshots)
  const { handleSubmit: onSubmit } = useFormContext<Vote>()
  const signDocument = useSignDocument(
    props.value,
    `You are creating vote of Voty\n\nhash:\n{sha256}`,
  )
  const handleCreate = trpc.vote.create.useMutation()
  const handleSign = useAsync(
    useCallback(
      async (vote: Vote) => {
        const signed = await signDocument(vote)
        if (signed) {
          return handleCreate.mutate(signed)
        }
      },
      [signDocument, handleCreate],
    ),
  )
  const { data: powers } = useQuery(
    [dids, props.workgroup, props?.snapshots],
    async () => {
      const decimals = await pMap(
        dids!,
        (did) =>
          calculateDecimal(
            props.workgroup!.permission.voting,
            did,
            props?.snapshots!,
          ),
        { concurrency: 5 },
      )
      return dids!.reduce((obj, did, index) => {
        obj[did] = decimals[index]
        return obj
      }, {} as { [key: string]: Decimal })
    },
    {
      enabled: !!dids && !!props.workgroup && !!props?.snapshots,
      refetchOnWindowFocus: false,
    },
  )
  const { data: voted, refetch } = trpc.vote.groupByProposal.useQuery(
    { proposal: props.proposal, authors: dids },
    { enabled: !!dids && !!props.proposal, refetchOnWindowFocus: false },
  )
  useEffect(() => {
    if (handleCreate.isSuccess) {
      refetch()
      onSuccess(handleCreate.data)
    }
  }, [handleCreate.data, handleCreate.isSuccess, onSuccess, refetch])
  const id = useId()

  return (
    <>
      <Notification show={handleCreate.isError}>
        {handleCreate.error?.message}
      </Notification>
      <Notification show={handleSign.status === 'error'}>
        {handleSign.error?.message}
      </Notification>
      <Select
        top
        options={dids}
        renderItem={(option) => (
          <Listbox.Option
            key={option}
            value={option}
            disabled={!!voted?.[option] || !powers?.[option]}
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
                    {powers?.[option].toString()}
                    {voted?.[option] ? ' voted' : null}
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
        className="w-0 flex-1 focus:z-10 active:z-10 sm:w-auto sm:flex-none"
      />
      {props.waiting ? (
        <>
          <div data-tooltip-id={id} data-tooltip-place="top" className="mt-6">
            <Button
              primary
              icon={props.icon}
              onClick={onSubmit(handleSign.execute, console.error)}
              disabled={props.disabled}
              loading={
                handleCreate.isLoading || handleSign.status === 'pending'
              }
            >
              {props.children}
            </Button>
          </div>
          <Tooltip id={id} className="rounded">
            Waiting for proposal
          </Tooltip>
        </>
      ) : (
        <Button
          primary
          icon={props.icon}
          onClick={onSubmit(handleSign.execute, console.error)}
          disabled={props.disabled}
          loading={handleCreate.isLoading || handleSign.status === 'pending'}
        >
          {props.children}
        </Button>
      )}
    </>
  )
}
