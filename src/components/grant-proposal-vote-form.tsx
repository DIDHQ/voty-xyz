import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { BoltIcon } from '@heroicons/react/20/solid'
import type { Decimal } from 'decimal.js'
import pMap from 'p-map'
import clsx from 'clsx'

import { calculateDecimal } from '../utils/functions/decimal'
import {
  GrantProposalVote,
  grantProposalVoteSchema,
} from '../utils/schemas/v1/grant-proposal-vote'
import { trpc } from '../utils/trpc'
import useStatus from '../hooks/use-status'
import { getGrantPhase, GrantPhase } from '../utils/phase'
import { GrantProposal } from '../utils/schemas/v1/grant-proposal'
import { Grant } from '../utils/schemas/v1/grant'
import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
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
import sleep from '../utils/sleep'
import useNow from '../hooks/use-now'

export default function GrantProposalVoteForm(props: {
  grant: Grant
  grantProposal: GrantProposal & { permalink: string }
  onSuccess: () => void
  className?: string
}) {
  const { onSuccess } = props
  const [did, setDid] = useState('')
  const { account, connect } = useWallet()
  const { data: dids } = useDids(account, props.grant.snapshots)
  const { data: powers } = useQuery(
    [dids, props.grant, props.grant.snapshots],
    async () => {
      const decimals = await pMap(
        dids!,
        (did) =>
          calculateDecimal(
            props.grant.permission.voting,
            did,
            props.grant.snapshots,
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
    trpc.grantProposalVote.groupByVoter.useQuery(
      { grant: props.grantProposal.grant },
      { enabled: !!props.grantProposal.grant },
    )
  const methods = useForm<GrantProposalVote>({
    resolver: zodResolver(grantProposalVoteSchema),
  })
  const { setValue, resetField, handleSubmit: onSubmit } = methods
  useEffect(() => {
    if (props.grantProposal.permalink) {
      setValue('grant_proposal', props.grantProposal.permalink)
    }
  }, [props.grantProposal.permalink, setValue])
  const { data: totalPower } = useQuery(
    ['votingPower', props.grant, did],
    () =>
      calculateDecimal(
        props.grant.permission.voting,
        did!,
        props.grant.snapshots,
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
  const { data: status } = useStatus(props.grantProposal.grant)
  const now = useNow()
  const phase = useMemo(
    () => getGrantPhase(now, status?.timestamp, props.grant.duration),
    [now, props.grant.duration, status?.timestamp],
  )
  const disables = useCallback(
    (did?: string) =>
      !did ||
      !voted ||
      !powers ||
      !!voted[did] ||
      !powers[did] ||
      phase !== GrantPhase.VOTING,
    [voted, powers, phase],
  )
  const didOptions = useMemo(
    () =>
      voted && powers
        ? dids?.map((did) => ({
            did,
            label: `${voted[did] ? '(voted) ' : ''}${powers[did]}`,
            disabled: !!voted[did] || !powers[did].gt(0),
          }))
        : undefined,
    [dids, powers, voted],
  )
  const { mutateAsync } = trpc.grantProposalVote.create.useMutation()
  const signDocument = useSignDocument(
    did,
    `You are voting on Voty\n\nhash:\n{sha256}`,
  )
  const handleSubmit = useMutation<void, Error, GrantProposalVote>(
    async (vote) => {
      const signed = await signDocument(vote)
      await mutateAsync(signed)
      await sleep(5000)
    },
  )
  const defaultDid = useMemo(
    () => didOptions?.find(({ disabled }) => !disabled)?.did,
    [didOptions],
  )
  useEffect(() => {
    setDid(defaultDid || '')
  }, [defaultDid])
  useEffect(() => {
    if (totalPower) {
      setValue('powers', {
        [props.grantProposal.permalink]: totalPower.toString(),
      })
    }
  }, [props.grantProposal.permalink, setValue, totalPower])
  useEffect(() => {
    if (handleSubmit.isSuccess) {
      setValue('powers', {})
      refetchVoted()
      onSuccess()
    }
  }, [handleSubmit.isSuccess, onSuccess, refetchVoted, setValue])

  return (
    <>
      <Notification type="error" show={handleSubmit.isError}>
        {handleSubmit.error?.message}
      </Notification>
      <Notification type="success" show={handleSubmit.isSuccess}>
        Your vote has been submitted successfully
      </Notification>
      {phase === GrantPhase.ENDED ? null : (
        <div className={clsx('mt-6 border-t border-gray-200', props.className)}>
          {props.grantProposal.permalink === previewPermalink ? null : (
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
                {!defaultDid && props.grant ? (
                  <Slide
                    title={`Voters of ${props.grant.name}`}
                    trigger={({ handleOpen }) => (
                      <TextButton secondary onClick={handleOpen}>
                        Why I&#39;m not eligible to vote?
                      </TextButton>
                    )}
                  >
                    {() => (
                      <PermissionCard
                        title="Voters"
                        description="SubDIDs who can vote in this grant. The greatest voting power will be allocated when a SubDID has multiple occurrence."
                        value={props.grant.permission.voting}
                      />
                    )}
                  </Slide>
                ) : null}
              </div>
              {phase === GrantPhase.VOTING ? (
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
                  Vote{totalPower ? ` (${totalPower})` : null}
                </Button>
              ) : (
                <Tooltip
                  place="top"
                  text={
                    phase === GrantPhase.CONFIRMING
                      ? 'Waiting for proposal confirming (in about 5 minutes)'
                      : status?.timestamp && props.grant
                      ? `Waiting for vote starting (in ${formatDurationMs(
                          status.timestamp.getTime() +
                            props.grant.duration.announcing * 1000 +
                            props.grant.duration.proposing * 1000 -
                            now.getTime(),
                        )})`
                      : 'Waiting for vote starting'
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
                    Vote{totalPower ? ` (${totalPower})` : null}
                  </Button>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}
