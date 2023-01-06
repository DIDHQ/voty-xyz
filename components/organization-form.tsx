import { Button, Input, Select } from 'react-daisyui'
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
import useConnectedSignatureUnit from '../hooks/use-connected-signature-unit'
import useResolveDid from '../hooks/use-resolve-did'
import useSignJson from '../hooks/use-sign-json'
import useArweaveUpload from '../hooks/use-arweave-upload'

export default function OrganizationForm(props: {
  did: string
  organization: Organization
}) {
  const { control, register, handleSubmit, reset, formState } =
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
  const connectedSignatureUnit = useConnectedSignatureUnit()
  const { data: snapshot } = useCurrentSnapshot(
    connectedSignatureUnit?.coinType,
  )
  const handleSignJson = useAsync(
    useSignJson(props.did, connectedSignatureUnit),
  )
  const handleArweaveUpload = useAsync(useArweaveUpload(handleSignJson.value))
  const { data: resolved } = useResolveDid(
    props.did,
    connectedSignatureUnit?.coinType,
    snapshot,
  )
  const isAdmin = useMemo(
    () =>
      resolved &&
      connectedSignatureUnit &&
      resolved.coinType === connectedSignatureUnit.coinType &&
      resolved.address === connectedSignatureUnit.address,
    [resolved, connectedSignatureUnit],
  )

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
        <Input
          color={formState.errors.profile?.name ? 'error' : undefined}
          maxLength={50}
          {...register('profile.name', {
            required: true,
          })}
        />
      </FormItem>
      <FormItem label="About" error={formState.errors.profile?.about?.message}>
        <Input maxLength={120} {...register('profile.about')} />
      </FormItem>
      <FormItem
        label="Website"
        error={formState.errors.profile?.website?.message}
      >
        <Input {...register('profile.website')} />
      </FormItem>
      <FormItem
        label="Terms of service"
        error={formState.errors.profile?.tos?.message}
      >
        <Input {...register('profile.tos')} />
      </FormItem>
      <FormItem
        className="flex w-full"
        label="Communities"
        error={formState.errors.communities?.message}
      >
        {communities.map((field, index) => (
          <div className="flex gap-5 mb-3" key={field.id}>
            <Select {...register(`communities.${index}.type`)}>
              <Select.Option value="twitter">Twitter</Select.Option>
              <Select.Option value="discord">Discord</Select.Option>
              <Select.Option value="github">GitHub</Select.Option>
            </Select>
            <Input
              className="grow"
              {...register(`communities.${index}.value`)}
            />
            <Button onClick={() => removeCommunity(index)}>-</Button>
          </div>
        ))}
        <Button onClick={() => appendCommunity({ type: 'twitter', value: '' })}>
          +
        </Button>
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
            <Button onClick={() => removeWorkgroup(index)}>-</Button>
            <br />
          </Fragment>
        ))}
        <Button
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
        </Button>
      </FormItem>
      {workgroups.map((field, index) => (
        <Fragment key={field.id}>
          <Controller
            control={control}
            name={`workgroups.${index}`}
            render={({ field: { value, onChange } }) => (
              <WorkgroupForm value={value} onChange={onChange} />
            )}
          />
          <Button onClick={() => removeWorkgroup(index)}>-</Button>
          <br />
        </Fragment>
      ))}
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
      <Button
        disabled={!isAdmin}
        loading={handleSignJson.status === 'pending'}
        onClick={handleSubmit(handleSignJson.execute, console.error)}
      >
        Sign
      </Button>
      <Button
        disabled={!isAdmin || !handleSignJson.value}
        loading={handleArweaveUpload.status === 'pending'}
        onClick={handleArweaveUpload.execute}
      >
        Sign
      </Button>
    </div>
  )
}
