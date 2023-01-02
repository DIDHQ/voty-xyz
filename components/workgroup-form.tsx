import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Workgroup, workgroupSchema } from '../src/schemas'
import AvatarInput from './avatar-input'

export default function WorkgroupForm(props: {
  value: Workgroup
  onChange(value: Workgroup): void
}) {
  const { control, register, handleSubmit, reset } = useForm<Workgroup>({
    resolver: zodResolver(workgroupSchema),
  })
  useEffect(() => {
    reset(props.value)
  }, [props.value, reset])

  return (
    <form onSubmit={handleSubmit(props.onChange)}>
      <h2>{props.value.id}</h2>
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
      <input {...register('profile.name')} />
      <br />
      <label>about</label>
      <input {...register('profile.about')} />
      <br />
    </form>
  )
}
