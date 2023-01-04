import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Button, Input } from 'react-daisyui'
import { Controller, useForm } from 'react-hook-form'
import { Workgroup, workgroupSchema } from '../src/schemas'
import AvatarInput from './avatar-input'
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
      <label>avatar</label>
      <Controller
        control={control}
        name="profile.avatar"
        render={({ field: { value, onChange } }) => (
          <AvatarInput
            name={props.value.id}
            value={value}
            onChange={onChange}
          />
        )}
      />
      <br />
      <label>name</label>
      <Input {...register('profile.name')} />
      <br />
      <label>about</label>
      <Input {...register('profile.about')} />
      <br />
      <label>proposer liberty</label>
      <Controller
        control={control}
        name="proposer_liberty"
        render={({ field: { value, onChange } }) => (
          <JsonInput value={value} onChange={onChange} />
        )}
      />
      <br />
      <label>voting power</label>
      <Controller
        control={control}
        name="voting_power"
        render={({ field: { value, onChange } }) => (
          <JsonInput value={value} onChange={onChange} />
        )}
      />
      <br />
      <label>voting duration</label>
      <Controller
        control={control}
        name="rules.voting_duration"
        render={({ field: { value, onChange } }) => (
          <NumericInput value={value} onChange={onChange} />
        )}
      />
      <br />
      <label>voting start delay</label>
      <Controller
        control={control}
        name="rules.voting_start_delay"
        render={({ field: { value, onChange } }) => (
          <NumericInput value={value} onChange={onChange} />
        )}
      />
      <br />
      <label>approval condition description</label>
      <Input {...register('rules.approval_condition_description')} />
      <br />
      <Button
        disabled={!formState.isDirty || !formState.isValid}
        onClick={handleSubmit(props.onChange)}
      >
        ok
      </Button>
    </div>
  )
}
