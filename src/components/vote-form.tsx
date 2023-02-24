import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { BoltIcon } from '@heroicons/react/20/solid'
import { Decimal } from 'decimal.js'
import { useAtomValue } from 'jotai'
import pMap from 'p-map'

import { calculateDecimal } from '../utils/functions/number'
import { Vote, voteSchema } from '../utils/schemas/vote'
import { trpc } from '../utils/trpc'
import useStatus from '../hooks/use-status'
import { getPeriod, Period } from '../utils/duration'
import { Proposal } from '../utils/schemas/proposal'
import { Workgroup } from '../utils/schemas/workgroup'
import { FormItem } from './basic/form'
import { currentDidAtom } from '../utils/atoms'
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
  const period = useMemo(
    () =>
      status?.timestamp && workgroup?.duration
        ? getPeriod(new Date(), status.timestamp, workgroup.duration)
        : undefined,
    [workgroup?.duration, status?.timestamp],
  )
  const disabled = useCallback(
    (did?: string) =>
      !did ||
      !voted ||
      !powers ||
      !!voted[did] ||
      !powers[did] ||
      period !== Period.VOTING,
    [voted, powers, period],
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
                  disabled={disabled(did)}
                  value={value}
                  onChange={onChange}
                />
              ))}
            </ul>
          )}
        />
      </FormItem>
      {period === Period.ENDED || !currentDid ? null : (
        <div className="mt-6 flex w-full flex-col items-end">
          <FormProvider {...methods}>
            <SigningVoteButton
              value={did}
              onChange={setDid}
              snapshots={proposal?.snapshots}
              proposal={proposal?.permalink}
              workgroup={workgroup}
              icon={BoltIcon}
              waiting={period !== Period.VOTING}
              onSuccess={handleSuccess}
              disabled={disabled(did)}
            >
              Vote{votingPower ? ` (${votingPower})` : null}
            </SigningVoteButton>
          </FormProvider>
        </div>
      )}
    </div>
  )
}
