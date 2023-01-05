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
import { SignatureAction } from '../src/signature'

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
    useSignJson(
      props.did,
      SignatureAction.EDIT_ORGANIZATION,
      connectedSignatureUnit,
    ),
  )
  const handleArweaveUpload = useAsync(
    useArweaveUpload('/api/sign-organization', handleSignJson.value),
  )
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
    <div>
      <h1>Organization: {props.did}</h1>
      <FormItem label="avatar">
        <Controller
          control={control}
          name="profile.avatar"
          render={({ field: { value, onChange } }) => (
            <AvatarInput name={props.did} value={value} onChange={onChange} />
          )}
        />
      </FormItem>
      <FormItem label="name">
        <Input {...register('profile.name')} />
      </FormItem>
      <FormItem label="about">
        <Input {...register('profile.about')} />
      </FormItem>
      <FormItem label="website">
        <Input {...register('profile.website')} />
      </FormItem>
      <FormItem label="term of service">
        <Input {...register('profile.tos')} />
      </FormItem>
      <FormItem label="communities">
        <Button onClick={() => appendCommunity({ type: 'twitter', value: '' })}>
          +
        </Button>
      </FormItem>
      {communities.map((field, index) => (
        <Fragment key={field.id}>
          <Select {...register(`communities.${index}.type`)}>
            <Select.Option value="twitter">twitter</Select.Option>
            <Select.Option value="discord">discord</Select.Option>
            <Select.Option value="github">github</Select.Option>
          </Select>
          <Input {...register(`communities.${index}.value`)} />
          <Button onClick={() => removeCommunity(index)}>-</Button>
          <br />
        </Fragment>
      ))}
      <FormItem label="workgroups">
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
