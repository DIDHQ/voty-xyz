import { createInstance } from 'dotbit'
import { Fragment, useCallback, useEffect } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import useSWR from 'swr'
import { zodResolver } from '@hookform/resolvers/zod'
import { nanoid } from 'nanoid'
import Arweave from 'arweave'
import type { SerializedUploader } from 'arweave/web/lib/transaction-uploader'
import useArweaveFile from '../hooks/use-arweave-file'
import useAsync from '../hooks/use-async'
import { Organization, organizationSchema } from '../src/schemas'
import AvatarInput from './avatar-input'
import WorkgroupForm from './workgroup-form'

const dotbit = createInstance()

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

export default function OrganizationForm(props: { organization: string }) {
  const { data: hash } = useSWR(
    props.organization ? ['organization', props.organization] : null,
    async () => {
      const records = await dotbit.records(props.organization!, 'dweb.arweave')
      return records.find((record) => record.label === 'voty')?.value
    },
  )
  const { data } = useArweaveFile<Organization>(hash)
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
    reset(data)
  }, [data, reset])
  const onSubmit = useAsync(
    useCallback(async (organization: Organization) => {
      // if (!window.ethereum) {
      //   return
      // }
      const body = JSON.stringify(organization)
      const response = await fetch('/api/setup-organization', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      })
      if (!response.ok) {
        throw new Error('server error')
      }
      const serializedUploader = (await response.json()) as SerializedUploader
      // const dotbit = createInstance({
      //   network: BitNetwork.mainnet,
      //   signer: new ProviderSigner(window.ethereum as any),
      // })
      // await window.ethereum.request({ method: 'eth_requestAccounts' })
      // await dotbit.account(props.organization).updateRecords([
      //   {
      //     key: 'dweb.arweave',
      //     value: json.transaction.id,
      //     label: 'voty',
      //     ttl: '',
      //   },
      // ])
      const textEncoder = new TextEncoder()
      const uploader = await arweave.transactions.getUploader(
        serializedUploader,
        textEncoder.encode(body),
      )
      while (!uploader.isComplete) {
        await uploader.uploadChunk()
      }
      return serializedUploader.transaction.id as string
    }, []),
  )

  return (
    <form onSubmit={handleSubmit(onSubmit.execute, console.error)}>
      <h1>{props.organization}</h1>
      <label>avatar</label>
      <Controller
        control={control}
        name="profile.avatar"
        render={({ field: { value, onChange } }) => (
          <AvatarInput
            name={props.organization}
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
      <button onClick={() => appendCommunity({ type: 'twitter', value: '' })}>
        +
      </button>
      <br />
      {communities.map((field, index) => (
        <Fragment key={field.id}>
          <select {...register(`communities.${index}.type`)}>
            <option value="twitter">twitter</option>
            <option value="discord">discord</option>
            <option value="github">github</option>
          </select>
          <input {...register(`communities.${index}.value`)} />
          <button onClick={() => removeCommunity(index)}>-</button>
          <br />
        </Fragment>
      ))}
      <label>workgroups</label>
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
      <br />
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
      <input
        type="submit"
        disabled={!formState.isValid || onSubmit.status === 'pending'}
      />
      {onSubmit.error ? <p>{onSubmit.error.message}</p> : null}
      {onSubmit.value ? (
        <a href={`https://arweave.net/${onSubmit.value}`}>{onSubmit.value}</a>
      ) : null}
    </form>
  )
}
