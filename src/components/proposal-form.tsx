import { zodResolver } from '@hookform/resolvers/zod'
import pMap from 'p-map'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { uniq } from 'lodash-es'
import { EyeIcon } from '@heroicons/react/20/solid'
import { Entry } from '@prisma/client'
import type { Serialize } from '@trpc/server/dist/shared/internal/serialize'
import clsx from 'clsx'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'

import {
  Proposal,
  proposalSchema,
  proposalSchemaRefine,
} from '../utils/schemas/proposal'
import { getCurrentSnapshot } from '../utils/snapshot'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import TextButton from './basic/text-button'
import { Form, FormItem, FormSection } from './basic/form'
import { Grid6, GridItem3, GridItem6 } from './basic/grid'
import { requiredCoinTypeOfDidChecker } from '../utils/did'
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
import RadioGroup from './basic/radio-group'
import { previewProposalAtom } from '../utils/atoms'
import { previewPermalink } from '../utils/constants'
import Slide from './basic/slide'
import RulesView from './rules-view'

export default function ProposalForm(props: {
  initialValue?: Partial<Proposal>
  community?: Authorized<Community> & Serialize<{ entry: Entry }>
  group?: Group
  className?: string
}) {
  const router = useRouter()
  const type = props.group
    ? props.group.extension.type === 'grant'
      ? 'round'
      : 'proposal'
    : undefined
  const [previewProposal, setPreviewProposal] = useAtom(previewProposalAtom)
  const methods = useForm<Proposal>({
    resolver: zodResolver(proposalSchema.refine(proposalSchemaRefine)),
  })
  const {
    register,
    setValue,
    getValues,
    watch,
    reset,
    control,
    formState: { errors },
    handleSubmit: onSubmit,
  } = methods
  useEffect(() => {
    reset(previewProposal || props.initialValue)
  }, [previewProposal, props.initialValue, reset])
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
    <Form title={`New ${type || ''}`} className={props.className}>
      <FormSection>
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
              description="Markdown is supported"
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
                    placeholder="e.g. 500 USD"
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
                    errors.options?.find?.((option) => option?.message)?.message
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
                            index === 0 ? 'rounded-t-md' : undefined,
                            index === options.length - 1
                              ? 'rounded-b-md'
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
          {didOptions?.length === 0 && props.group ? (
            <Slide
              title={`Rules of ${props.group.name}`}
              trigger={({ handleOpen }) => (
                <TextButton secondary onClick={handleOpen}>
                  Why I&#39;m not eligible to&nbsp;
                  {type === 'round' ? 'invest' : 'propose'}
                </TextButton>
              )}
            >
              {() =>
                props.group ? (
                  <RulesView
                    entry={props.community?.entry.did}
                    group={props.group}
                  />
                ) : null
              }
            </Slide>
          ) : null}
        </div>
        <Button
          primary
          icon={EyeIcon}
          disabled={disabled}
          onClick={onSubmit((value) => {
            setPreviewProposal({
              ...value,
              preview: {
                from: `/${props.community?.entry.did}/${props.group?.id}/create`,
                to: `/${type}/${previewPermalink}`,
                template: `You are creating ${type} on Voty\n\nhash:\n{sha256}`,
                author: did,
              },
            })
            router.push(`/${type}/${previewPermalink}`)
          }, console.error)}
        >
          Preview
        </Button>
      </div>
    </Form>
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
