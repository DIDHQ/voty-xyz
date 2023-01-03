import { createInstance } from 'dotbit'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import useSWR from 'swr'
import { zodResolver } from '@hookform/resolvers/zod'
import { nanoid } from 'nanoid'
import Arweave from 'arweave'
import type { SerializedUploader } from 'arweave/web/lib/transaction-uploader'
import { useAccount, useNetwork, useSignMessage } from 'wagmi'
import useArweaveFile from '../hooks/use-arweave-file'
import useAsync from '../hooks/use-async'
import { Organization, organizationSchema } from '../src/schemas'
import AvatarInput from './avatar-input'
import WorkgroupForm from './workgroup-form'
import { fetchJson } from '../src/utils/fetcher'
import { chain_id_to_coin_type } from '../src/constants'
import DidSelect from './did-select'

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
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState,
  } = useForm<Organization>({
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
      const textEncoder = new TextEncoder()
      const body = textEncoder.encode(JSON.stringify(organization))
      const serializedUploader = await fetchJson<SerializedUploader>(
        '/api/sign-organization',
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body,
        },
      )
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
      const uploader = await arweave.transactions.getUploader(
        serializedUploader,
        body,
      )
      while (!uploader.isComplete) {
        await uploader.uploadChunk()
      }
      return serializedUploader.transaction.id as string
    }, []),
  )
  const { signMessageAsync } = useSignMessage()
  const account = useAccount()
  const network = useNetwork()
  const [did, setDid] = useState('')
  const handleSign = useAsync(
    useCallback(async () => {
      if (!network.chain || !account.address || !did) {
        return
      }
      const { signature: _omit, ...rest } = getValues()
      const sig = Buffer.from(
        (await signMessageAsync({ message: JSON.stringify(rest) })).substring(
          2,
        ),
        'hex',
      ).toString('base64')
      setValue(
        'signature',
        {
          did,
          snapshot: '0', // TODO: use real snapshot
          coin_type: chain_id_to_coin_type[network.chain.id],
          address: account.address,
          sig,
        },
        { shouldValidate: true },
      )
    }, [
      account.address,
      did,
      getValues,
      network.chain,
      setValue,
      signMessageAsync,
    ]),
  )

  return (
    <div>
      <h1>Organization: {props.organization}</h1>
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
      <DidSelect value={did} onChange={setDid} />
      <button
        disabled={
          !network.chain ||
          !account.address ||
          !did ||
          handleSign.status === 'pending'
        }
        onClick={handleSign.execute}
      >
        sign
      </button>
      <button
        disabled={!formState.isValid || onSubmit.status === 'pending'}
        onClick={handleSubmit(onSubmit.execute, console.error)}
      >
        submit
      </button>
      <br />
      {onSubmit.error ? <p>{onSubmit.error.message}</p> : null}
      {onSubmit.value ? (
        <a href={`https://arweave.net/${onSubmit.value}`}>
          ar://{onSubmit.value}
        </a>
      ) : null}
    </div>
  )
}
