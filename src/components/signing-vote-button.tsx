import { useMutation, useQuery } from '@tanstack/react-query'
import Decimal from 'decimal.js'
import dynamic from 'next/dynamic'
import pMap from 'p-map'
import { ExoticComponent, ReactNode, useEffect, useId, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'

import useDids from '../hooks/use-dids'
import useSignDocument from '../hooks/use-sign-document'
import useWallet from '../hooks/use-wallet'
import { calculateDecimal } from '../utils/functions/number'
import { Vote } from '../utils/schemas/vote'
import { Workgroup } from '../utils/schemas/workgroup'
import { trpc } from '../utils/trpc'
import { Snapshots } from '../utils/types'
import Button from './basic/button'
import DidCombobox from './did-combobox'
import Notification from './basic/notification'

const Tooltip = dynamic(
  () => import('react-tooltip').then(({ Tooltip }) => Tooltip),
  { ssr: false },
)

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
  const { onSuccess, onChange } = props
  const { account, connect } = useWallet()
  const { data: dids } = useDids(account, props.snapshots)
  const { handleSubmit: onSubmit } = useFormContext<Vote>()
  const signDocument = useSignDocument(
    props.value,
    `You are voting on Voty\n\nhash:\n{sha256}`,
  )
  const { mutateAsync } = trpc.vote.create.useMutation()
  const handleSign = useMutation<void, Error, Vote>(async (vote) => {
    const signed = await signDocument(vote)
    if (signed) {
      onSuccess(await mutateAsync(signed))
    }
  })
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
    { proposal: props.proposal },
    { enabled: !!dids && !!props.proposal, refetchOnWindowFocus: false },
  )
  useEffect(() => {
    if (handleSign.isSuccess) {
      refetch()
    }
  }, [handleSign.isSuccess, refetch])
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
  const defaultDid = useMemo(
    () => didOptions?.find(({ disabled }) => !disabled)?.did,
    [didOptions],
  )
  useEffect(() => {
    onChange(defaultDid || '')
  }, [defaultDid, onChange])
  const disabled = useMemo(
    () => !didOptions?.filter(({ disabled }) => !disabled).length,
    [didOptions],
  )

  return (
    <>
      <Notification show={handleSign.status === 'error'}>
        {handleSign.error?.message}
      </Notification>
      <DidCombobox
        label="Select a DID as voter"
        top
        options={didOptions}
        value={props.value}
        onChange={props.onChange}
        disabled={disabled}
        onClick={connect}
        placeholder={didOptions?.length === 0 ? 'No available DIDs' : undefined}
        className="w-full flex-1 sm:w-auto sm:flex-none"
      />
      {props.waiting ? (
        <>
          <div data-tooltip-id={id} data-tooltip-place="top" className="mt-6">
            <Button
              large
              primary
              icon={props.icon}
              onClick={onSubmit(
                (value) => handleSign.mutate(value),
                console.error,
              )}
              disabled={props.disabled}
              loading={handleSign.isLoading}
            >
              {props.children}
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
          icon={props.icon}
          onClick={onSubmit((value) => handleSign.mutate(value), console.error)}
          disabled={props.disabled}
          loading={handleSign.isLoading}
          className="mt-6"
        >
          {props.children}
        </Button>
      )}
    </>
  )
}
