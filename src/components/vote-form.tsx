import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { BoltIcon } from '@heroicons/react/20/solid'
import type { Decimal } from 'decimal.js'
import pMap from 'p-map'

import { calculateDecimal } from '../utils/functions/number'
import { Vote, voteSchema } from '../utils/schemas/vote'
import { trpc } from '../utils/trpc'
import useStatus from '../hooks/use-status'
import { getPeriod, Period } from '../utils/period'
import { Proposal } from '../utils/schemas/proposal'
import { Workgroup } from '../utils/schemas/workgroup'
import { FormItem } from './basic/form'
import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import { ChoiceListItem } from './choice-list-item'
import DidCombobox from './did-combobox'
import Button from './basic/button'
import useSignDocument from '../hooks/use-sign-document'

const Tooltip = dynamic(
  () => import('react-tooltip').then(({ Tooltip }) => Tooltip),
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
  const [did, setDid] = useState('')
  const { account, connect } = useWallet()
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
  const { data: voted, refetch: refetchVoted } =
    trpc.vote.groupByProposal.useQuery(
      { proposal: proposal?.permalink },
      { enabled: !!dids && !!proposal?.permalink, refetchOnWindowFocus: false },
    )
  const methods = useForm<Vote>({
    resolver: zodResolver(voteSchema),
  })
  const {
    setValue,
    resetField,
    control,
    formState: { errors },
    handleSubmit: onSubmit,
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
    refetchChoices()
    refetchVoted()
    setValue('choice', '')
    onSuccess()
  }, [onSuccess, refetchVoted, refetchChoices, setValue])
  const { data: status } = useStatus(proposal?.permalink)
  const period = useMemo(
    () => getPeriod(new Date(), status?.timestamp, workgroup?.duration),
    [workgroup?.duration, status?.timestamp],
  )
  const disables = useCallback(
    (did?: string) =>
      !did ||
      !voted ||
      !powers ||
      !!voted[did] ||
      !powers[did] ||
      period !== Period.VOTING,
    [voted, powers, period],
  )
  const id = useId()
  const didOptions = useMemo(
    () =>
      voted && powers && dids
        ? dids
            .filter((did) => powers[did].gt(0))
            .map((did) => ({
              did,
              label: `${powers[did]}${voted[did] ? ' (voted)' : ''}`,
              disabled: !!voted[did],
            }))
        : undefined,
    [dids, powers, voted],
  )
  const { mutateAsync } = trpc.vote.create.useMutation()
  const signDocument = useSignDocument(
    did,
    `You are voting on Voty\n\nhash:\n{sha256}`,
  )
  const handleSign = useMutation<void, Error, Vote>(async (vote) => {
    const signed = await signDocument(vote)
    if (signed) {
      await mutateAsync(signed)
      handleSuccess()
    }
  })
  const disabled = useMemo(
    () => !didOptions?.filter(({ disabled }) => !disabled).length,
    [didOptions],
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
              className="mt-6 divide-y divide-gray-200 rounded border border-gray-200"
            >
              {proposal?.options.map((option) => (
                <ChoiceListItem
                  key={option}
                  type={proposal.voting_type}
                  option={option}
                  votingPower={votingPower}
                  choices={choices}
                  disabled={disables(did)}
                  value={value}
                  onChange={onChange}
                />
              ))}
            </ul>
          )}
        />
      </FormItem>
      {period === Period.ENDED ? null : (
        <div className="mt-6 flex w-full flex-col items-end">
          <DidCombobox
            label="Select a DID as voter"
            top
            options={didOptions}
            value={did}
            onChange={setDid}
            disabled={disabled}
            onClick={connect}
            placeholder={
              didOptions?.length === 0 ? 'No available DIDs' : undefined
            }
            className="w-full flex-1 sm:w-auto sm:flex-none"
          />
          {period !== Period.VOTING ? (
            <>
              <div
                data-tooltip-id={id}
                data-tooltip-place="top"
                className="mt-6"
              >
                <Button
                  large
                  primary
                  icon={BoltIcon}
                  onClick={onSubmit(
                    (value) => handleSign.mutate(value),
                    console.error,
                  )}
                  disabled={disables(did)}
                  loading={handleSign.isLoading}
                >
                  Vote{votingPower ? ` (${votingPower})` : null}
                </Button>
              </div>
              <Tooltip id={id} className="rounded">
                Waiting for voting
              </Tooltip>
            </>
          ) : (
            <Button
              large
              primary
              icon={BoltIcon}
              onClick={onSubmit(
                (value) => handleSign.mutate(value),
                console.error,
              )}
              disabled={disables(did)}
              loading={handleSign.isLoading}
              className="mt-6"
            >
              Vote{votingPower ? ` (${votingPower})` : null}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
