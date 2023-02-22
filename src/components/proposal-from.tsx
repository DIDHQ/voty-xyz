import { zodResolver } from '@hookform/resolvers/zod'
import pMap from 'p-map'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { startCase, uniq } from 'lodash-es'
import dynamic from 'next/dynamic'
import { HandRaisedIcon } from '@heroicons/react/20/solid'
import { useAtomValue } from 'jotai'
import { Entry } from '@prisma/client'
import { Serialize } from '@trpc/server/dist/shared/internal/serialize'

import { requiredCoinTypesOfDecimalSets } from '../utils/functions/number'
import { Proposal, proposalSchema } from '../utils/schemas/proposal'
import { getCurrentSnapshot } from '../utils/snapshot'
import TextInput from '../components/basic/text-input'
import Textarea from '../components/basic/textarea'
import TextButton from '../components/basic/text-button'
import {
  Form,
  FormFooter,
  FormItem,
  FormSection,
} from '../components/basic/form'
import { Grid6, GridItem6 } from '../components/basic/grid'
import RadioGroup from '../components/basic/radio-group'
import { requiredCoinTypeOfDidChecker } from '../utils/did'
import PreviewMarkdown from '../components/preview-markdown'
import { currentDidAtom } from '../utils/atoms'
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
    setValue('workgroup', workgroup.extension.id)
  }, [workgroup, setValue])
  const currentDid = useAtomValue(currentDidAtom)
  const [did, setDid] = useState('')
  useEffect(() => {
    setDid(currentDid)
  }, [currentDid])
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
    <Form>
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
              <ul
                role="list"
                className="divide-y divide-gray-200 border border-gray-200"
              >
                {watch('options')?.map((_, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between py-3 pl-3 pr-4 text-sm"
                  >
                    <div className="flex w-0 flex-1 items-center">
                      <span className="ml-2 w-0 flex-1 truncate">
                        <input
                          {...register(`options.${index}`)}
                          placeholder={`Option ${index + 1}`}
                          className="w-full outline-none"
                        />
                      </span>
                    </div>
                    <div className="ml-4 flex shrink-0 space-x-4">
                      <OptionDelete
                        index={index}
                        onDelete={handleOptionDelete}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </FormItem>
          </GridItem6>
        </Grid6>
      </FormSection>
      <FormFooter>
        <div className="flex">
          <Select
            top
            options={dids}
            disables={disables}
            value={did}
            onChange={setDid}
            className="focus:z-10 active:z-10"
          />
          <FormProvider {...methods}>
            <SigningProposalButton
              did={did}
              icon={HandRaisedIcon}
              disabled={!status?.timestamp || !did || !community || !snapshots}
              onSuccess={onSuccess}
              className="border-l-0 focus:z-10 active:z-10"
            >
              Propose
            </SigningProposalButton>
          </FormProvider>
        </div>
      </FormFooter>
    </Form>
  )
}

function OptionDelete(props: {
  index: number
  onDelete: (index: number) => void
}) {
  const { onDelete } = props
  const handleDelete = useCallback(() => {
    onDelete(props.index)
  }, [onDelete, props.index])

  return <TextButton onClick={handleDelete}>Remove</TextButton>
}
