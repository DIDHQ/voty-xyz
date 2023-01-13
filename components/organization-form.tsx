import { Fragment, useEffect, useMemo } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { nanoid } from 'nanoid'

import useAsync from '../hooks/use-async'
import { Organization, organizationSchema } from '../src/schemas'
import AvatarInput from './avatar-input'
import WorkgroupForm from './workgroup-form'
import useCurrentSnapshot from '../hooks/use-current-snapshot'
import FormItem from './form-item'
import useResolveDid from '../hooks/use-resolve-did'
import useSignJson from '../hooks/use-sign-json'
import useArweaveUpload from '../hooks/use-arweave-upload'
import useWallet from '../hooks/use-wallet'
import InputWithValidationError from './basic/input-with-validation-error'

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
            <AvatarInput
              size={80}
              name={props.did}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </FormItem>
      <InputWithValidationError
        type="text"
        label="Name"
        error={formState.errors.profile?.name?.message}
        {...register('profile.name')}
      />
      <InputWithValidationError
        type="text"
        label="About"
        error={formState.errors.profile?.about?.message}
      >
        <input {...register('profile.about')} />
      </InputWithValidationError>
      <InputWithValidationError
        type="text"
        label="Website"
        error={formState.errors.profile?.website?.message}
      >
        <input {...register('profile.website')} />
      </InputWithValidationError>
      <InputWithValidationError
        type="text"
        label="Terms of service"
        error={formState.errors.profile?.tos?.message}
      >
        <input {...register('profile.tos')} />
      </InputWithValidationError>
      <FormItem className="flex w-full" label="Communities">
        {communities.map((field, index) => (
          <div className="flex gap-5 mb-3" key={field.id}>
            <select {...register(`communities.${index}.type`)}>
              <option value="twitter">Twitter</option>
              <option value="discord">Discord</option>
              <option value="github">GitHub</option>
            </select>
            <FormItem
              error={formState.errors.communities?.[index]?.value?.message}
              className="grow"
            >
              <input {...register(`communities.${index}.value`)} />
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
