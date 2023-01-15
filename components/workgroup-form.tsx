import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Organization, organizationSchema } from '../src/schemas'
import FormItem from './basic/form-item'
import TextInput from './basic/text-input'
import JsonInput from './json-input'
import NumericInput from './numeric-input'

export default function WorkgroupForm(props: {
  organization?: Organization
  workgroup: string
}) {
  const { control, register, reset, formState } = useForm<Organization>({
    resolver: zodResolver(organizationSchema),
  })
  useEffect(() => {
    reset(props.organization)
  }, [props.organization, reset])
  const index = useMemo(
    () =>
      props.organization?.workgroups?.findIndex(
        ({ id }) => id === props.workgroup,
      ),
    [props.organization?.workgroups, props.workgroup],
  )

  return index !== undefined ? (
    <div>
      <FormItem label="name" error={formState.errors.profile?.name?.message}>
        <TextInput {...register('profile.name')} />
      </FormItem>
      <FormItem label="about" error={formState.errors.profile?.about?.message}>
        <TextInput {...register('profile.about')} />
      </FormItem>
      <FormItem
        label="Proposer Liberty"
        error={formState.errors.workgroups?.[index]?.proposer_liberty?.message}
      >
        <Controller
          control={control}
          name={`workgroups.${index}.proposer_liberty`}
          render={({ field: { value, onChange } }) => (
            <JsonInput value={value} onChange={onChange} />
          )}
        />
      </FormItem>
      <FormItem
        label="Voting Power"
        error={formState.errors?.workgroups?.[index]?.voting_power?.message}
      >
        <Controller
          control={control}
          name={`workgroups.${index}.voting_power`}
          render={({ field: { value, onChange } }) => (
            <JsonInput value={value} onChange={onChange} />
          )}
        />
      </FormItem>
      <FormItem
        label="Voting Duration"
        error={
          formState.errors?.workgroups?.[index]?.rules?.voting_duration?.message
        }
      >
        <Controller
          control={control}
          name={`workgroups.${index}.rules.voting_duration`}
          render={({ field: { value, onChange } }) => (
            <NumericInput value={value} onChange={onChange} />
          )}
        />
      </FormItem>
      <FormItem
        label="Voting Start Delay"
        error={
          formState.errors?.workgroups?.[index]?.rules?.voting_start_delay
            ?.message
        }
      >
        <Controller
          control={control}
          name={`workgroups.${index}.rules.voting_start_delay`}
          render={({ field: { value, onChange } }) => (
            <NumericInput value={value} onChange={onChange} />
          )}
        />
      </FormItem>
      <FormItem
        label="Approval Condition Description"
        error={
          formState.errors?.workgroups?.[index]?.rules
            ?.approval_condition_description?.message
        }
      >
        <TextInput
          {...register(
            `workgroups.${index}.rules.approval_condition_description`,
          )}
        />
      </FormItem>
    </div>
  ) : null
}
