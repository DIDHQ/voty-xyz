import { zodResolver } from '@hookform/resolvers/zod'
import pMap from 'p-map'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import useSWR from 'swr'
import { PlusIcon, XMarkIcon } from '@heroicons/react/20/solid'

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
import { useRetrieve } from '../../../hooks/use-api'
import { DataType } from '../../../src/constants'

export default function CreateProposalPage() {
  const {
    register,
    setValue,
    getValues,
    watch,
    handleSubmit: onSubmit,
    control,
    formState,
  } = useForm<Proposal>({
    resolver: zodResolver(proposalSchema),
    defaultValues: { options: [''] },
  })
  const [query] = useRouterQuery<['did', 'group']>()
  const { data: config } = useDidConfig(query.did)
  const { data: community } = useRetrieve(DataType.COMMUNITY, config?.community)
  const group = useMemo(
    () =>
      query.group ? community?.groups?.[parseInt(query.group)] : undefined,
    [community?.groups, query.group],
  )
  const handleOptionDelete = useCallback(
    (index: number) => {
      const options = getValues('options')?.filter((_, i) => i !== index)
      setValue('options', options && options.length > 0 ? options : [''])
    },
    [setValue, getValues],
  )
  useEffect(() => {
    if (!config?.community) {
      return
    }
    setValue('community', config?.community)
  }, [config?.community, setValue])
  useEffect(() => {
    if (!query.group) {
      return
    }
    setValue('group', parseInt(query.group))
  }, [query.group, setValue])
  const { data: coinTypesOfNumberSets } = useSWR(
    group?.permission.voting_power
      ? ['requiredCoinTypesOfNumberSets', group.permission.voting_power]
      : null,
    () => requiredCoinTypesOfNumberSets(group!.permission.voting_power!),
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
    <div className="flex w-full flex-col px-8">
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
                {watch('options')?.map((_, index) => (
                  <div key={index} className="mb-4 flex rounded-md shadow-sm">
                    <div className="relative flex grow items-stretch focus-within:z-10">
                      <input
                        {...register(`options.${index}`)}
                        placeholder={`Option ${index + 1}`}
                        className="block w-full rounded-none rounded-l-md border border-gray-300 pl-4 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <OptionDelete index={index} onDelete={handleOptionDelete} />
                  </div>
                ))}
                <Button
                  onClick={() => {
                    setValue('options', [...(watch('options') || []), ''])
                  }}
                  className="px-2"
                >
                  <PlusIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </Button>
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
              className="mr-4 w-48"
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

function OptionDelete(props: {
  index: number
  onDelete: (index: number) => void
}) {
  const { onDelete } = props
  const handleDelete = useCallback(() => {
    onDelete(props.index)
  }, [onDelete, props.index])

  return (
    <button
      onClick={handleDelete}
      className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
    >
      <XMarkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
    </button>
  )
}
