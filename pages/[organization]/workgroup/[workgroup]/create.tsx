import { useEffect } from 'react'
import { Input, Textarea } from 'react-daisyui'
import { useForm } from 'react-hook-form'
import FormItem from '../../../../components/form-item'
import useRouterQuery from '../../../../components/use-router-query'
import useArweaveFile from '../../../../hooks/use-arweave-file'
import useDidConfig from '../../../../hooks/use-did-config'
import { Organization, Proposal } from '../../../../src/schemas'

export default function CreateProposalPage() {
  const { register, setValue } = useForm<Proposal>({ defaultValues: {} })
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
    </>
  )
}
