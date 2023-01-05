import { zodResolver } from '@hookform/resolvers/zod'
import { Add } from '@icon-park/react'
import { useEffect, useState } from 'react'
import { Button, Input, Select, Textarea } from 'react-daisyui'
import { useForm } from 'react-hook-form'

import FormItem from '../../../../components/form-item'
import useRouterQuery from '../../../../components/use-router-query'
import useArweaveFile from '../../../../hooks/use-arweave-file'
import useDidConfig from '../../../../hooks/use-did-config'
import {
  Organization,
  Proposal,
  proposalSchema,
  proposalTypes,
} from '../../../../src/schemas'

export default function CreateProposalPage() {
  const { register, setValue } = useForm<Proposal>({
    resolver: zodResolver(proposalSchema),
  })
  const [query] = useRouterQuery<['organization', 'workgroup']>()
  const { data: config } = useDidConfig(query.organization)
  const { data: organization } = useArweaveFile<Organization>(
    config?.organization,
  )
  useEffect(() => {
    if (!config?.organization) {
      return
    }
    setValue('organization', config?.organization)
  }, [config?.organization, setValue])
  useEffect(() => {
    const workgroup = organization?.workgroups?.find(
      ({ profile }) => profile.name === query.workgroup,
    )
    if (!workgroup) {
      return
    }
    setValue('workgroup', workgroup.id)
  }, [organization?.workgroups, query.workgroup, setValue])
  const [typesCount, setTypesCount] = useState(0)

  return (
    <>
      <FormItem label="title">
        <Input {...register('title')} />
      </FormItem>
      <FormItem label="body">
        <Textarea {...register('body')} />
      </FormItem>
      <FormItem label="discussion">
        <Input {...register('discussion')} />
      </FormItem>
      <FormItem label="type">
        <Select {...register('type')}>
          {proposalTypes.map((proposalType) => (
            <Select.Option key={proposalType} value={proposalType}>
              {proposalType}
            </Select.Option>
          ))}
        </Select>
      </FormItem>
      <FormItem label="choices">
        {Array.from({ length: typesCount })?.map((_, index) => (
          <Input key={index} {...register(`choices.${index}`)} />
        ))}
        <Button onClick={() => setTypesCount((old) => old + 1)}>
          <Add />
        </Button>
      </FormItem>
    </>
  )
}
