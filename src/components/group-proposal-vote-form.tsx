import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { Decimal } from 'decimal.js'
import pMap from 'p-map'

import { calculateDecimal } from '../utils/functions/decimal'
import {
  GroupProposalVote,
  groupProposalVoteSchema,
} from '../utils/schemas/v1/group-proposal-vote'
import { trpc } from '../utils/trpc'
import useStatus from '../hooks/use-status'
import { getGroupProposalPhase, GroupProposalPhase } from '../utils/phase'
import { GroupProposal } from '../utils/schemas/v1/group-proposal'
import { Group } from '../utils/schemas/v1/group'
import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import useSignDocument from '../hooks/use-sign-document'
import { formatDurationMs } from '../utils/time'
import { previewPermalink } from '../utils/constants'
import sleep from '../utils/sleep'
import useNow from '../hooks/use-now'
import { FormItem } from './basic/form'
import { ChoiceListItem } from './choice-list-item'
import DidCombobox from './did-combobox'
import Button from './basic/button'
import TextButton from './basic/text-button'
import Notification from './basic/notification'
import Tooltip from './basic/tooltip'
import Slide from './basic/slide'
import PermissionCard from './permission-card'
import Card from './basic/card'

export default function GroupProposalVoteForm(props: {
  group: Group
  groupProposal: GroupProposal & { permalink: string }
  onSuccess: () => void
  className?: string
}) {
  const { onSuccess } = props
  const { data: choices, refetch: refetchChoices } =
    trpc.groupProposalVoteChoice.groupByOption.useQuery({
      groupProposal: props.groupProposal.permalink,
    })
  const [did, setDid] = useState('')
  const { account, connect } = useWallet()
  const { data: dids } = useDids(account, props.groupProposal.snapshots)
  const { data: powers } = useQuery(
    [dids, props.group, props.groupProposal.snapshots],
    async () => {
      const decimals = await pMap(
        dids!,
        (did) =>
          calculateDecimal(
            props.group.permission.voting,
            did,
            props.groupProposal.snapshots,
          ),
        { concurrency: 5 },
      )
      return dids!.reduce(
        (obj, did, index) => {
          obj[did] = decimals[index]
          return obj
        },
        {} as { [key: string]: Decimal | undefined },
      )
    },
    { enabled: !!dids },
  )
  const { data: voted, refetch: refetchVoted } =
    trpc.groupProposalVote.groupByVoter.useQuery(
      { groupProposal: props.groupProposal.permalink },
      { enabled: !!props.groupProposal.permalink },
    )
  const methods = useForm<GroupProposalVote>({
    resolver: zodResolver(groupProposalVoteSchema),
  })
  const {
    setValue,
    resetField,
    control,
    formState: { errors },
    handleSubmit: onSubmit,
  } = methods
  useEffect(() => {
    if (props.groupProposal.permalink) {
      setValue('group_proposal', props.groupProposal.permalink)
    }
  }, [props.groupProposal.permalink, setValue])
  const { data: totalPower } = useQuery(
    ['votingPower', props.group, did, props.groupProposal],
    () =>
      calculateDecimal(
        props.group.permission.voting,
        did!,
        props.groupProposal.snapshots,
      ),
    { enabled: !!did },
  )
  useEffect(() => {
    if (totalPower === undefined) {
      resetField('total_power')
    } else {
      setValue('total_power', totalPower.toString())
    }
  }, [resetField, setValue, totalPower])
  const { data: status } = useStatus(props.groupProposal.permalink)
  const now = useNow()
  const phase = useMemo(
    () => getGroupProposalPhase(now, status?.timestamp, props.group.duration),
    [now, props.group.duration, status?.timestamp],
  )
  const disables = useCallback(
    (did?: string) =>
      !did ||
      !voted ||
      !powers ||
      !!voted[did] ||
      !powers[did] ||
      phase !== GroupProposalPhase.VOTING,
    [voted, powers, phase],
  )
  const didOptions = useMemo(
    () =>
      voted && powers
        ? dids
            ?.filter((did) => powers[did]?.gt(0))
            .map((did) => ({
              did,
              label: `${voted[did] ? '(voted) ' : ''}${powers[did]}`,
              disabled: !!voted[did],
            }))
        : undefined,
    [dids, powers, voted],
  )
  const { mutateAsync } = trpc.groupProposalVote.create.useMutation()
  const signDocument = useSignDocument(
    did,
    `You are voting on Voty\n\nhash:\n{keccak256}`,
    props.groupProposal.snapshots,
  )
  const handleSubmit = useMutation<void, Error, GroupProposalVote>(
    async (vote) => {
      const signed = await signDocument(vote)
      await mutateAsync(signed)
      await sleep(500)
    },
    {
      onSuccess() {
        setValue('powers', {})
        refetchChoices()
        refetchVoted()
        onSuccess()
      },
    },
  )
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

      <Card title="Choices">
        <FormItem error={errors.powers?.message?.message}>
          <Controller
            control={control}
            name="powers"
            render={({ field: { ref, value, onChange } }) => (
              <ul className="space-y-3" ref={ref}>
                {props.groupProposal.choices.map((choice) => (
                  <ChoiceListItem
                    key={choice}
                    type={props.groupProposal.voting_type}
                    choice={choice}
                    votingPower={totalPower}
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

        {props.groupProposal.permalink === previewPermalink ||
        phase === GroupProposalPhase.ENDED ? null : (
          <div className="mt-6 flex w-full flex-col items-end">
            <div className="w-full sm:w-64">
              <DidCombobox
                top
                label="Choose a DID as voter"
                options={didOptions}
                value={did}
                onChange={setDid}
                onClick={connect}
              />

              {!defaultDid && props.group ? (
                <Slide
                  title={`Voters of ${props.group.name}`}
                  trigger={({ handleOpen }) => (
                    <TextButton primary onClick={handleOpen} className="mt-2">
                      Why I&#39;m not eligible to vote?
                    </TextButton>
                  )}
                >
                  {() => (
                    <PermissionCard
                      title="Voters"
                      description="SubDIDs who can vote in this workgroup. The greatest voting power will be allocated when a SubDID has multiple occurrence."
                      value={props.group.permission.voting}
                    />
                  )}
                </Slide>
              ) : null}
            </div>

            {phase === GroupProposalPhase.VOTING ? (
              <Button
                className="mt-6 min-w-[96px]"
                onClick={onSubmit(
                  (value) => handleSubmit.mutate(value),
                  console.error,
                )}
                disabled={disables(did)}
                loading={handleSubmit.isLoading}
              >
                Vote{totalPower ? ` (${totalPower})` : null}
              </Button>
            ) : (
              <Tooltip
                place="top"
                text={
                  phase === GroupProposalPhase.CONFIRMING
                    ? 'Waiting for proposal confirming (in about 5 minutes)'
                    : status?.timestamp && props.group
                    ? `Waiting for vote starting (in ${formatDurationMs(
                        status.timestamp.getTime() +
                          props.group.duration.announcing * 1000 -
                          now.getTime(),
                      )})`
                    : 'Waiting for vote starting'
                }
                className="mt-6"
              >
                <Button
                  className="min-w-[96px]"
                  onClick={onSubmit(
                    (value) => handleSubmit.mutate(value),
                    console.error,
                  )}
                  disabled={disables(did)}
                  loading={handleSubmit.isLoading}
                >
                  Vote{totalPower ? ` (${totalPower})` : null}
                </Button>
              </Tooltip>
            )}
          </div>
        )}
      </Card>
    </>
  )
}
