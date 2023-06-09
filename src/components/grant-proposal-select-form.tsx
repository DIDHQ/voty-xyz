import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import pMap from 'p-map'
import { clsx } from 'clsx'

import {
  GrantProposalSelect,
  grantProposalSelectSchema,
} from '../utils/schemas/v1/grant-proposal-select'
import { trpc } from '../utils/trpc'
import useStatus from '../hooks/use-status'
import { getGrantPhase, GrantPhase } from '../utils/phase'
import { GrantProposal } from '../utils/schemas/v1/grant-proposal'
import { Grant } from '../utils/schemas/v1/grant'
import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import useSignDocument from '../hooks/use-sign-document'
import { previewPermalink } from '../utils/constants'
import sleep from '../utils/sleep'
import useNow from '../hooks/use-now'
import { checkBoolean } from '../utils/functions/boolean'
import DidCombobox from './did-combobox'
import Button from './basic/button'
import Notification from './basic/notification'
import Tooltip from './basic/tooltip'

export default function GrantProposalSelectForm(props: {
  grant: Grant
  grantProposal: GrantProposal & { permalink: string }
  onSuccess: () => void
  className?: string
}) {
  const { onSuccess } = props
  const [did, setDid] = useState('')
  const { account, connect } = useWallet()
  const { data: dids } = useDids(account, props.grant.snapshots)
  const { data, refetch } = useQuery(
    ['selecting', dids, props.grant],
    async () => {
      const booleans = await pMap(
        dids!,
        (did) =>
          checkBoolean(
            props.grant.permission.selecting!,
            did,
            props.grant.snapshots,
          ),
        { concurrency: 5 },
      )
      return dids!.reduce((obj, did, index) => {
        obj[did] = booleans[index]
        return obj
      }, {} as { [key: string]: boolean })
    },
    { enabled: !!dids && !!props.grant.permission.selecting },
  )
  const methods = useForm<GrantProposalSelect>({
    resolver: zodResolver(grantProposalSelectSchema),
  })
  const { setValue, handleSubmit: onSubmit } = methods
  useEffect(() => {
    if (props.grantProposal.permalink) {
      setValue('grant_proposal', props.grantProposal.permalink)
      setValue('selected', true)
    }
  }, [props.grantProposal.permalink, setValue])
  const { data: status } = useStatus(props.grantProposal.grant)
  const now = useNow()
  const phase = useMemo(
    () => getGrantPhase(now, status?.timestamp, props.grant.duration),
    [now, props.grant.duration, status?.timestamp],
  )
  const disables = useCallback(
    (did?: string) =>
      !did || !data || !data[did] || phase !== GrantPhase.PROPOSING,
    [data, phase],
  )
  const didOptions = useMemo(
    () =>
      data
        ? dids
            ?.filter((did) => data[did])
            .map((did) => ({ did, disabled: false }))
        : undefined,
    [dids, data],
  )
  const { mutateAsync } = trpc.grantProposalSelect.create.useMutation()
  const signDocument = useSignDocument(
    did,
    `You are selecting on Voty\n\nhash:\n{keccak256}`,
    props.grant.snapshots,
  )
  const handleSubmit = useMutation<void, Error, GrantProposalSelect>(
    async (select) => {
      const signed = await signDocument(select)
      await mutateAsync(signed)
      await sleep(5000)
    },
    {
      onSuccess() {
        refetch()
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
        Your selection has been submitted successfully
      </Notification>
      {phase === GrantPhase.ENDED ? null : (
        <div className={clsx('mt-6 border-t border-gray-200', props.className)}>
          {props.grantProposal.permalink === previewPermalink ? null : (
            <div className="mt-6 flex w-full flex-col items-end">
              <div className="w-full flex-1 sm:w-64 sm:flex-none">
                <DidCombobox
                  top
                  label="Choose a DID as committee"
                  options={didOptions}
                  value={did}
                  onChange={setDid}
                  onClick={connect}
                />
              </div>
              {phase === GrantPhase.PROPOSING ? (
                <Button
                  large
                  primary
                  onClick={onSubmit(
                    (value) => handleSubmit.mutate(value),
                    console.error,
                  )}
                  disabled={disables(did)}
                  loading={handleSubmit.isLoading}
                  className="mt-6"
                >
                  Select
                </Button>
              ) : (
                <Tooltip
                  place="top"
                  text={
                    phase === GrantPhase.CONFIRMING
                      ? 'Waiting for proposal confirming (in about 5 minutes)'
                      : 'Waiting for select starting'
                  }
                  className="mt-6"
                >
                  <Button
                    large
                    primary
                    onClick={onSubmit(
                      (value) => handleSubmit.mutate(value),
                      console.error,
                    )}
                    disabled={disables(did)}
                    loading={handleSubmit.isLoading}
                  >
                    Select
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
