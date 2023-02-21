import { zodResolver } from '@hookform/resolvers/zod'
import pMap from 'p-map'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { startCase, uniq } from 'lodash-es'
import dynamic from 'next/dynamic'
import { HandRaisedIcon } from '@heroicons/react/20/solid'

import useRouterQuery from '../../../hooks/use-router-query'
import { requiredCoinTypesOfNumberSets } from '../../../utils/functions/number'
import { Proposal, proposalSchema } from '../../../utils/schemas/proposal'
import { getCurrentSnapshot } from '../../../utils/snapshot'
import TextInput from '../../../components/basic/text-input'
import Textarea from '../../../components/basic/textarea'
import useWorkgroup from '../../../hooks/use-workgroup'
import TextButton from '../../../components/basic/text-button'
import {
  Form,
  FormFooter,
  FormItem,
  FormSection,
} from '../../../components/basic/form'
import { Grid6, GridItem6 } from '../../../components/basic/grid'
import { permalink2Id } from '../../../utils/permalink'
import RadioGroup from '../../../components/basic/radio-group'
import { requiredCoinTypeOfDidChecker } from '../../../utils/did'
import { formatDuration } from '../../../utils/time'
import { DetailItem, DetailList } from '../../../components/basic/detail'
import { trpc } from '../../../utils/trpc'
import Article from '../../../components/basic/article'
import LoadingBar from '../../../components/basic/loading-bar'
import PreviewMarkdown from '../../../components/preview-markdown'

const StatusIcon = dynamic(() => import('../../../components/status-icon'), {
  ssr: false,
})

const ProposerSelect = dynamic(
  () => import('../../../components/proposer-select'),
  { ssr: false },
)

const SigningProposalButton = dynamic(
  () => import('../../../components/signing/signing-proposal-button'),
  { ssr: false },
)

export default function CreateProposalPage() {
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
  const query = useRouterQuery<['entry', 'workgroup']>()
  const { data: community, isLoading } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry, refetchOnWindowFocus: false },
  )
  const workgroup = useWorkgroup(community, query.workgroup)
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
    if (query.workgroup) {
      setValue('workgroup', query.workgroup)
    }
  }, [query.workgroup, setValue])
  const [did, setDid] = useState('')
  const { data: requiredCoinTypes } = useQuery(
    ['requiredCoinTypes', did, workgroup?.permission.voting],
    () =>
      uniq([
        requiredCoinTypeOfDidChecker(did),
        ...requiredCoinTypesOfNumberSets(workgroup!.permission.voting!),
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
  useEffect(() => {
    if (snapshots) {
      setValue('snapshots', snapshots)
    }
  }, [setValue, snapshots])
  const router = useRouter()
  const handleSuccess = useCallback(
    (permalink: string) => {
      router.push(
        `/${query.entry}/${query.workgroup}/${permalink2Id(permalink)}`,
      )
    },
    [query.entry, query.workgroup, router],
  )
  const options = useMemo(
    () =>
      proposalSchema.shape.voting_type.options.map((option) => ({
        value: option,
        name: startCase(option),
      })),
    [],
  )

  return (
    <div className="flex w-full flex-1 flex-col items-start pt-6 sm:flex-row">
      <LoadingBar loading={isLoading} />
      <Link
        href={`/${query.entry}/${query.workgroup}`}
        className="inline sm:hidden"
      >
        <TextButton>
          <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
        </TextButton>
      </Link>
      <div className="w-full flex-1 sm:mr-6">
        <Link
          href={`/${query.entry}/${query.workgroup}`}
          className="hidden sm:inline"
        >
          <TextButton>
            <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
          </TextButton>
        </Link>
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
                <FormItem
                  label="Voting type"
                  error={errors.voting_type?.message}
                >
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
              <ProposerSelect
                workgroup={workgroup}
                snapshots={snapshots}
                value={did}
                onChange={setDid}
                className="focus:z-10 active:z-10"
              />
              <FormProvider {...methods}>
                <SigningProposalButton
                  did={did}
                  icon={HandRaisedIcon}
                  disabled={!did || !community || !snapshots}
                  onSuccess={handleSuccess}
                  className="border-l-0 focus:z-10 active:z-10"
                >
                  Propose
                </SigningProposalButton>
              </FormProvider>
            </div>
          </FormFooter>
        </Form>
      </div>
      <div className="relative mt-6 w-full shrink-0 sm:sticky sm:top-24 sm:mt-0 sm:w-72">
        <StatusIcon
          permalink={community?.entry.community}
          className="absolute right-4 top-4"
        />
        <Grid6 className="border border-gray-200 p-6">
          <GridItem6>
            <DetailList title="Workgroup">
              <DetailItem title="Name">{workgroup?.name}</DetailItem>
              <DetailItem title="Community">{community?.name}</DetailItem>
            </DetailList>
          </GridItem6>
          <GridItem6>
            <DetailList title="Duration">
              <DetailItem title="Announcement">
                {workgroup
                  ? formatDuration(workgroup.duration.announcement)
                  : null}
              </DetailItem>
              <DetailItem title="Voting">
                {workgroup ? formatDuration(workgroup.duration.voting) : null}
              </DetailItem>
            </DetailList>
          </GridItem6>
          <GridItem6>
            <DetailList title="Terms and conditions">
              <Article small className="pt-2">
                {workgroup?.extension.terms_and_conditions}
              </Article>
            </DetailList>
          </GridItem6>
        </Grid6>
      </div>
    </div>
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
