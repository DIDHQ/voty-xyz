import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'

import useArweaveUpload from '../hooks/use-arweave-upload'
import useAsync from '../hooks/use-async'
import useCurrentSnapshot from '../hooks/use-current-snapshot'
import useResolveDid from '../hooks/use-resolve-did'
import useSignJson from '../hooks/use-sign-json'
import useWallet from '../hooks/use-wallet'
import { Community, communitySchema } from '../src/schemas'
import Button from './basic/button'
import FormItem from './basic/form-item'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import JsonInput from './json-input'
import NumericInput from './numeric-input'

export default function GroupForm(props: {
  entry: string
  community: Community
  group: string
}) {
  const {
    control,
    register,
    handleSubmit: onSubmit,
    reset,
    formState,
  } = useForm<Community>({
    resolver: zodResolver(communitySchema),
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'groups',
    keyName: '_id',
  })
  useEffect(() => {
    reset(props.community)
  }, [props.community, reset])
  const index = useMemo(
    () => fields.findIndex(({ extension: { id } }) => id === props.group),
    [fields, props.group],
  )
  const { account } = useWallet()
  const { data: snapshot } = useCurrentSnapshot(account?.coinType)
  const handleSignJson = useSignJson(props.entry)
  const handleArweaveUpload = useArweaveUpload()
  const { data: resolved } = useResolveDid(
    props.entry,
    account?.coinType,
    snapshot,
  )
  const isAdmin = useMemo(
    () =>
      resolved &&
      account &&
      resolved.coinType === account.coinType &&
      resolved.address === account.address,
    [resolved, account],
  )
  const handleSubmit = useAsync(
    useCallback(
      async (json: Community) => {
        const signed = await handleSignJson(json)
        if (!signed) {
          throw new Error('signature failed')
        }
        await handleArweaveUpload(signed)
      },
      [handleArweaveUpload, handleSignJson],
    ),
  )
  const isNew = useMemo(
    () =>
      !props.community.groups?.find(
        ({ extension: { id } }) => id === props.group,
      ),
    [props.community.groups, props.group],
  )
  useEffect(() => {
    if (isNew) {
      append(
        {
          name: '',
          proposal_rights: {
            operator: 'or',
            operands: [],
          },
          voting_power: {
            operator: 'sum',
            operands: [],
          },
          timing: {
            publicity: 3600,
            voting: 86400,
            adding_option: 86400,
          },
          extension: {
            id: props.group,
          },
        },
        { shouldFocus: false },
      )
    }
  }, [append, isNew, props.group])

  return index < 0 ? null : (
    <div className="space-y-8 divide-y divide-gray-200">
      <div className="pt-8">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">Group</h3>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-6">
            <FormItem
              label="Name"
              error={formState.errors.groups?.[index]?.name?.message}
            >
              <TextInput {...register(`groups.${index}.name`)} />
            </FormItem>
          </div>
          <div className="sm:col-span-6">
            <FormItem
              label="About"
              error={
                formState.errors.groups?.[index]?.extension?.about?.message
              }
            >
              <Textarea {...register(`groups.${index}.extension.about`)} />
            </FormItem>
          </div>
          <div className="sm:col-span-6">
            <FormItem
              label="Proposal rights"
              error={formState.errors.groups?.[index]?.proposal_rights?.message}
            >
              <Controller
                control={control}
                name={`groups.${index}.proposal_rights`}
                render={({ field: { value, onChange } }) => (
                  <JsonInput value={value} onChange={onChange} />
                )}
              />
            </FormItem>
          </div>
          <div className="sm:col-span-6">
            <FormItem
              label="Voting power"
              error={formState.errors?.groups?.[index]?.voting_power?.message}
            >
              <Controller
                control={control}
                name={`groups.${index}.voting_power`}
                render={({ field: { value, onChange } }) => (
                  <JsonInput value={value} onChange={onChange} />
                )}
              />
            </FormItem>
          </div>
          <div className="sm:col-span-6">
            <FormItem
              label="Add option rights"
              error={
                formState.errors.groups?.[index]?.add_option_rights?.message
              }
            >
              <Controller
                control={control}
                name={`groups.${index}.add_option_rights`}
                render={({ field: { value, onChange } }) => (
                  <JsonInput value={value} onChange={onChange} />
                )}
              />
            </FormItem>
          </div>
          <div className="sm:col-span-2">
            <FormItem
              label="Publicity"
              error={
                formState.errors?.groups?.[index]?.timing?.publicity?.message
              }
            >
              <Controller
                control={control}
                name={`groups.${index}.timing.publicity`}
                render={({ field: { value, onChange } }) => (
                  <NumericInput value={value} onChange={onChange} />
                )}
              />
            </FormItem>
          </div>
          <div className="sm:col-span-2">
            <FormItem
              label="Voting"
              error={formState.errors?.groups?.[index]?.timing?.voting?.message}
            >
              <Controller
                control={control}
                name={`groups.${index}.timing.voting`}
                render={({ field: { value, onChange } }) => (
                  <NumericInput value={value} onChange={onChange} />
                )}
              />
            </FormItem>
          </div>
          <div className="sm:col-span-2">
            <FormItem
              label="Adding option"
              error={
                formState.errors?.groups?.[index]?.timing?.adding_option
                  ?.message
              }
            >
              <Controller
                control={control}
                name={`groups.${index}.timing.adding_option`}
                render={({ field: { value, onChange } }) => (
                  <NumericInput value={value} onChange={onChange} />
                )}
              />
            </FormItem>
          </div>
        </div>
      </div>
      <div className="pt-5">
        <div className="flex justify-between">
          {isNew ? (
            <div />
          ) : (
            <Button
              onClick={() => {
                remove(index)
                onSubmit(console.log, console.error)()
              }}
            >
              Delete
            </Button>
          )}
          <Button
            primary
            disabled={!isAdmin}
            loading={handleSubmit.status === 'pending'}
            onClick={onSubmit(handleSubmit.execute, console.error)}
          >
            {isNew ? 'Create' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  )
}
