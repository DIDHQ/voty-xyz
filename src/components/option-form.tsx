import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { HandRaisedIcon } from '@heroicons/react/20/solid'

import { trpc } from '../utils/trpc'
import useStatus from '../hooks/use-status'
import { getPeriod, Period } from '../utils/period'
import { Proposal } from '../utils/schemas/proposal'
import { Group } from '../utils/schemas/group'
import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import DidCombobox from './did-combobox'
import Button from './basic/button'
import useSignDocument from '../hooks/use-sign-document'
import TextButton from './basic/text-button'
import { Option, optionSchema } from '../utils/schemas/option'
import Notification from './basic/notification'
import { Form, FormItem, FormSection } from './basic/form'
import { Grid6, GridItem6 } from './basic/grid'
import TextInput from './basic/text-input'
import PreviewMarkdown from './preview-markdown'
import Textarea from './basic/textarea'

const Tooltip = dynamic(
  () => import('react-tooltip').then(({ Tooltip }) => Tooltip),
  { ssr: false },
)

export default function OptionForm(props: {
  entry?: string
  proposal?: Proposal & { permalink: string }
  group?: Group
  onSuccess: (permalink: string) => void
  className?: string
}) {
  const { onSuccess } = props
  const [did, setDid] = useState('')
  const { account, connect } = useWallet()
  const { data: dids } = useDids(account, props.proposal?.snapshots)
  const methods = useForm<Option>({
    resolver: zodResolver(optionSchema),
  })
  const {
    register,
    watch,
    setValue,
    formState: { errors },
    handleSubmit: onSubmit,
  } = methods
  useEffect(() => {
    if (props.proposal?.permalink) {
      setValue('proposal', props.proposal.permalink)
    }
  }, [props.proposal?.permalink, setValue])
  const { data: status } = useStatus(props.proposal?.permalink)
  const period = useMemo(
    () => getPeriod(new Date(), status?.timestamp, props.group?.duration),
    [props.group?.duration, status?.timestamp],
  )
  const id = useId()
  const didOptions = useMemo(
    () =>
      dids?.map((did) => ({
        did,
        disabled: false,
      })),
    [dids],
  )
  const { mutateAsync } = trpc.option.create.useMutation()
  const signDocument = useSignDocument(
    did,
    `You are proposing on Voty\n\nhash:\n{sha256}`,
  )
  const handleSign = useMutation<void, Error, Option>(async (option) => {
    const signed = await signDocument(option)
    if (signed) {
      onSuccess(await mutateAsync(signed))
    }
  })
  const defaultDid = useMemo(
    () => didOptions?.find(({ disabled }) => !disabled)?.did,
    [didOptions],
  )
  useEffect(() => {
    setDid(defaultDid || '')
  }, [defaultDid])
  const disabled = !did

  return (
    <>
      <Notification show={handleSign.isError}>
        {handleSign.error?.message}
      </Notification>
      <Form className={props.className}>
        <FormSection title="New proposal">
          <Grid6 className="mt-6">
            <GridItem6>
              <FormItem label="Title" error={errors.title?.message}>
                <TextInput
                  {...register('title')}
                  disabled={disabled}
                  error={!!errors.title?.message}
                />
              </FormItem>
            </GridItem6>
            <GridItem6>
              <FormItem
                label="Content"
                description={
                  <PreviewMarkdown>
                    {watch('extension.content')}
                  </PreviewMarkdown>
                }
                error={errors.extension?.content?.message}
              >
                <Textarea
                  {...register('extension.content')}
                  disabled={disabled}
                  error={!!errors.extension?.content?.message}
                />
              </FormItem>
            </GridItem6>
          </Grid6>
        </FormSection>
      </Form>
      <div>
        {period === Period.ENDED ? null : (
          <div className="mt-6 flex w-full flex-col items-end">
            <div className="w-full flex-1 sm:w-64 sm:flex-none">
              <DidCombobox
                top
                label="Select a DID as proposer"
                options={didOptions}
                value={did}
                onChange={setDid}
                onClick={connect}
              />
              {didOptions?.length === 0 ? (
                <TextButton
                  secondary
                  href={`/${props.entry}/${props.group?.id}/rules`}
                >
                  Why I&#39;m not eligible to propose
                </TextButton>
              ) : null}
            </div>
            {period !== Period.PROPOSING ? (
              <>
                <div
                  data-tooltip-id={id}
                  data-tooltip-place="left"
                  className="mt-6"
                >
                  <Button
                    large
                    primary
                    icon={HandRaisedIcon}
                    onClick={onSubmit(
                      (value) => handleSign.mutate(value),
                      console.error,
                    )}
                    disabled={disabled}
                    loading={handleSign.isLoading}
                  >
                    Propose
                  </Button>
                </div>
                <Tooltip id={id} className="rounded">
                  Waiting for transaction (in about 5 minutes)
                </Tooltip>
              </>
            ) : (
              <Button
                large
                primary
                icon={HandRaisedIcon}
                onClick={onSubmit(
                  (value) => handleSign.mutate(value),
                  console.error,
                )}
                disabled={disabled}
                loading={handleSign.isLoading}
                className="mt-6"
              >
                Propose
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
