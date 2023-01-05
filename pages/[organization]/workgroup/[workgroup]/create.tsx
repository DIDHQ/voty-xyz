import { zodResolver } from '@hookform/resolvers/zod'
import { Add } from '@icon-park/react'
import pMap from 'p-map'
import { useEffect, useMemo, useState } from 'react'
import { Button, Input, Select, Textarea } from 'react-daisyui'
import { useForm } from 'react-hook-form'
import useSWR from 'swr'

import DidSelect from '../../../../components/did-select'
import FormItem from '../../../../components/form-item'
import useRouterQuery from '../../../../components/use-router-query'
import useArweaveFile from '../../../../hooks/use-arweave-file'
import useArweaveUpload from '../../../../hooks/use-arweave-upload'
import useAsync from '../../../../hooks/use-async'
import useConnectedSignatureUnit from '../../../../hooks/use-connected-signature-unit'
import useDidConfig from '../../../../hooks/use-did-config'
import useSignJson from '../../../../hooks/use-sign-json'
import { requiredCoinTypesOfVotingPower } from '../../../../src/functions/voting-power'
import { Organization, Proposal, proposalSchema } from '../../../../src/schemas'
import { getCurrentSnapshot } from '../../../../src/snapshot'

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
  const [typesCount, setTypesCount] = useState(0)
  const [did, setDid] = useState('')
  const connectedSignatureUnit = useConnectedSignatureUnit()
  const handleSignJson = useAsync(useSignJson(did, connectedSignatureUnit))
  const handleArweaveUpload = useAsync(
    useArweaveUpload('/api/sign-proposal', handleSignJson.value),
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
      {handleSignJson.error ? <p>{handleSignJson.error.message}</p> : null}
      {handleArweaveUpload.error ? (
        <p>{handleArweaveUpload.error.message}</p>
      ) : null}
      {handleArweaveUpload.value ? (
        <a href={`https://arweave.net/${handleArweaveUpload.value}`}>
          ar://{handleArweaveUpload.value}
        </a>
      ) : null}
      <br />
      <Button
        disabled={!did}
        onClick={handleSubmit(handleSignJson.execute, console.error)}
        loading={handleSignJson.status === 'pending'}
      >
        Sign
      </Button>
      <Button
        disabled={!handleSignJson.value}
        onClick={handleArweaveUpload.execute}
        loading={handleArweaveUpload.status === 'pending'}
      >
        Upload
      </Button>
    </>
  )
}
