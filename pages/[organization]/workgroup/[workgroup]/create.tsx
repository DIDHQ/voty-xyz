import { Input, Textarea } from 'react-daisyui'
import { useForm } from 'react-hook-form'
import FormItem from '../../../../components/form-item'
import { Proposal } from '../../../../src/schemas'

export default function CreateProposalPage() {
  const { register } = useForm<Proposal>({ defaultValues: {} })

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
