import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Workgroup, workgroupSchema } from '../src/schemas'
import AvatarInput from './avatar-input'
import FormItem from './basic/form-item'
import JsonInput from './json-input'
import NumericInput from './numeric-input'

export default function WorkgroupForm(props: {
  value: Workgroup
  onChange(value: Workgroup): void
}) {
  const { control, register, handleSubmit, reset, formState } =
    useForm<Workgroup>({
      resolver: zodResolver(workgroupSchema),
    })
  useEffect(() => {
    reset(props.value)
  }, [props.value, reset])

  return (
    <div>
      <h2>Workgroup: {props.value.id}</h2>
      <FormItem
        label="avatar"
        error={formState.errors.profile?.avatar?.message}
      >
        <Controller
          control={control}
          name="profile.avatar"
          render={({ field: { value, onChange } }) => (
            <AvatarInput
              size={80}
              name={props.value.id}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </FormItem>
      <FormItem label="name" error={formState.errors.profile?.name?.message}>
        <input {...register('profile.name')} />
      </FormItem>
      <FormItem label="about" error={formState.errors.profile?.about?.message}>
        <input {...register('profile.about')} />
      </FormItem>
      <FormItem
        label="proposer liberty"
        error={formState.errors.proposer_liberty?.message}
      >
        <Controller
          control={control}
          name="proposer_liberty"
          render={({ field: { value, onChange } }) => (
            <JsonInput value={value} onChange={onChange} />
          )}
        />
      </FormItem>
      <FormItem
        label="voting power"
        error={formState.errors.voting_power?.message}
      >
        <Controller
          control={control}
          name="voting_power"
          render={({ field: { value, onChange } }) => (
            <JsonInput value={value} onChange={onChange} />
          )}
        />
      </FormItem>
      <FormItem
        label="voting duration"
        error={formState.errors.rules?.voting_duration?.message}
      >
        <Controller
          control={control}
          name="rules.voting_duration"
          render={({ field: { value, onChange } }) => (
            <NumericInput value={value} onChange={onChange} />
          )}
        />
      </FormItem>
      <FormItem
        label="voting start delay"
        error={formState.errors.rules?.voting_start_delay?.message}
      >
        <Controller
          control={control}
          name="rules.voting_start_delay"
          render={({ field: { value, onChange } }) => (
            <NumericInput value={value} onChange={onChange} />
          )}
        />
      </FormItem>
      <FormItem
        label="approval condition description"
        error={formState.errors.rules?.approval_condition_description?.message}
      >
        <input {...register('rules.approval_condition_description')} />
      </FormItem>
      <button
        disabled={!formState.isDirty || !formState.isValid}
        onClick={handleSubmit(props.onChange)}
      >
        ok
      </button>
    </div>
  )
}
