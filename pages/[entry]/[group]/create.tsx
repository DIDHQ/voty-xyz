import { zodResolver } from '@hookform/resolvers/zod'
import pMap from 'p-map'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import useSWR from 'swr'

import DidSelect from '../../../components/did-select'
import FormItem from '../../../components/basic/form-item'
import useRouterQuery from '../../../hooks/use-router-query'
import useAsync from '../../../hooks/use-async'
import useSignJson from '../../../hooks/use-sign-json'
import useWallet from '../../../hooks/use-wallet'
import { requiredCoinTypesOfNumberSets } from '../../../src/functions/number'
import { Proposal, proposalSchema } from '../../../src/schemas'
import { getCurrentSnapshot } from '../../../src/snapshot'
import Button from '../../../components/basic/button'
import TextInput from '../../../components/basic/text-input'
import Textarea from '../../../components/basic/textarea'
import Select from '../../../components/basic/select'
import { useEntryConfig, useRetrieve, useUpload } from '../../../hooks/use-api'
import { DataType } from '../../../src/constants'
import TextButton from '../../../components/basic/text-button'

export default function CreateProposalPage() {
  const {
    register,
    setValue,
    getValues,
    watch,
    handleSubmit: onSubmit,
    control,
    formState: { errors },
  } = useForm<Proposal>({
    resolver: zodResolver(proposalSchema),
    defaultValues: { options: [''] },
  })
  const [query] = useRouterQuery<['entry', 'group']>()
  const { data: config } = useEntryConfig(query.entry)
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
    group?.permission.voting
      ? ['requiredCoinTypesOfNumberSets', group.permission.voting]
      : null,
    () => requiredCoinTypesOfNumberSets(group!.permission.voting!),
  )
  const { data: snapshots } = useSWR(
    coinTypesOfNumberSets ? ['snapshots', coinTypesOfNumberSets] : null,
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
  const handleUpload = useUpload()
  const handleSubmit = useAsync(
    useCallback(
      async (json: Proposal) => {
        const signed = await handleSignJson(json)
        if (!signed) {
          throw new Error('signature failed')
        }
        await handleUpload(signed)
      },
      [handleUpload, handleSignJson],
    ),
  )

  return (
    <div className="flex w-full flex-col">
      <div className="space-y-8 divide-y divide-gray-200">
        <div className="pt-8">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Proposal
            </h3>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <FormItem label="Title" error={errors.title?.message}>
                <TextInput {...register('title')} />
              </FormItem>
            </div>
            <div className="sm:col-span-6">
              <FormItem label="Body" error={errors.extension?.body?.message}>
                <Textarea {...register('extension.body')} />
              </FormItem>
            </div>
            <div className="sm:col-span-6">
              <FormItem label="Voting type" error={errors.voting_type?.message}>
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
              <FormItem label="Options" error={errors.options?.message}>
                <ul
                  role="list"
                  className="mb-4 divide-y divide-gray-300 rounded-md border "
                >
                  {watch('options')?.map((_, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between py-3 pl-3 pr-4 text-sm"
                    >
                      <div className="flex w-0 flex-1 items-center">
                        <span className="ml-2 w-0 flex-1 truncate">
                          <input
                            {...register(`options.${index}`)}
                            placeholder={`Option ${index + 1}`}
                          />
                        </span>
                      </div>
                      <div className="ml-4 flex shrink-0 space-x-4">
                        <OptionDelete
                          index={index}
                          onDelete={handleOptionDelete}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                <TextButton
                  onClick={() => {
                    setValue('options', [...(watch('options') || []), ''])
                  }}
                >
                  Add
                </TextButton>
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

  return <TextButton onClick={handleDelete}>Remove</TextButton>
}
