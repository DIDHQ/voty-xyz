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
    () => fields.findIndex(({ id }) => id === props.group),
    [fields, props.group],
  )
  const { account } = useWallet()
  const { data: snapshot } = useCurrentSnapshot(account?.coinType)
  const handleSignJson = useSignJson(props.community.did)
  const handleArweaveUpload = useArweaveUpload()
  const { data: resolved } = useResolveDid(
    props.community.did,
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
    () => !props.community.groups?.find(({ id }) => id === props.group),
    [props.community.groups, props.group],
  )
  useEffect(() => {
    if (isNew) {
      append(
        {
          id: props.group,
          profile: { name: '' },
          proposer_liberty: {
            operator: 'or',
            operands: [],
          },
          voting_power: {
            operator: 'sum',
            operands: [],
          },
          rules: {
            voting_duration: 0,
            voting_start_delay: 0,
            approval_condition_description: '',
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
              label="name"
              error={formState.errors.profile?.name?.message}
            >
              <TextInput {...register(`groups.${index}.profile.name`)} />
            </FormItem>
          </div>
          <div className="sm:col-span-6">
            <FormItem
              label="about"
              error={formState.errors.profile?.about?.message}
            >
              <Textarea {...register(`groups.${index}.profile.about`)} />
            </FormItem>
          </div>
          <div className="sm:col-span-6">
            <FormItem
              label="Proposer Liberty"
              error={
                formState.errors.groups?.[index]?.proposer_liberty?.message
              }
            >
              <Controller
                control={control}
                name={`groups.${index}.proposer_liberty`}
                render={({ field: { value, onChange } }) => (
                  <JsonInput value={value} onChange={onChange} />
                )}
              />
            </FormItem>
          </div>
          <div className="sm:col-span-6">
            <FormItem
              label="Voting Power"
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
              label="Voting Duration"
              error={
                formState.errors?.groups?.[index]?.rules?.voting_duration
                  ?.message
              }
            >
              <Controller
                control={control}
                name={`groups.${index}.rules.voting_duration`}
                render={({ field: { value, onChange } }) => (
                  <NumericInput value={value} onChange={onChange} />
                )}
              />
            </FormItem>
          </div>
          <div className="sm:col-span-6">
            <FormItem
              label="Voting Start Delay"
              error={
                formState.errors?.groups?.[index]?.rules?.voting_start_delay
                  ?.message
              }
            >
              <Controller
                control={control}
                name={`groups.${index}.rules.voting_start_delay`}
                render={({ field: { value, onChange } }) => (
                  <NumericInput value={value} onChange={onChange} />
                )}
              />
            </FormItem>
          </div>
          <div className="sm:col-span-6">
            <FormItem
              label="Approval Condition Description"
              error={
                formState.errors?.groups?.[index]?.rules
                  ?.approval_condition_description?.message
              }
            >
              <TextInput
                {...register(
                  `groups.${index}.rules.approval_condition_description`,
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
