import { zodResolver } from '@hookform/resolvers/zod'
import pMap from 'p-map'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { uniq } from 'lodash-es'
import { HandRaisedIcon } from '@heroicons/react/20/solid'
import { Entry } from '@prisma/client'
import type { Serialize } from '@trpc/server/dist/shared/internal/serialize'
import clsx from 'clsx'

import { Proposal, proposalSchema } from '../utils/schemas/proposal'
import { getCurrentSnapshot } from '../utils/snapshot'
import TextInput from '../components/basic/text-input'
import Textarea from '../components/basic/textarea'
import TextButton from '../components/basic/text-button'
import { Form, FormItem, FormSection } from '../components/basic/form'
import { Grid6, GridItem6 } from '../components/basic/grid'
import { requiredCoinTypeOfDidChecker } from '../utils/did'
import PreviewMarkdown from '../components/preview-markdown'
import useStatus from '../hooks/use-status'
import { Community } from '../utils/schemas/community'
import { Authorized } from '../utils/schemas/authorship'
import { Workgroup } from '../utils/schemas/workgroup'
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

export default function ProposalForm(props: {
  community?: Authorized<Community> & Serialize<{ entry: Entry }>
  workgroup?: Workgroup
  onSuccess(permalink: string): void
  className?: string
}) {
  const { community, workgroup, onSuccess } = props
  const methods = useForm<Proposal>({
    resolver: zodResolver(proposalSchema),
    defaultValues: { options: ['', ''], voting_type: 'single' },
  })
  const {
    register,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
    handleSubmit,
  } = methods
  const handleOptionDelete = useCallback(
    (index: number) => {
      const options = getValues('options')?.filter((_, i) => i !== index)
      setValue('options', options && options.length > 0 ? options : [''])
    },
    [setValue, getValues],
  )
  useEffect(() => {
    if (community) {
      setValue('community', community.entry.community)
    }
  }, [community, setValue])
  useEffect(() => {
    if (workgroup) {
      setValue('workgroup', workgroup.id)
    }
  }, [workgroup, setValue])
  const [did, setDid] = useState('')
  const { data: snapshots } = useQuery(
    ['snapshots', did, workgroup?.permission.proposing],
    async () => {
      const requiredCoinTypes = uniq([
        ...(did ? [requiredCoinTypeOfDidChecker(did)] : []),
        ...requiredCoinTypesOfBooleanSets(workgroup!.permission.proposing!),
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
      enabled: !!workgroup?.permission.proposing,
      refetchOnWindowFocus: false,
      refetchInterval: 30000,
    },
  )
  const { account, connect } = useWallet()
  const { data: dids } = useDids(account, snapshots)
  const { data: disables } = useQuery(
    [dids, props.workgroup?.permission.proposing, snapshots],
    async () => {
      const booleans = await pMap(
        dids!,
        (did) =>
          checkBoolean(props.workgroup!.permission.proposing, did, snapshots!),
        { concurrency: 5 },
      )
      return dids!.reduce((obj, did, index) => {
        obj[did] = !booleans[index]
        return obj
      }, {} as { [key: string]: boolean })
    },
    {
      enabled: !!dids && !!props.workgroup && !!snapshots,
      refetchOnWindowFocus: false,
    },
  )
  const didOptions = useMemo(
    () =>
      disables && dids
        ? dids.map((did) => ({ did, disabled: disables[did] }))
        : undefined,
    [dids, disables],
  )
  const defaultDid = useMemo(
    () => didOptions?.find(({ disabled }) => !disabled)?.did,
    [didOptions],
  )
  useEffect(() => {
    setDid('')
  }, [account])
  useEffect(() => {
    if (defaultDid) {
      setDid(defaultDid)
    }
  }, [defaultDid])
  useEffect(() => {
    if (snapshots) {
      setValue('snapshots', snapshots)
    }
  }, [setValue, snapshots])
  const { data: status } = useStatus(community?.entry.community)
  const options = watch('options') || []
  const signDocument = useSignDocument(
    did,
    `You are creating proposal on Voty\n\nhash:\n{sha256}`,
  )
  const { mutateAsync } = trpc.proposal.create.useMutation()
  const handleSign = useMutation<void, Error, Proposal>(async (proposal) => {
    const signed = await signDocument(proposal)
    if (signed) {
      onSuccess(await mutateAsync(signed))
    }
  })

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
                  error={!!errors.extension?.content?.message}
                />
              </FormItem>
            </GridItem6>
            <GridItem6>
              <FormItem label="Voting type" error={errors.voting_type?.message}>
                <Controller
                  control={control}
                  name="voting_type"
                  render={({ field: { value, onChange } }) => (
                    <div className="space-y-4">
                      {[
                        {
                          id: 'single',
                          name: 'Single choice',
                          description: 'Choose only one option',
                        },
                        {
                          id: 'approval',
                          name: 'Approval',
                          description: 'Approve a certain number of options',
                        },
                      ].map((plan) => (
                        <div
                          key={plan.id}
                          className="relative flex items-start"
                        >
                          <div className="flex h-5 items-center">
                            <input
                              id={plan.id}
                              aria-describedby={`${plan.id}-description`}
                              name="plan"
                              type="radio"
                              checked={value === plan.id}
                              onChange={() => onChange(plan.id)}
                              className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label
                              htmlFor={plan.id}
                              className="font-medium text-gray-700"
                            >
                              {plan.name}
                            </label>
                            <p
                              id={`${plan.id}-description`}
                              className="text-gray-500"
                            >
                              {plan.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
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
                        className={clsx(
                          'peer block w-full border-gray-200 py-3 pl-3 focus:z-10 focus:border-primary-500 focus:ring-primary-300 sm:text-sm',
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
          </Grid6>
        </FormSection>
        <div className="flex w-full flex-col items-end space-y-6">
          <DidCombobox
            top
            label="Select a DID as proposer"
            options={didOptions}
            value={did}
            onChange={setDid}
            onClick={connect}
            className="w-full flex-1 sm:w-auto sm:flex-none"
          />
          <Button
            primary
            large
            icon={HandRaisedIcon}
            disabled={!status?.timestamp || !did || !community || !snapshots}
            loading={handleSign.isLoading}
            onClick={handleSubmit(
              (values) => handleSign.mutate(values),
              console.error,
            )}
          >
            Propose
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
