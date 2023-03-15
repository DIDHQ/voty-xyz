import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { HandRaisedIcon } from '@heroicons/react/20/solid'
import pMap from 'p-map'
import { uniq } from 'lodash-es'

import { trpc } from '../utils/trpc'
import useStatus from '../hooks/use-status'
import { getPeriod, Period } from '../utils/period'
import { Proposal } from '../utils/schemas/proposal'
import { Grant } from '../utils/schemas/group'
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
import { requiredCoinTypeOfDidChecker } from '../utils/did'
import {
  checkBoolean,
  requiredCoinTypesOfBooleanSets,
} from '../utils/functions/boolean'
import { getCurrentSnapshot } from '../utils/snapshot'

const Tooltip = dynamic(
  () => import('react-tooltip').then(({ Tooltip }) => Tooltip),
  { ssr: false },
)

export default function OptionForm(props: {
  entry?: string
  proposal?: Proposal & { permalink: string }
  group?: Grant
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
  const { data: disables } = useQuery(
    [dids, props.group?.permission.adding_option],
    async () => {
      const requiredCoinTypes = uniq([
        ...(did ? [requiredCoinTypeOfDidChecker(did)] : []),
        ...requiredCoinTypesOfBooleanSets(
          props.group!.permission.adding_option!,
        ),
      ])
      const snapshots = await pMap(requiredCoinTypes!, getCurrentSnapshot, {
        concurrency: 5,
      })
      const booleans = await pMap(
        dids!,
        (did) =>
          checkBoolean(props.group!.permission.adding_option, did, snapshots!),
        { concurrency: 5 },
      )
      return dids!.reduce((obj, did, index) => {
        obj[did] = !booleans[index]
        return obj
      }, {} as { [key: string]: boolean })
    },
    { enabled: !!dids && !!props.group },
  )
  const didOptions = useMemo(
    () =>
      disables
        ? dids
            ?.map((did) => ({ did, disabled: disables[did] }))
            .filter(({ disabled }) => !disabled)
        : undefined,
    [dids, disables],
  )
  const { mutateAsync } = trpc.option.create.useMutation()
  const signDocument = useSignDocument(
    did,
    `You are proposing on Voty\n\nhash:\n{sha256}`,
  )
  const handleSubmit = useMutation<void, Error, Option>(async (option) => {
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
      <Notification show={handleSubmit.isError}>
        {handleSubmit.error?.message}
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
                      (value) => handleSubmit.mutate(value),
                      console.error,
                    )}
                    disabled={disabled}
                    loading={handleSubmit.isLoading}
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
                  (value) => handleSubmit.mutate(value),
                  console.error,
                )}
                disabled={disabled}
                loading={handleSubmit.isLoading}
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
