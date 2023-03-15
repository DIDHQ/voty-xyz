import { zodResolver } from '@hookform/resolvers/zod'
import pMap from 'p-map'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { uniq } from 'lodash-es'
import { BanknotesIcon, HandRaisedIcon } from '@heroicons/react/20/solid'
import { Entry } from '@prisma/client'
import type { Serialize } from '@trpc/server/dist/shared/internal/serialize'
import clsx from 'clsx'

import { Proposal, proposalSchema } from '../utils/schemas/proposal'
import { getCurrentSnapshot } from '../utils/snapshot'
import TextInput from '../components/basic/text-input'
import Textarea from '../components/basic/textarea'
import TextButton from '../components/basic/text-button'
import { Form, FormItem, FormSection } from '../components/basic/form'
import { Grid6, GridItem3, GridItem6 } from '../components/basic/grid'
import { requiredCoinTypeOfDidChecker } from '../utils/did'
import PreviewMarkdown from '../components/preview-markdown'
import useStatus from '../hooks/use-status'
import { Community } from '../utils/schemas/community'
import { Authorized } from '../utils/schemas/authorship'
import { Group } from '../utils/schemas/group'
import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import DidCombobox from './did-combobox'
import {
  checkBoolean,
  requiredCoinTypesOfBooleanSets,
} from '../utils/functions/boolean'
import Button from './basic/button'
import useSignDocument from '../hooks/use-sign-document'
import { trpc } from '../utils/trpc'
import Notification from './basic/notification'
import RadioGroup from './basic/radio-group'

export default function ProposalForm(props: {
  community?: Authorized<Community> & Serialize<{ entry: Entry }>
  group?: Group
  onSuccess(permalink: string): void
  className?: string
}) {
  const { onSuccess } = props
  const type = props.group?.extension.type === 'grant' ? 'round' : 'proposal'
  const methods = useForm<Proposal>({
    resolver: zodResolver(proposalSchema),
    defaultValues: { voting_type: 'single' },
  })
  const {
    register,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
    handleSubmit: onSubmit,
  } = methods
  const handleOptionDelete = useCallback(
    (index: number) => {
      const options = getValues('options')?.filter((_, i) => i !== index)
      setValue('options', options && options.length > 0 ? options : [''])
    },
    [setValue, getValues],
  )
  useEffect(() => {
    if (props.community) {
      setValue('community', props.community.entry.community)
    }
  }, [props.community, setValue])
  useEffect(() => {
    if (props.group) {
      setValue('group', props.group.id)
    }
  }, [props.group, setValue])
  useEffect(() => {
    if (props.group) {
      if (props.group.extension.type === 'grant') {
        setValue('options', undefined)
        setValue('extension.funding', [['', 5]])
      } else {
        setValue('options', ['', ''])
        setValue('extension.funding', undefined)
      }
    }
  }, [props.group, setValue])
  const [did, setDid] = useState('')
  const { data: snapshots } = useQuery(
    ['snapshots', did, props.group?.permission.proposing],
    async () => {
      const requiredCoinTypes = uniq([
        ...(did ? [requiredCoinTypeOfDidChecker(did)] : []),
        ...requiredCoinTypesOfBooleanSets(props.group!.permission.proposing!),
      ])
      const snapshots = await pMap(requiredCoinTypes!, getCurrentSnapshot, {
        concurrency: 5,
      })
      return snapshots.reduce((obj, snapshot, index) => {
        obj[requiredCoinTypes![index]] = snapshot.toString()
        return obj
      }, {} as { [coinType: string]: string })
    },
    {
      enabled: !!props.group?.permission.proposing,
      refetchInterval: 30000,
    },
  )
  const { account, connect } = useWallet()
  const { data: dids } = useDids(account)
  const { data: disables } = useQuery(
    [dids, props.group?.permission.proposing],
    async () => {
      const requiredCoinTypes = uniq([
        ...(did ? [requiredCoinTypeOfDidChecker(did)] : []),
        ...requiredCoinTypesOfBooleanSets(props.group!.permission.proposing!),
      ])
      const snapshots = await pMap(requiredCoinTypes!, getCurrentSnapshot, {
        concurrency: 5,
      })
      const booleans = await pMap(
        dids!,
        (did) =>
          checkBoolean(props.group!.permission.proposing, did, snapshots!),
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
  const defaultDid = useMemo(
    () => didOptions?.find(({ disabled }) => !disabled)?.did,
    [didOptions],
  )
  useEffect(() => {
    setDid(defaultDid || '')
  }, [defaultDid])
  useEffect(() => {
    if (snapshots) {
      setValue('snapshots', snapshots)
    }
  }, [setValue, snapshots])
  const { data: status } = useStatus(props.community?.entry.community)
  const options = watch('options') || []
  const signDocument = useSignDocument(
    did,
    `You are creating ${type} on Voty\n\nhash:\n{sha256}`,
  )
  const { mutateAsync } = trpc.proposal.create.useMutation()
  const handleSubmit = useMutation<void, Error, Proposal>(async (proposal) => {
    const signed = await signDocument(proposal)
    if (signed) {
      onSuccess(await mutateAsync(signed))
    }
  })
  const disabled = useMemo(
    () => !status?.timestamp || !did || !props.community || !snapshots,
    [props.community, did, snapshots, status?.timestamp],
  )
  const votingTypes = useMemo(
    () => [
      {
        value: 'single',
        name: 'Single choice',
        description: 'Choose only one option',
      },
      {
        value: 'approval',
        name: 'Approval',
        description: 'Approve a certain number of options',
      },
    ],
    [],
  )

  return (
    <>
      <Notification show={handleSubmit.isError}>
        {handleSubmit.error?.message}
      </Notification>
      <Form className={props.className}>
        <FormSection title={`New ${type}`}>
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
            {type === 'round' ? (
              <GridItem3>
                <FormItem
                  label="Funding"
                  error={
                    errors?.extension?.funding?.[0]?.[0]?.message ||
                    errors?.extension?.funding?.[0]?.[1]?.message
                  }
                >
                  <div className="flex w-full items-center space-x-2">
                    <TextInput
                      disabled={disabled}
                      {...register('extension.funding.0.0')}
                      error={!!errors?.extension?.funding?.[0]?.[0]}
                      placeholder="prize"
                      className="w-0 flex-1"
                    />
                    <span className="text-gray-400">X</span>
                    <Controller
                      control={control}
                      name="extension.funding.0.1"
                      render={({ field: { value, onChange } }) => (
                        <TextInput
                          disabled={disabled}
                          type="number"
                          value={value || ''}
                          onChange={(e) => onChange(e.target.valueAsNumber)}
                          error={!!errors?.extension?.funding?.[0]?.[1]}
                          placeholder="count"
                          className="shrink-0 basis-16"
                        />
                      )}
                    />
                  </div>
                </FormItem>
              </GridItem3>
            ) : (
              <>
                <GridItem6>
                  <FormItem
                    label="Voting type"
                    error={errors.voting_type?.message}
                  >
                    <Controller
                      control={control}
                      name="voting_type"
                      render={({ field: { value, onChange } }) => (
                        <RadioGroup
                          options={votingTypes}
                          value={value}
                          onChange={onChange}
                          disabled={disabled}
                        />
                      )}
                    />
                  </FormItem>
                </GridItem6>
                <GridItem6>
                  <FormItem
                    label="Options"
                    description={
                      <TextButton
                        secondary
                        disabled={disabled}
                        onClick={() => {
                          setValue('options', [...options, ''])
                        }}
                      >
                        Add
                      </TextButton>
                    }
                    error={
                      errors.options?.message ||
                      errors.options?.find?.((option) => option?.message)
                        ?.message
                    }
                  >
                    <div className="space-y-[-1px]">
                      {options.map((_, index) => (
                        <div
                          key={index}
                          className="relative flex items-center justify-between text-sm"
                        >
                          <input
                            type="text"
                            placeholder={`Option ${index + 1}`}
                            {...register(`options.${index}`)}
                            disabled={disabled}
                            className={clsx(
                              'peer block w-full border-gray-200 py-3 pl-3 focus:z-10 focus:border-primary-500 focus:ring-primary-300 disabled:cursor-not-allowed disabled:bg-gray-50 checked:disabled:bg-primary-600 sm:text-sm',
                              options.length > 1 ? 'pr-20' : 'pr-3',
                              index === 0 ? 'rounded-t' : undefined,
                              index === options.length - 1
                                ? 'rounded-b'
                                : undefined,
                            )}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 peer-focus:z-10">
                            {options.length > 2 ? (
                              <OptionRemove
                                index={index}
                                onDelete={handleOptionDelete}
                              />
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </FormItem>
                </GridItem6>
              </>
            )}
          </Grid6>
        </FormSection>
        <div className="flex w-full flex-col items-end space-y-6">
          <div className="w-full flex-1 sm:w-64 sm:flex-none">
            <DidCombobox
              top
              label={`Select a DID as ${
                type === 'round' ? 'investor' : 'proposer'
              }`}
              options={didOptions}
              value={did}
              onChange={setDid}
              onClick={connect}
            />
            {didOptions?.length === 0 ? (
              <TextButton
                secondary
                href={`/${props.community?.authorship.author}/${props.group?.id}/rules`}
              >
                Why I&#39;m not eligible to&nbsp;
                {type === 'round' ? 'invest' : 'propose'}
              </TextButton>
            ) : null}
          </div>
          <Button
            primary
            large
            icon={type === 'round' ? BanknotesIcon : HandRaisedIcon}
            disabled={disabled}
            loading={handleSubmit.isLoading}
            onClick={onSubmit(
              (values) => handleSubmit.mutate(values),
              console.error,
            )}
          >
            {type === 'round' ? 'Invest' : 'Propose'}
          </Button>
        </div>
      </Form>
    </>
  )
}

function OptionRemove(props: {
  index: number
  onDelete: (index: number) => void
}) {
  const { onDelete } = props
  const handleDelete = useCallback(() => {
    onDelete(props.index)
  }, [onDelete, props.index])

  return (
    <TextButton secondary onClick={handleDelete}>
      Remove
    </TextButton>
  )
}
