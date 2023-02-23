import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { BoltIcon, CheckIcon } from '@heroicons/react/20/solid'
import { Decimal } from 'decimal.js'
import { useAtomValue } from 'jotai'
import pMap from 'p-map'
import { Listbox } from '@headlessui/react'

import { calculateDecimal } from '../utils/functions/number'
import { Vote, voteSchema } from '../utils/schemas/vote'
import { trpc } from '../utils/trpc'
import useStatus from '../hooks/use-status'
import { getPeriod, Period } from '../utils/duration'
import { Proposal } from '../utils/schemas/proposal'
import { Workgroup } from '../utils/schemas/workgroup'
import { FormItem } from './basic/form'
import { currentDidAtom } from '../utils/atoms'
import Select from './basic/select'
import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import { ChoiceListItem } from './choice-list-item'

const SigningVoteButton = dynamic(
  () => import('./signing/signing-vote-button'),
  { ssr: false },
)

export default function VoteForm(props: {
  proposal?: Proposal & { permalink: string; votes: number }
  workgroup?: Workgroup
  onSuccess: () => void
  className?: string
}) {
  const { proposal, workgroup, onSuccess } = props
  const { data: choices, refetch: refetchChoices } =
    trpc.choice.groupByProposal.useQuery(
      { proposal: proposal?.permalink },
      { enabled: !!proposal?.permalink, refetchOnWindowFocus: false },
    )
  const currentDid = useAtomValue(currentDidAtom)
  const [did, setDid] = useState('')
  const { account } = useWallet()
  const { data: dids } = useDids(account, proposal?.snapshots)
  const { data: powers } = useQuery(
    [dids, props.workgroup, proposal?.snapshots],
    async () => {
      const decimals = await pMap(
        dids!,
        (did) =>
          calculateDecimal(
            props.workgroup!.permission.voting,
            did,
            proposal?.snapshots!,
          ),
        { concurrency: 5 },
      )
      return dids!.reduce((obj, did, index) => {
        obj[did] = decimals[index]
        return obj
      }, {} as { [key: string]: Decimal })
    },
    {
      enabled: !!dids && !!props.workgroup && !!proposal?.snapshots,
      refetchOnWindowFocus: false,
    },
  )
  const { data: voted, refetch } = trpc.vote.groupByProposal.useQuery(
    { proposal: proposal?.permalink, authors: dids },
    { enabled: !!dids && !!proposal?.permalink, refetchOnWindowFocus: false },
  )
  useEffect(() => {
    setDid(currentDid)
  }, [currentDid])
  const methods = useForm<Vote>({
    resolver: zodResolver(voteSchema),
  })
  const {
    setValue,
    resetField,
    control,
    formState: { errors },
  } = methods
  useEffect(() => {
    if (proposal?.permalink) {
      setValue('proposal', proposal.permalink)
    }
  }, [proposal?.permalink, setValue])
  const { data: votingPower } = useQuery(
    ['votingPower', workgroup, did, proposal],
    () =>
      calculateDecimal(workgroup!.permission.voting, did!, proposal!.snapshots),
    {
      enabled: !!workgroup && !!did && !!proposal,
      refetchOnWindowFocus: false,
    },
  )
  useEffect(() => {
    if (votingPower === undefined) {
      resetField('power')
    } else {
      setValue('power', votingPower.toString())
    }
  }, [resetField, setValue, votingPower])
  const handleSuccess = useCallback(() => {
    onSuccess()
    refetchChoices()
    refetch()
    setValue('choice', '')
  }, [onSuccess, refetch, refetchChoices, setValue])
  const { data: status } = useStatus(proposal?.permalink)
  const disabled = useCallback(
    (did?: string) =>
      !did ||
      !voted ||
      !powers ||
      !!voted[did] ||
      !!powers[did] ||
      !status?.timestamp ||
      !workgroup?.duration ||
      getPeriod(new Date(), status.timestamp, workgroup.duration) !==
        Period.VOTING,
    [status?.timestamp, powers, voted, workgroup?.duration],
  )

  return (
    <div className={props.className}>
      <FormItem error={errors.choice?.message}>
        <Controller
          control={control}
          name="choice"
          render={({ field: { value, onChange } }) => (
            <ul
              role="list"
              className="mt-6 divide-y divide-gray-200 border border-gray-200"
            >
              {proposal?.options.map((option) => (
                <ChoiceListItem
                  key={option}
                  type={proposal.voting_type}
                  option={option}
                  votingPower={votingPower}
                  choices={choices}
                  disabled={disabled(did)}
                  value={value}
                  onChange={onChange}
                />
              ))}
            </ul>
          )}
        />
      </FormItem>
      <div className="mt-6 flex w-full justify-end">
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
          value={did}
          onChange={setDid}
          className="w-0 flex-1 focus:z-10 active:z-10 sm:w-auto sm:flex-none"
        />
        <FormProvider {...methods}>
          <SigningVoteButton
            did={did}
            icon={BoltIcon}
            onSuccess={handleSuccess}
            disabled={disabled(did)}
            className="border-l-0 focus:z-10 active:z-10"
          >
            Vote{votingPower ? ` (${votingPower})` : null}
          </SigningVoteButton>
        </FormProvider>
      </div>
    </div>
  )
}
