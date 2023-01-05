import { zodResolver } from '@hookform/resolvers/zod'
import { Add } from '@icon-park/react'
import Arweave from 'arweave'
import { SerializedUploader } from 'arweave/web/lib/transaction-uploader'
import pMap from 'p-map'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Input, Select, Textarea } from 'react-daisyui'
import { useForm } from 'react-hook-form'
import useSWR from 'swr'

import DidSelect from '../../../../components/did-select'
import FormItem from '../../../../components/form-item'
import useRouterQuery from '../../../../components/use-router-query'
import useArweaveFile from '../../../../hooks/use-arweave-file'
import useAsync from '../../../../hooks/use-async'
import useConnectedSignatureUnit from '../../../../hooks/use-connected-signature-unit'
import useCurrentSnapshot from '../../../../hooks/use-current-snapshot'
import useDidConfig from '../../../../hooks/use-did-config'
import useSignMessage from '../../../../hooks/use-sign-message'
import { requiredCoinTypesOfVotingPower } from '../../../../src/functions/voting-power'
import { Organization, Proposal, proposalSchema } from '../../../../src/schemas'
import { wrapJsonMessage } from '../../../../src/signature'
import { getCurrentSnapshot } from '../../../../src/snapshot'
import { fetchJson } from '../../../../src/utils/fetcher'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

export default function CreateProposalPage() {
  const { register, setValue, handleSubmit } = useForm<Proposal>({
    resolver: zodResolver(proposalSchema),
  })
  const [query] = useRouterQuery<['organization', 'workgroup']>()
  const { data: config } = useDidConfig(query.organization)
  const { data: organization } = useArweaveFile<Organization>(
    config?.organization,
  )
  const workgroup = useMemo(
    () =>
      organization?.workgroups?.find(
        ({ profile }) => profile.name === query.workgroup,
      ),
    [organization?.workgroups, query.workgroup],
  )
  useEffect(() => {
    if (!config?.organization) {
      return
    }
    setValue('organization', config?.organization)
  }, [config?.organization, setValue])
  useEffect(() => {
    if (!workgroup) {
      return
    }
    setValue('workgroup', workgroup.id)
  }, [query.workgroup, setValue, workgroup])
  const { data: coinTypesOfVotingPower } = useSWR(
    workgroup?.voting_power
      ? ['requiredCoinTypesOfVotingPower', workgroup.voting_power]
      : null,
    () => requiredCoinTypesOfVotingPower(workgroup!.voting_power!),
  )
  const { data: snapshots } = useSWR(
    ['snapshots', coinTypesOfVotingPower],
    async () => {
      const snapshots = await pMap(
        coinTypesOfVotingPower!,
        getCurrentSnapshot,
        { concurrency: 5 },
      )
      return snapshots.reduce((obj, snapshot, index) => {
        obj[coinTypesOfVotingPower![index]] = snapshot.toString()
        return obj
      }, {} as { [coinType: string]: string })
    },
  )
  useEffect(() => {
    if (snapshots) {
      setValue('snapshots', snapshots)
    }
  }, [setValue, snapshots])
  useEffect(() => {
    if (!workgroup) {
      return
    }
    const timer = setInterval(() => {
      setValue(
        'start',
        Math.ceil(Date.now() / 1000) + workgroup.rules.voting_start_delay,
      )
      setValue(
        'end',
        Math.ceil(Date.now() / 1000) +
          workgroup.rules.voting_start_delay +
          workgroup.rules.voting_duration,
      )
    }, 1000)
    return () => {
      clearInterval(timer)
    }
  }, [setValue, workgroup])
  const [typesCount, setTypesCount] = useState(0)
  const [did, setDid] = useState('')
  const connectedSignatureUnit = useConnectedSignatureUnit()
  const signMessage = useSignMessage(connectedSignatureUnit?.coinType)
  const { data: snapshot } = useCurrentSnapshot(
    connectedSignatureUnit?.coinType,
  )
  const onSubmit = useAsync(
    useCallback(
      async (proposal: Proposal) => {
        // if (!window.ethereum) {
        //   return
        // }
        if (!snapshot || !connectedSignatureUnit) {
          return
        }
        const data = await signMessage(
          await wrapJsonMessage('create proposal', proposal),
        )
        const textEncoder = new TextEncoder()
        const body = textEncoder.encode(
          JSON.stringify({
            ...proposal,
            signature: {
              did,
              snapshot: snapshot.toString(),
              coin_type: connectedSignatureUnit.coinType,
              address: connectedSignatureUnit.address,
              data,
            },
          }),
        )
        const serializedUploader = await fetchJson<SerializedUploader>(
          '/api/sign-proposal',
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
      [connectedSignatureUnit, did, signMessage, snapshot],
    ),
  )

  return (
    <>
      <FormItem label="Title">
        <Input {...register('title')} />
      </FormItem>
      <FormItem label="Body">
        <Textarea {...register('body')} />
      </FormItem>
      <FormItem label="Discussion">
        <Input {...register('discussion')} />
      </FormItem>
      <FormItem label="Type">
        <Select {...register('type')}>
          {proposalSchema.shape.type.options.map((proposalType) => (
            <Select.Option key={proposalType} value={proposalType}>
              {proposalType}
            </Select.Option>
          ))}
        </Select>
      </FormItem>
      <FormItem label="Choices">
        {Array.from({ length: typesCount })?.map((_, index) => (
          <Input key={index} {...register(`choices.${index}`)} />
        ))}
        <Button onClick={() => setTypesCount((old) => old + 1)}>
          <Add />
        </Button>
      </FormItem>
      <DidSelect
        signatureUnit={connectedSignatureUnit}
        value={did}
        onChange={setDid}
      />
      <Button onClick={handleSubmit(onSubmit.execute, console.error)}>
        Submit
      </Button>
    </>
  )
}
