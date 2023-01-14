import { zodResolver } from '@hookform/resolvers/zod'
import pMap from 'p-map'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import useSWR from 'swr'

import DidSelect from '../../../../components/did-select'
import FormItem from '../../../../components/basic/form-item'
import useRouterQuery from '../../../../hooks/use-router-query'
import useArweaveData from '../../../../hooks/use-arweave-data'
import useArweaveUpload from '../../../../hooks/use-arweave-upload'
import useAsync from '../../../../hooks/use-async'
import useDidConfig from '../../../../hooks/use-did-config'
import useSignJson from '../../../../hooks/use-sign-json'
import useWallet from '../../../../hooks/use-wallet'
import { requiredCoinTypesOfVotingPower } from '../../../../src/functions/voting-power'
import {
  organizationWithSignatureSchema,
  Proposal,
  proposalSchema,
} from '../../../../src/schemas'
import { getCurrentSnapshot } from '../../../../src/snapshot'
import ChoiceList from '../../../../components/choice-list'
import Button from '../../../../components/basic/button'

export default function CreateProposalPage() {
  const {
    register,
    setValue,
    handleSubmit: onSubmit,
    control,
    formState,
  } = useForm<Proposal>({
    resolver: zodResolver(proposalSchema),
  })
  const [query] = useRouterQuery<['did', 'workgroup']>()
  const { data: config } = useDidConfig(query.did)
  const { data: organization } = useArweaveData(
    organizationWithSignatureSchema,
    config?.organization,
  )
  const workgroup = useMemo(
    () =>
      organization?.workgroups?.find(
        ({ profile }) => profile.name === query.workgroup,
      ),
    [organization?.workgroups, query.workgroup],
  )
  useEffect(() => {
    if (!config?.organization) {
      return
    }
    setValue('organization', config?.organization)
  }, [config?.organization, setValue])
  useEffect(() => {
    if (!workgroup) {
      return
    }
    setValue('workgroup', workgroup.id)
  }, [query.workgroup, setValue, workgroup])
  const { data: coinTypesOfVotingPower } = useSWR(
    workgroup?.voting_power
      ? ['requiredCoinTypesOfVotingPower', workgroup.voting_power]
      : null,
    () => requiredCoinTypesOfVotingPower(workgroup!.voting_power!),
  )
  const { data: snapshots } = useSWR(
    ['snapshots', coinTypesOfVotingPower],
    async () => {
      const snapshots = await pMap(
        coinTypesOfVotingPower!,
        getCurrentSnapshot,
        { concurrency: 5 },
      )
      return snapshots.reduce((obj, snapshot, index) => {
        obj[coinTypesOfVotingPower![index]] = snapshot.toString()
        return obj
      }, {} as { [coinType: string]: string })
    },
  )
  useEffect(() => {
    if (snapshots) {
      setValue('snapshots', snapshots)
    }
  }, [setValue, snapshots])
  useEffect(() => {
    if (query.did) {
      setValue('did', query.did)
    }
  }, [query.did, setValue])

  const [did, setDid] = useState('')
  const { account } = useWallet()
  const handleSignJson = useSignJson(did)
  const handleArweaveUpload = useArweaveUpload()
  const handleSubmit = useAsync(
    useCallback(
      async (json: Proposal) => {
        const signed = await handleSignJson(json)
        if (!signed) {
          throw new Error('signature failed')
        }
        await handleArweaveUpload(signed)
      },
      [handleArweaveUpload, handleSignJson],
    ),
  )

  return (
    <>
      <FormItem label="Title" error={formState.errors.title?.message}>
        <input {...register('title')} />
      </FormItem>
      <FormItem label="Body" error={formState.errors.body?.message}>
        <textarea {...register('body')} />
      </FormItem>
      <FormItem label="Discussion" error={formState.errors.discussion?.message}>
        <input {...register('discussion')} />
      </FormItem>
      <FormItem label="Type" error={formState.errors.type?.message}>
        <select {...register('type')}>
          {proposalSchema.shape.type.options.map((proposalType) => (
            <option key={proposalType} value={proposalType}>
              {proposalType}
            </option>
          ))}
        </select>
      </FormItem>
      <FormItem label="Choices" error={formState.errors.choices?.message}>
        <Controller
          control={control}
          name="choices"
          render={({ field: { value, onChange } }) => (
            <ChoiceList
              disabled={false}
              value={value || ['']}
              onChange={onChange}
            />
          )}
        />
      </FormItem>
      <DidSelect account={account} value={did} onChange={setDid} />
      <Button
        primary
        disabled={!did}
        onClick={onSubmit(handleSubmit.execute)}
        loading={handleSubmit.status === 'pending'}
      >
        Submit
      </Button>
    </>
  )
}
