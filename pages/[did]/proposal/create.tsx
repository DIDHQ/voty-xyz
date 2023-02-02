import { zodResolver } from '@hookform/resolvers/zod'
import pMap from 'p-map'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import useSWR from 'swr'

import DidSelect from '../../../components/did-select'
import FormItem from '../../../components/basic/form-item'
import useRouterQuery from '../../../hooks/use-router-query'
import useArweaveUpload from '../../../hooks/use-arweave-upload'
import useAsync from '../../../hooks/use-async'
import useDidConfig from '../../../hooks/use-did-config'
import useSignJson from '../../../hooks/use-sign-json'
import useWallet from '../../../hooks/use-wallet'
import { requiredCoinTypesOfNumberSets } from '../../../src/functions/number'
import { Proposal, proposalSchema } from '../../../src/schemas'
import { getCurrentSnapshot } from '../../../src/snapshot'
import Button from '../../../components/basic/button'
import TextInput from '../../../components/basic/text-input'
import Textarea from '../../../components/basic/textarea'
import Select from '../../../components/basic/select'
import JsonInput from '../../../components/json-input'
import { useRetrieve } from '../../../hooks/use-api'
import { DataType } from '../../../src/constants'

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
  const [query] = useRouterQuery<['did', 'group']>()
  const { data: config } = useDidConfig(query.did)
  const { data: community } = useRetrieve(DataType.COMMUNITY, config?.community)
  const group = useMemo(
    () => community?.groups?.find(({ id }) => id === query.group),
    [community?.groups, query.group],
  )
  useEffect(() => {
    if (!config?.community) {
      return
    }
    setValue('community', config?.community)
  }, [config?.community, setValue])
  useEffect(() => {
    if (!group) {
      return
    }
    setValue('group', group.id)
  }, [setValue, group])
  const { data: coinTypesOfNumberSets } = useSWR(
    group?.voting_power
      ? ['requiredCoinTypesOfNumberSets', group.voting_power]
      : null,
    () => requiredCoinTypesOfNumberSets(group!.voting_power!),
  )
  const { data: snapshots } = useSWR(
    ['snapshots', coinTypesOfNumberSets],
    async () => {
      const snapshots = await pMap(coinTypesOfNumberSets!, getCurrentSnapshot, {
        concurrency: 5,
      })
      return snapshots.reduce((obj, snapshot, index) => {
        obj[coinTypesOfNumberSets![index]] = snapshot.toString()
        return obj
      }, {} as { [coinType: string]: string })
    },
  )
  useEffect(() => {
    if (snapshots) {
      setValue('snapshots', snapshots)
    }
  }, [setValue, snapshots])
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
    <div className="flex flex-col w-full px-8">
      <div className="space-y-8 divide-y divide-gray-200">
        <div className="pt-8">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Proposal
            </h3>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <FormItem label="Title" error={formState.errors.title?.message}>
                <TextInput {...register('title')} />
              </FormItem>
            </div>
            <div className="sm:col-span-6">
              <FormItem
                label="Body"
                error={formState.errors.extension?.body?.message}
              >
                <Textarea {...register('extension.body')} />
              </FormItem>
            </div>
            <div className="sm:col-span-6">
              <FormItem
                label="Voting type"
                error={formState.errors.voting_type?.message}
              >
                <Controller
                  control={control}
                  name="voting_type"
                  render={({ field: { value, onChange } }) => (
                    <Select
                      options={proposalSchema.shape.voting_type.options}
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </FormItem>
            </div>
            <div className="sm:col-span-6">
              <FormItem
                label="Options"
                error={formState.errors.options?.message}
              >
                <Controller
                  control={control}
                  name="options"
                  render={({ field: { value, onChange } }) => (
                    <JsonInput value={value || []} onChange={onChange} />
                  )}
                />
              </FormItem>
            </div>
          </div>
        </div>
        <div className="pt-5">
          <div className="flex justify-end">
            <DidSelect
              account={account}
              value={did}
              onChange={setDid}
              className="w-48 mr-4"
            />
            <Button
              primary
              disabled={!did}
              onClick={onSubmit(handleSubmit.execute, console.error)}
              loading={handleSubmit.status === 'pending'}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
