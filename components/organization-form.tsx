import { Button, Input, Select } from 'react-daisyui'
import { Fragment, useCallback, useEffect, useMemo } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { nanoid } from 'nanoid'
import Arweave from 'arweave'
import type { SerializedUploader } from 'arweave/web/lib/transaction-uploader'
import useArweaveFile from '../hooks/use-arweave-file'
import useAsync from '../hooks/use-async'
import { Organization, organizationSchema } from '../src/schemas'
import AvatarInput from './avatar-input'
import WorkgroupForm from './workgroup-form'
import { fetchJson } from '../src/utils/fetcher'
import useCurrentSnapshot from '../hooks/use-current-snapshot'
import FormItem from './form-item'
import useConnectedSignatureUnit from '../hooks/use-connected-signature-unit'
import useResolveDid from '../hooks/use-resolve-did'
import useSignMessage from '../hooks/use-sign-message'
import { wrapJsonMessage } from '../src/signature'
import useDidConfig from '../hooks/use-did-config'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

export default function OrganizationForm(props: { organization: string }) {
  const { data: hash } = useDidConfig(props.organization, 'voty')
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
  const connectedSignatureUnit = useConnectedSignatureUnit()
  const signMessage = useSignMessage(connectedSignatureUnit?.coinType)
  const { data: snapshot } = useCurrentSnapshot(
    connectedSignatureUnit?.coinType,
  )
  const onSubmit = useAsync(
    useCallback(
      async (organization: Organization) => {
        // if (!window.ethereum) {
        //   return
        // }
        if (!snapshot || !connectedSignatureUnit) {
          return
        }
        const hex = await signMessage(
          await wrapJsonMessage('edit organization', organization),
        )
        const textEncoder = new TextEncoder()
        const body = textEncoder.encode(
          JSON.stringify({
            ...organization,
            signature: {
              did: props.organization,
              snapshot: snapshot.toString(),
              coin_type: connectedSignatureUnit.coinType,
              address: connectedSignatureUnit.address,
              hex,
            },
          }),
        )
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
      },
      [connectedSignatureUnit, props.organization, signMessage, snapshot],
    ),
  )
  const { data: resolved } = useResolveDid(
    props.organization,
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
      <h1>Organization: {props.organization}</h1>
      <FormItem label="avatar">
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
      <Button
        disabled={!isAdmin || !formState.isValid}
        loading={onSubmit.status === 'pending'}
        onClick={handleSubmit(onSubmit.execute, console.error)}
      >
        submit
      </Button>
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
