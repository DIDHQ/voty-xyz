import { zodResolver } from '@hookform/resolvers/zod'
import { Add } from '@icon-park/react'
import { unzip } from 'lodash-es'
import pMap from 'p-map'
import { useEffect, useMemo, useState } from 'react'
import { Button, Input, Select, Textarea } from 'react-daisyui'
import { useForm } from 'react-hook-form'
import useSWR from 'swr'

import FormItem from '../../../../components/form-item'
import useRouterQuery from '../../../../components/use-router-query'
import useArweaveFile from '../../../../hooks/use-arweave-file'
import useDidConfig from '../../../../hooks/use-did-config'
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
      return new Map<number, string>(
        unzip([
          coinTypesOfVotingPower!,
          snapshots.map((snapshot) => snapshot.toString()),
        ] as unknown[][]) as [number, string][],
      )
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
      <Button onClick={handleSubmit(console.log, console.error)}>Submit</Button>
    </>
  )
}
