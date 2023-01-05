import { Input, Textarea } from 'react-daisyui'
import { useForm } from 'react-hook-form'
import FormItem from '../../../../components/form-item'
import useRouterQuery from '../../../../components/use-router-query'
import useArweaveFile from '../../../../hooks/use-arweave-file'
import useDidConfig from '../../../../hooks/use-did-config'
import { Proposal } from '../../../../src/schemas'

export default function CreateProposalPage() {
  const { register } = useForm<Proposal>({ defaultValues: {} })
  const [query] = useRouterQuery<['organization', 'workgroup']>()
  const { data: config } = useDidConfig(query.organization)
  const { data: organization } = useArweaveFile(config?.organization)

  return (
    <form>
      <FormItem label="title">
        <Input {...register('title')} />
      </FormItem>
      <FormItem label="body">
        <Textarea {...register('body')} />
      </FormItem>
      <FormItem label="">
        <Input {...register('discussion')} />
      </FormItem>
    </form>
  )
}
