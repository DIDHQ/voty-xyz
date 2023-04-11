import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { BoltIcon } from '@heroicons/react/20/solid'
import type { Decimal } from 'decimal.js'
import pMap from 'p-map'
import clsx from 'clsx'

import { calculateDecimal } from '../utils/functions/number'
import { Vote, voteSchema } from '../utils/schemas/vote'
import { trpc } from '../utils/trpc'
import useStatus from '../hooks/use-status'
import { getPhase, Phase } from '../utils/phase'
import { Proposal } from '../utils/schemas/proposal'
import { Group } from '../utils/schemas/group'
import { FormItem } from './basic/form'
import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import { ChoiceListItem } from './choice-list-item'
import DidCombobox from './did-combobox'
import Button from './basic/button'
import useSignDocument from '../hooks/use-sign-document'
import TextButton from './basic/text-button'
import Notification from './basic/notification'
import Tooltip from './basic/tooltip'
import Slide from './basic/slide'
import { formatDurationMs } from '../utils/time'
import { previewPermalink } from '../utils/constants'
import PermissionCard from './permission-card'

export default function VoteForm(props: {
  group: Group
  proposal: Proposal & { permalink: string }
  onSuccess: () => void
  className?: string
}) {
  const { onSuccess } = props
  const { data: choices, refetch: refetchChoices } =
    trpc.choice.groupByProposal.useQuery({ proposal: props.proposal.permalink })
  const [did, setDid] = useState('')
  const { account, connect } = useWallet()
  const { data: dids } = useDids(account, props.proposal.snapshots)
  const { data: powers } = useQuery(
    [dids, props.group, props.proposal.snapshots],
    async () => {
      const decimals = await pMap(
        dids!,
        (did) =>
          calculateDecimal(
            props.group.permission.voting,
            did,
            props.proposal.snapshots,
          ),
        { concurrency: 5 },
      )
      return dids!.reduce((obj, did, index) => {
        obj[did] = decimals[index]
        return obj
      }, {} as { [key: string]: Decimal })
    },
    { enabled: !!dids },
  )
  const { data: voted, refetch: refetchVoted } =
    trpc.vote.groupByProposal.useQuery(
      { proposal: props.proposal.permalink },
      { enabled: !!props.proposal.permalink },
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
    if (props.proposal.permalink) {
      setValue('proposal', props.proposal.permalink)
    }
  }, [props.proposal.permalink, setValue])
  const { data: votingPower } = useQuery(
    ['votingPower', props.group, did, props.proposal],
    () =>
      calculateDecimal(
        props.group.permission.voting,
        did!,
        props.proposal.snapshots,
      ),
    { enabled: !!did },
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
  const { data: status } = useStatus(props.proposal.permalink)
  const now = useMemo(() => new Date(), [])
  const phase = useMemo(
    () => getPhase(now, status?.timestamp, props.group.duration),
    [now, props.group.duration, status?.timestamp],
  )
  const disables = useCallback(
    (did?: string) =>
      !did ||
      !voted ||
      !powers ||
      !!voted[did] ||
      !powers[did] ||
      phase !== Phase.VOTING,
    [voted, powers, phase],
  )
  const didOptions = useMemo(
    () =>
      voted && powers
        ? dids
            ?.filter((did) => powers[did].gt(0))
            .map((did) => ({
              did,
              label: `${voted[did] ? '(voted) ' : ''}${powers[did]}`,
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
  const handleSubmit = useMutation<void, Error, Vote>(async (vote) => {
    const signed = await signDocument(vote)
    await mutateAsync(signed)
    handleSuccess()
  })
  const defaultDid = useMemo(
    () => didOptions?.find(({ disabled }) => !disabled)?.did,
    [didOptions],
  )
  useEffect(() => {
    setDid(defaultDid || '')
  }, [defaultDid])

  return (
    <>
      <Notification type="error" show={handleSubmit.isError}>
        {handleSubmit.error?.message}
      </Notification>
      <Notification type="success" show={handleSubmit.isSuccess}>
        Your vote has been submitted successfully
      </Notification>
      <div className={clsx('mt-6 border-t border-gray-200', props.className)}>
        <FormItem error={errors.choice?.message}>
          <Controller
            control={control}
            name="choice"
            render={({ field: { ref, value, onChange } }) => (
              <ul
                ref={ref}
                role="list"
                className="mt-6 divide-y divide-gray-200 rounded-md border border-gray-200"
              >
                {props.proposal.options.map((option) => (
                  <ChoiceListItem
                    key={option}
                    type={props.proposal.voting_type}
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
        {props.proposal.permalink === previewPermalink ? null : phase ===
          Phase.ENDED ? (
          <p className="mt-6 text-end text-gray-500">Voting has ended</p>
        ) : (
          <div className="mt-6 flex w-full flex-col items-end">
            <div className="w-full flex-1 sm:w-64 sm:flex-none">
              <DidCombobox
                top
                label="Select a DID as voter"
                options={didOptions}
                value={did}
                onChange={setDid}
                onClick={connect}
              />
              {didOptions?.length === 0 && props.group ? (
                <Slide
                  title={`Voters of ${props.group.name}`}
                  trigger={({ handleOpen }) => (
                    <TextButton secondary onClick={handleOpen}>
                      Why I&#39;m not eligible to vote
                    </TextButton>
                  )}
                >
                  {() =>
                    props.group ? (
                      <PermissionCard
                        title="Voters"
                        description="SubDIDs who can vote in this workgroup"
                        value={props.group.permission.voting}
                      />
                    ) : null
                  }
                </Slide>
              ) : null}
            </div>
            {phase === Phase.VOTING ? (
              <Button
                large
                primary
                icon={BoltIcon}
                onClick={onSubmit(
                  (value) => handleSubmit.mutate(value),
                  console.error,
                )}
                disabled={disables(did)}
                loading={handleSubmit.isLoading}
                className="mt-6"
              >
                Vote{votingPower ? ` (${votingPower})` : null}
              </Button>
            ) : (
              <Tooltip
                place="top"
                text={
                  phase === Phase.CONFIRMING
                    ? 'Waiting for proposal confirming (in about 5 minutes)'
                    : status?.timestamp && props.group
                    ? `Waiting for voting start (in ${formatDurationMs(
                        status.timestamp.getTime() +
                          props.group.duration.pending * 1000 -
                          now.getTime(),
                      )})`
                    : 'Waiting for voting start'
                }
                className="mt-6"
              >
                <Button
                  large
                  primary
                  icon={BoltIcon}
                  onClick={onSubmit(
                    (value) => handleSubmit.mutate(value),
                    console.error,
                  )}
                  disabled={disables(did)}
                  loading={handleSubmit.isLoading}
                >
                  Vote{votingPower ? ` (${votingPower})` : null}
                </Button>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </>
  )
}
