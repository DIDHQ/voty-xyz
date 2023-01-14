import { Fragment, useEffect, useMemo } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { nanoid } from 'nanoid'

import useAsync from '../hooks/use-async'
import { Organization, organizationSchema } from '../src/schemas'
import AvatarInput from './basic/avatar-input'
import WorkgroupForm from './workgroup-form'
import useCurrentSnapshot from '../hooks/use-current-snapshot'
import FormItem from './basic/form-item'
import useResolveDid from '../hooks/use-resolve-did'
import useSignJson from '../hooks/use-sign-json'
import useArweaveUpload from '../hooks/use-arweave-upload'
import useWallet from '../hooks/use-wallet'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'

export default function OrganizationForm(props: {
  did: string
  organization: Organization
}) {
  const { control, register, handleSubmit, reset, formState, setValue } =
    useForm<Organization>({
      resolver: zodResolver(organizationSchema),
    })
  const {
    fields: communities,
    append: appendCommunity,
    remove: removeCommunity,
  } = useFieldArray({
    control,
    name: 'communities',
  })
  const {
    fields: workgroups,
    append: appendWorkgroup,
    remove: removeWorkgroup,
  } = useFieldArray({
    control,
    name: 'workgroups',
  })
  useEffect(() => {
    reset(props.organization)
  }, [props.organization, reset])
  const { account } = useWallet()
  const { data: snapshot } = useCurrentSnapshot(account?.coinType)
  const handleSignJson = useAsync(useSignJson(props.did))
  const handleArweaveUpload = useAsync(useArweaveUpload(handleSignJson.value))
  const { data: resolved } = useResolveDid(
    props.did,
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
  useEffect(() => {
    setValue('did', props.did)
  }, [props.did, setValue])

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl">Organization: {props.did}</h1>
      <FormItem
        label="Avatar"
        error={formState.errors.profile?.avatar?.message}
      >
        <Controller
          control={control}
          name="profile.avatar"
          render={({ field: { value, onChange } }) => (
            <AvatarInput name={props.did} value={value} onChange={onChange} />
          )}
        />
      </FormItem>
      <FormItem label="Name" error={formState.errors.profile?.name?.message}>
        <TextInput
          error={!!formState.errors.profile?.name?.message}
          {...register('profile.name')}
        />
      </FormItem>
      <FormItem label="About" error={formState.errors.profile?.about?.message}>
        <Textarea
          error={!!formState.errors.profile?.about?.message}
          {...register('profile.about')}
        />
      </FormItem>
      <FormItem
        label="Website"
        error={formState.errors.profile?.website?.message}
      >
        <TextInput
          error={!!formState.errors.profile?.website?.message}
          {...register('profile.website')}
        />
      </FormItem>
      <FormItem
        label="Terms of service"
        error={formState.errors.profile?.tos?.message}
      >
        <TextInput
          error={!!formState.errors.profile?.tos?.message}
          {...register('profile.tos')}
        />
      </FormItem>
      <FormItem className="flex w-full" label="Communities">
        {communities.map((field, index) => (
          <div key={field.id} className="flex gap-4 mb-4">
            <select
              {...register(`communities.${index}.type`)}
              className="mt-1 block w-32 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value="twitter">Twitter</option>
              <option value="discord">Discord</option>
              <option value="github">GitHub</option>
            </select>
            <FormItem
              error={formState.errors.communities?.[index]?.value?.message}
            >
              <TextInput {...register(`communities.${index}.value`)} />
            </FormItem>
            <button onClick={() => removeCommunity(index)}>-</button>
          </div>
        ))}
        <button onClick={() => appendCommunity({ type: 'twitter', value: '' })}>
          +
        </button>
      </FormItem>
      <FormItem label="Workgroups" error={formState.errors.workgroups?.message}>
        {workgroups.map((field, index) => (
          <Fragment key={field.id}>
            <Controller
              control={control}
              name={`workgroups.${index}`}
              render={({ field: { value, onChange } }) => (
                <WorkgroupForm value={value} onChange={onChange} />
              )}
            />
            <button onClick={() => removeWorkgroup(index)}>-</button>
            <br />
          </Fragment>
        ))}
        <button
          onClick={() =>
            appendWorkgroup({
              id: nanoid(),
              profile: { name: '' },
              proposer_liberty: { operator: 'or', operands: [] },
              voting_power: { operator: 'sum', operands: [] },
              rules: {
                voting_duration: 0,
                voting_start_delay: 0,
                approval_condition_description: '',
              },
            })
          }
        >
          +
        </button>
      </FormItem>
      {handleSignJson.error ? <p>{handleSignJson.error.message}</p> : null}
      {handleArweaveUpload.error ? (
        <p>{handleArweaveUpload.error.message}</p>
      ) : null}
      {handleArweaveUpload.value ? (
        <a href={`https://arweave.net/${handleArweaveUpload.value}`}>
          ar://{handleArweaveUpload.value}
        </a>
      ) : null}
      <br />
      <button
        disabled={!isAdmin}
        // loading={handleSignJson.status === 'pending'}
        onClick={handleSubmit(handleSignJson.execute, console.error)}
      >
        Sign
      </button>
      <button
        disabled={!isAdmin || !handleSignJson.value}
        // loading={handleArweaveUpload.status === 'pending'}
        onClick={handleArweaveUpload.execute}
      >
        Submit
      </button>
    </div>
  )
}
