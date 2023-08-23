import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { EyeIcon } from '@heroicons/react/20/solid'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { uniq } from 'remeda'
import pMap from 'p-map'

import { trpc } from '../utils/trpc'
import useIsManager from '../hooks/use-is-manager'
import { Grant, grantSchema } from '../utils/schemas/v1/grant'
import { previewGrantAtom } from '../utils/atoms'
import { Preview } from '../utils/types'
import { requiredCoinTypeOfDidChecker } from '../utils/did'
import { getCurrentSnapshot } from '../utils/snapshot'
import { requiredCoinTypesOfBooleanSets } from '../utils/functions/boolean'
import { requiredCoinTypesOfDecimalSets } from '../utils/functions/decimal'
import MarkdownEditor from './basic/markdown-editor'
import Button from './basic/button'
import { Form, FormFooter, FormSection, FormItem } from './basic/form'
import TextInput from './basic/text-input'
import DurationInput from './basic/duration-input'
import BooleanSetsBlock from './boolean-sets-block'

export default function GrantForm(props: {
  communityId: string
  initialValue: Partial<Grant> | null
  preview: Preview
  className?: string
}) {
  const router = useRouter()
  const { data: community } = trpc.community.getById.useQuery(
    { id: props.communityId },
    { enabled: !!props.communityId },
  )
  const [previewGrant, setPreviewGrant] = useAtom(previewGrantAtom)
  const grant = previewGrant || props.initialValue || undefined
  const methods = useForm<Grant>({
    resolver: zodResolver(grantSchema),
  })
  const {
    control,
    register,
    reset,
    setValue,
    getValues,
    formState: { errors },
    handleSubmit: onSubmit,
  } = methods
  useEffect(() => {
    reset(grant)
  }, [grant, reset])
  useEffect(() => {
    if (community) {
      setValue('community', community.permalink)
    }
  }, [community, setValue])
  const { data: snapshots } = useQuery(
    ['snapshots', props.communityId, grant?.permission],
    async () => {
      const requiredCoinTypes = uniq([
        ...[requiredCoinTypeOfDidChecker(props.communityId)],
        ...(grant?.permission?.proposing
          ? requiredCoinTypesOfBooleanSets(grant.permission.proposing)
          : []),
        ...(grant?.permission?.voting
          ? requiredCoinTypesOfDecimalSets(grant.permission?.voting)
          : []),
      ])
      const snapshots = await pMap(requiredCoinTypes, getCurrentSnapshot, {
        concurrency: 5,
      })
      return snapshots.reduce(
        (obj, snapshot, index) => {
          const requiredCoinType = requiredCoinTypes[index]
          if (typeof requiredCoinType === 'number') {
            obj[requiredCoinType] = snapshot.toString()
          }
          return obj
        },
        {} as { [coinType: string]: string },
      )
    },
    { enabled: !!grant?.permission, refetchInterval: 30000 },
  )
  useEffect(() => {
    if (snapshots) {
      setValue('snapshots', snapshots)
    }
  }, [setValue, snapshots])
  const isManager = useIsManager(props.communityId)
  const disabled = !isManager

  return (
    <Form
      title={`Create Topic Grant${
        community?.name ? ` of ${community.name}` : ''
      }`}
      description="Topic Grant helps you automate your project's funding process with ease, while also elevating member's engagement."
      className={props.className}>
      <FormSection 
        title="Basic information">
        <div
          className="grid grid-cols-1 gap-6">
          <FormItem label="Grant topic" error={errors.name?.message}>
            <TextInput
              {...register('name')}
              placeholder="e.g. Hackathon Season 1"
              error={!!errors.name?.message}
              disabled={disabled}/>
          </FormItem>
          
          <FormItem
            label="Introduction"
            description="The purpose of this grant."
            error={errors?.introduction?.message}>
            <Controller
              control={control}
              name={'introduction'}
              render={({ field: { value, onChange } }) => (
                <MarkdownEditor
                  value={value}
                  onChange={onChange}
                  error={!!errors?.introduction?.message}
                  disabled={disabled}
                />
              )}
            />
          </FormItem>
        </div>
      </FormSection>

      <FormSection 
        title="Rules">
        <div
          className="grid grid-cols-6 gap-6">
          <FormItem
            className="col-span-6 sm:col-span-2"
            label="Announcing phase"
            error={errors.duration?.announcing?.message}>
            <Controller
              control={control}
              name="duration.announcing"
              render={({ field: { ref, value, onChange } }) => (
                <DurationInput
                  inputRef={ref}
                  value={value}
                  onChange={onChange}
                  disabled={disabled}
                  error={!!errors.duration?.announcing}
                />
              )}
            />
          </FormItem>
          
          <FormItem
            className="col-span-6 sm:col-span-2"
            label="Proposing phase"
            error={errors.duration?.proposing?.message}>
            <Controller
              control={control}
              name="duration.proposing"
              render={({ field: { ref, value, onChange } }) => (
                <DurationInput
                  inputRef={ref}
                  value={value}
                  onChange={onChange}
                  disabled={disabled}
                  error={!!errors.duration?.proposing}
                />
              )}
            />
          </FormItem>

          <FormItem
            className="col-span-6 sm:col-span-2"
            label="Voting phase"
            error={errors.duration?.voting?.message}>
            <Controller
              control={control}
              name="duration.voting"
              render={({ field: { ref, value, onChange } }) => (
                <DurationInput
                  inputRef={ref}
                  value={value}
                  onChange={onChange}
                  disabled={disabled}
                  error={!!errors.duration?.voting}
                />
              )}
            />
          </FormItem>
          
          <FormItem
            className="col-span-6 sm:col-span-3"
            label="Grant package"
            error={
              errors?.funding?.[0]?.[0]?.message ||
              errors?.funding?.[0]?.[1]?.message
            }>
            <div 
              className="flex w-full items-center gap-2">
              <TextInput
                disabled={disabled}
                {...register('funding.0.0')}
                error={!!errors?.funding?.[0]?.[0]}
                placeholder="e.g. 100 USD"
                className="min-w-0 flex-1"/>
              
              <span className="text-gray-400">✕</span>
              
              <Controller
                control={control}
                name="funding.0.1"
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    disabled={disabled}
                    type="number"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.valueAsNumber)}
                    error={!!errors?.funding?.[0]?.[1]}
                    placeholder="count"
                    className="shrink-0 basis-20"
                  />
                )}
              />
            </div>
          </FormItem>

          <FormItem
            className="col-span-6"
            label="Committee"
            description="If set, only proposals selected by committee members are eligible to be voted on."
            optional
            error={
              errors.permission?.selecting?.operands?.[0]?.arguments?.[1]?.[0]
                ?.message
            }>
            <FormProvider {...methods}>
              <BooleanSetsBlock
                name="selecting"
                communityId={props.communityId}
                disabled={disabled}
              />
            </FormProvider>
          </FormItem>
        </div>
      </FormSection>
      
      {isManager ? (
        <FormFooter>
          <Button
            primary
            size="large"
            icon={EyeIcon}
            onClick={(e) => {
              const argument =
                getValues().permission.selecting?.operands[0]?.arguments[1]
              if (!argument?.join('').length) {
                setValue('permission.selecting', undefined)
              } else {
                setValue('permission.selecting', {
                  operation: 'or',
                  operands: [
                    {
                      name: 'Committee',
                      function: 'prefixes_dot_suffix_exact_match',
                      arguments: [props.communityId, argument || []],
                    },
                  ],
                })
              }
              onSubmit((value) => {
                setPreviewGrant({
                  ...value,
                  preview: props.preview,
                })
                router.push(props.preview.to)
              }, console.error)(e)
            }}>
            Preview
          </Button>
        </FormFooter>
      ) : null}
    </Form>
  )
}
