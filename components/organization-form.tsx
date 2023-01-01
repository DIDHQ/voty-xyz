import { createInstance } from 'dotbit'
import { Fragment, useCallback, useEffect } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import useSWR from 'swr'
import useArweaveFile from '../hooks/use-arweave-file'
import useAsync from '../hooks/use-async'
import { Organization } from '../src/schemas'
import AvatarInput from './avatar-input'

const dotbit = createInstance()

export default function OrganizationForm(props: { organization: string }) {
  const { data: hash } = useSWR(
    props.organization ? ['organization', props.organization] : null,
    async () => {
      const records = await dotbit.records(props.organization!, 'dweb.arweave')
      return records.find((record) => record.label === 'voty')?.value
    },
  )
  const { data } = useArweaveFile<Organization>(hash)
  const { control, register, handleSubmit, reset } = useForm<Organization>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'communities',
  })
  useEffect(() => {
    reset(data)
  }, [data, reset])
  const onSubmit = useAsync(useCallback(async () => {}, []))

  return (
    <form onSubmit={handleSubmit(onSubmit.execute)}>
      <h1>{props.organization}</h1>
      <label>avatar</label>
      <Controller
        control={control}
        name="profile.avatar"
        render={({ field: { value, onChange } }) => (
          <AvatarInput
            did={props.organization}
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
      <label>website</label>
      <input {...register('profile.website')} />
      <br />
      <label>term of service</label>
      <input {...register('profile.tos')} />
      <br />
      <label>communities</label>
      <button onClick={() => append({ type: 'twitter', value: '' })}>+</button>
      <br />
      {fields.map((field, index) => (
        <Fragment key={field.id}>
          <select {...register(`communities.${index}.type`)}>
            <option value="twitter">twitter</option>
            <option value="discord">discord</option>
            <option value="github">github</option>
          </select>
          <input {...register(`communities.${index}.value`)} />
          <button onClick={() => remove(index)}>-</button>
          <br />
        </Fragment>
      ))}
      <br />
      <input type="submit" disabled={onSubmit.status === 'pending'} />
    </form>
  )
}
