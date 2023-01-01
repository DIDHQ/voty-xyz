import { createInstance } from 'dotbit'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import useSWR from 'swr'
import AvatarInput from '../../components/avatar-input'
import useArweaveFile from '../../hooks/use-arweave-file'
import { Organization } from '../../src/schemas'

const dotbit = createInstance()

export default function OrganizationSettingsPage() {
  const router = useRouter()
  const organization = router.query.organization as string | undefined
  const { data: hash } = useSWR(
    organization ? ['organization', organization] : null,
    async () => {
      const records = await dotbit.records(organization!, 'dweb.arweave')
      return records.find((record) => record.label === 'voty')?.value
    },
  )
  const { data } = useArweaveFile<Organization>(hash)
  const { register, watch, handleSubmit, reset, setValue } =
    useForm<Organization>()
  useEffect(() => {
    reset(data)
  }, [data, reset])
  const onSubmit = console.log

  return organization ? (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>avatar</label>
      <AvatarInput
        did={organization}
        value={watch('profile.avatar')}
        onChange={(avatar) => setValue('profile.avatar', avatar)}
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
      <input type="submit" />
    </form>
  ) : null
}
