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
import { getCurrentSnapshot } from '../../../src/snapshot'
import TextInput from '../../../components/basic/text-input'
import Textarea from '../../../components/basic/textarea'
import { useEntry, useGroup } from '../../../hooks/use-api'
import TextButton from '../../../components/basic/text-button'
import {
  Form,
  FormFooter,
  FormSection,
  FormItem,
} from '../../../components/basic/form'
import { Grid6, GridItem6 } from '../../../components/basic/grid'
import { permalink2Id } from '../../../src/arweave'
import RadioGroup from '../../../components/basic/radio-group'
import { requiredCoinTypesOfDidResolver } from '../../../src/did'

const AuthorSelect = dynamic(
  () => import('../../../components/author-select'),
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
    <div className="mt-6">
      <Link href={`/${query.entry}/${query.group}`}>
        <TextButton>
          <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
        </TextButton>
      </Link>
      <Form>
        <FormSection
          title="Proposal"
          description="Basic information of the proposal."
        >
          <Grid6>
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
        </FormSection>
        <FormFooter>
          <FormProvider {...methods}>
            <SigningButton
              did={did}
              disabled={!did || !community || !snapshots}
              onSuccess={handleSuccess}
            >
              Submit
            </SigningButton>
          </FormProvider>
          <AuthorSelect value={did} onChange={setDid} top className="mr-6" />
        </FormFooter>
      </Form>
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
