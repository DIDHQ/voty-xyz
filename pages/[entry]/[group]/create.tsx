import { zodResolver } from '@hookform/resolvers/zod'
import pMap from 'p-map'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import useSWR from 'swr'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { startCase, uniq } from 'lodash-es'
import dynamic from 'next/dynamic'

import useRouterQuery from '../../../hooks/use-router-query'
import { requiredCoinTypesOfNumberSets } from '../../../src/functions/number'
import { Proposal, proposalSchema } from '../../../src/schemas'
import { getCurrentSnapshot, mapSnapshots } from '../../../src/snapshot'
import TextInput from '../../../components/basic/text-input'
import Textarea from '../../../components/basic/textarea'
import { useEntry, useGroup } from '../../../hooks/use-api'
import TextButton from '../../../components/basic/text-button'
import { Form, FormFooter, FormItem } from '../../../components/basic/form'
import { Grid6, GridItem6 } from '../../../components/basic/grid'
import { permalink2Id } from '../../../src/arweave'
import RadioGroup from '../../../components/basic/radio-group'
import { requiredCoinTypesOfDidResolver } from '../../../src/did'
import { formatDuration } from '../../../src/utils/time'
import { DetailItem, DetailList } from '../../../components/basic/detail'
import Markdown from '../../../components/basic/markdown'
import Status from '../../../components/status'
import { HandRaisedIcon } from '@heroicons/react/20/solid'

const ProposerSelect = dynamic(
  () => import('../../../components/proposer-select'),
  { ssr: false },
)

const SigningButton = dynamic(
  () => import('../../../components/signing-button'),
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
  const query = useRouterQuery<['entry', 'group']>()
  const { data: community } = useEntry(query.entry)
  const group = useGroup(community, query.group)
  const handleOptionDelete = useCallback(
    (index: number) => {
      const options = getValues('options')?.filter((_, i) => i !== index)
      setValue('options', options && options.length > 0 ? options : [''])
    },
    [setValue, getValues],
  )
  useEffect(() => {
    if (!community) {
      return
    }
    setValue('community', community.permalink)
  }, [community, setValue])
  useEffect(() => {
    if (!query.group) {
      return
    }
    setValue('group', query.group)
  }, [query.group, setValue])
  const { data: requiredCoinTypes } = useSWR(
    group?.permission.voting
      ? ['requiredCoinTypes', group.permission.voting]
      : null,
    () =>
      uniq([
        ...requiredCoinTypesOfDidResolver,
        ...requiredCoinTypesOfNumberSets(group!.permission.voting!),
      ]),
    { revalidateOnFocus: false },
  )
  const { data: snapshots } = useSWR(
    requiredCoinTypes ? ['snapshots', requiredCoinTypes] : null,
    async () => {
      const snapshots = await pMap(requiredCoinTypes!, getCurrentSnapshot, {
        concurrency: 5,
      })
      return snapshots.reduce((obj, snapshot, index) => {
        obj[requiredCoinTypes![index]] = snapshot.toString()
        return obj
      }, {} as { [coinType: string]: string })
    },
    { refreshInterval: 30000 },
  )
  useEffect(() => {
    if (snapshots) {
      setValue('snapshots', snapshots)
    }
  }, [setValue, snapshots])
  const [did, setDid] = useState('')
  const router = useRouter()
  const handleSuccess = useCallback(
    (permalink: string) => {
      router.push(`/${query.entry}/${query.group}/${permalink2Id(permalink)}`)
    },
    [query.entry, query.group, router],
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
    <div className="mt-6 flex items-start">
      <div className="mr-6 flex-1">
        <Link href={`/${query.entry}/${query.group}`}>
          <TextButton>
            <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
          </TextButton>
        </Link>
        <Form>
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
                description="Styling with Markdown is supported"
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
                error={
                  errors.options?.message ||
                  errors.options?.find?.((option) => option?.message)?.message
                }
              >
                <ul
                  role="list"
                  className="mb-4 divide-y divide-gray-200 rounded-md border border-gray-200"
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
                <TextButton
                  onClick={() => {
                    setValue('options', [...(watch('options') || []), ''])
                  }}
                >
                  Add
                </TextButton>
              </FormItem>
            </GridItem6>
          </Grid6>
          <FormFooter>
            <div className="flex rounded-md">
              <ProposerSelect
                group={group}
                snapshots={snapshots ? mapSnapshots(snapshots) : undefined}
                value={did}
                onChange={setDid}
                className="rounded-r-none"
              />
              <FormProvider {...methods}>
                <SigningButton
                  did={did}
                  icon={HandRaisedIcon}
                  disabled={!did || !community || !snapshots}
                  onSuccess={handleSuccess}
                  className="z-10 rounded-l-none border-l-0"
                >
                  Propose
                </SigningButton>
              </FormProvider>
            </div>
          </FormFooter>
        </Form>
      </div>
      <div className="sticky top-24 w-80 shrink-0">
        <div className="-mt-2 space-y-6 rounded-md border border-gray-200 p-6">
          <DetailList
            title="Information"
            right={<Status permalink={community?.permalink} />}
          >
            <DetailItem title="Community">{community?.name}</DetailItem>
            <DetailItem title="Group">{group?.name}</DetailItem>
          </DetailList>
          <DetailList title="Duration">
            <DetailItem title="Announcement">
              {group ? formatDuration(group.duration.announcement) : null}
            </DetailItem>
            <DetailItem title="Voting">
              {group ? formatDuration(group.duration.voting) : null}
            </DetailItem>
          </DetailList>
          <DetailList title="Terms and conditions">
            <article className="prose-sm pt-2 prose-pre:overflow-x-auto prose-ol:list-decimal marker:prose-ol:text-gray-400 prose-ul:list-disc marker:prose-ul:text-gray-400">
              <Markdown>{group?.extension.terms_and_conditions}</Markdown>
            </article>
          </DetailList>
        </div>
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
