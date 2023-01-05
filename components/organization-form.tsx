import { Button, Input, Select } from 'react-daisyui'
import { Fragment, useCallback, useEffect, useMemo } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { nanoid } from 'nanoid'
import Arweave from 'arweave'
import type { SerializedUploader } from 'arweave/web/lib/transaction-uploader'
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

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

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
              did: props.did,
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
      [connectedSignatureUnit, props.did, signMessage, snapshot],
    ),
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
    <div className="flex flex-col gap-5">
      <h1 className="text-xl">Organization: {props.did}</h1>
      <FormItem label="Avatar">
        <Controller
          control={control}
          name="profile.avatar"
          render={({ field: { value, onChange } }) => (
            <AvatarInput name={props.did} value={value} onChange={onChange} />
          )}
        />
      </FormItem>
      <FormItem
        label="Name"
        required
        isError={Boolean(formState.errors.profile?.name)}
        errorMessage={formState.errors.profile?.name?.message}
      >
        <Input
          color={formState.errors.profile?.name ? 'error' : undefined}
          maxLength={50}
          {...register('profile.name', {
            required: true,
          })}
        />
      </FormItem>
      <FormItem label="About">
        <Input maxLength={120} {...register('profile.about')} />
      </FormItem>
      <FormItem label="Website">
        <Input {...register('profile.website')} />
      </FormItem>
      <FormItem label="Terms of service">
        <Input {...register('profile.tos')} />
      </FormItem>
      <FormItem className="flex w-full" label="Communities">
        {communities.map((field, index) => (
          <div className="flex gap-5 mb-3" key={field.id}>
            <Select {...register(`communities.${index}.type`)}>
              <Select.Option value="twitter">Twitter</Select.Option>
              <Select.Option value="discord">Discord</Select.Option>
              <Select.Option value="github">GitHub</Select.Option>
            </Select>
            <Input
              className="grow"
              {...register(`communities.${index}.value`)}
            />
            <Button onClick={() => removeCommunity(index)}>-</Button>
          </div>
        ))}
        <Button onClick={() => appendCommunity({ type: 'twitter', value: '' })}>
          +
        </Button>
      </FormItem>
      <FormItem label="Workgroups">
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
      <Button
        color="primary"
        disabled={!isAdmin || !formState.isValid}
        loading={onSubmit.status === 'pending'}
        onClick={handleSubmit(onSubmit.execute, console.error)}
      >
        Submit
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
