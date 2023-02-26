import { zodResolver } from '@hookform/resolvers/zod'
import pMap from 'p-map'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { startCase, uniq } from 'lodash-es'
import dynamic from 'next/dynamic'
import { HandRaisedIcon } from '@heroicons/react/20/solid'
import { Entry } from '@prisma/client'
import type { Serialize } from '@trpc/server/dist/shared/internal/serialize'
import clsx from 'clsx'

import { requiredCoinTypesOfDecimalSets } from '../utils/functions/number'
import { Proposal, proposalSchema } from '../utils/schemas/proposal'
import { getCurrentSnapshot } from '../utils/snapshot'
import TextInput from '../components/basic/text-input'
import Textarea from '../components/basic/textarea'
import TextButton from '../components/basic/text-button'
import { Form, FormItem, FormSection } from '../components/basic/form'
import { Grid6, GridItem6 } from '../components/basic/grid'
import RadioGroup from '../components/basic/radio-group'
import { requiredCoinTypeOfDidChecker } from '../utils/did'
import PreviewMarkdown from '../components/preview-markdown'
import useStatus from '../hooks/use-status'
import { Community } from '../utils/schemas/community'
import { Authorized } from '../utils/schemas/authorship'
import { Workgroup } from '../utils/schemas/workgroup'
import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import { checkBoolean } from '../utils/functions/boolean'
import Select from './basic/select'

const SigningProposalButton = dynamic(
  () => import('../components/signing/signing-proposal-button'),
  { ssr: false },
)

export default function ProposalForm(props: {
  community: Authorized<Community> & Serialize<{ entry: Entry }>
  workgroup: Workgroup
  onSuccess(permalink: string): void
  className?: string
}) {
  const { community, workgroup, onSuccess } = props
  const methods = useForm<Proposal>({
    resolver: zodResolver(proposalSchema),
    defaultValues: { options: [''], voting_type: 'single' },
  })
  const {
    register,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
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
    setValue('workgroup', workgroup.id)
  }, [workgroup, setValue])
  const [did, setDid] = useState('')
  const { data: requiredCoinTypes } = useQuery(
    ['requiredCoinTypes', did, workgroup?.permission.voting],
    () =>
      uniq([
        requiredCoinTypeOfDidChecker(did),
        ...requiredCoinTypesOfDecimalSets(workgroup!.permission.voting!),
      ]),
    {
      enabled: !!did && !!workgroup?.permission.voting,
      refetchOnWindowFocus: false,
    },
  )
  const { data: snapshots } = useQuery(
    ['snapshots', requiredCoinTypes],
    async () => {
      const snapshots = await pMap(requiredCoinTypes!, getCurrentSnapshot, {
        concurrency: 5,
      })
      return snapshots.reduce((obj, snapshot, index) => {
        obj[requiredCoinTypes![index]] = snapshot.toString()
        return obj
      }, {} as { [coinType: string]: string })
    },
    {
      enabled: !!requiredCoinTypes,
      refetchOnWindowFocus: false,
      refetchInterval: 30000,
    },
  )
  const { account } = useWallet()
  const { data: dids } = useDids(account, snapshots)
  const { data: disables } = useQuery(
    [dids, props.workgroup, snapshots],
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
  useEffect(() => {
    if (snapshots) {
      setValue('snapshots', snapshots)
    }
  }, [setValue, snapshots])
  const options = useMemo(
    () =>
      proposalSchema.shape.voting_type.options.map((option) => ({
        value: option,
        name: startCase(option),
      })),
    [],
  )
  const { data: status } = useStatus(community?.entry.community)

  return (
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
              label="Body"
              description={
                <PreviewMarkdown>{watch('extension.body')}</PreviewMarkdown>
              }
              error={errors.extension?.body?.message}
            >
              <Textarea
                {...register('extension.body')}
                error={!!errors.extension?.body?.message}
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem label="Voting type" error={errors.voting_type?.message}>
              <Controller
                control={control}
                name="voting_type"
                render={({ field: { value, onChange } }) => (
                  <RadioGroup
                    options={options}
                    value={value}
                    onChange={onChange}
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
                  onClick={() => {
                    setValue('options', [...(watch('options') || []), ''])
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
                {watch('options')?.map((_, index) => (
                  <div
                    key={index}
                    className="relative flex items-center justify-between text-sm"
                  >
                    <input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      {...register(`options.${index}`)}
                      className={clsx(
                        'peer block w-full border-gray-200 py-3 pl-3 focus:z-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm',
                        watch('options')?.length > 1 ? 'pr-20' : 'pr-3',
                        index === 0 ? 'rounded-t' : undefined,
                        index === watch('options')?.length - 1
                          ? 'rounded-b'
                          : undefined,
                      )}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 peer-focus:z-10">
                      {watch('options')?.length > 1 ? (
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
      <div className="flex w-full flex-col items-end space-y-6 pt-6">
        <Select
          top
          options={dids}
          disables={disables}
          value={did}
          onChange={setDid}
          className="w-0 flex-1 sm:w-auto sm:flex-none"
        />
        <FormProvider {...methods}>
          <SigningProposalButton
            did={did}
            icon={HandRaisedIcon}
            disabled={!status?.timestamp || !did || !community || !snapshots}
            onSuccess={onSuccess}
          >
            Propose
          </SigningProposalButton>
        </FormProvider>
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

  return <TextButton onClick={handleDelete}>Remove</TextButton>
}
