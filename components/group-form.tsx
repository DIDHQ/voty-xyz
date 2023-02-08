import { zodResolver } from '@hookform/resolvers/zod'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useMemo } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form'

import useAsync from '../hooks/use-async'
import useCurrentSnapshot from '../hooks/use-current-snapshot'
import useResolveDid from '../hooks/use-resolve-did'
import useSignJson from '../hooks/use-sign-json'
import useWallet from '../hooks/use-wallet'
import { Community, communitySchema } from '../src/schemas'
import Button from './basic/button'
import DurationInput from './basic/duration-input'
import FormItem from './basic/form-item'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import BooleanSetsBlock from './boolean-sets-block'
import NumberSetsBlock from './number-sets-block'
import { useUpload } from '../hooks/use-api'

export default function GroupForm(props: {
  entry: string
  community: Community
  group: number
}) {
  const methods = useForm<Community>({
    resolver: zodResolver(communitySchema),
  })
  const {
    control,
    register,
    handleSubmit: onSubmit,
    reset,
    formState,
  } = methods
  const { append, remove } = useFieldArray({
    control,
    name: 'groups',
  })
  useEffect(() => {
    reset(props.community)
  }, [props.community, reset])
  const { account } = useWallet()
  const { data: snapshot } = useCurrentSnapshot(account?.coinType)
  const handleSignJson = useSignJson(props.entry)
  const handleUpload = useUpload()
  const { data: resolved } = useResolveDid(
    props.entry,
    account?.coinType,
    snapshot,
  )
  const isAdmin = useMemo(
    () =>
      resolved &&
      account &&
      resolved.coinType === account.coinType &&
      resolved.address === account.address,
    [resolved, account],
  )
  const handleSubmit = useAsync(
    useCallback(
      async (json: Community) => {
        const signed = await handleSignJson(json)
        if (!signed) {
          throw new Error('signature failed')
        }
        await handleUpload(signed)
      },
      [handleUpload, handleSignJson],
    ),
  )
  const isNew = useMemo(
    () => !props.community.groups?.[props.group],
    [props.community.groups, props.group],
  )
  useEffect(() => {
    if (isNew) {
      append(
        {
          name: '',
          permission: {
            proposing: {
              operator: 'or',
              operands: [],
            },
            voting: {
              operator: 'sum',
              operands: [],
            },
          },
          period: {
            announcement: 3600,
            voting: 86400,
          },
          extension: {
            id: nanoid(),
          },
        },
        { shouldFocus: false },
      )
    }
  }, [append, isNew])

  return props.group < 0 ? null : (
    <div className="space-y-8 divide-y divide-gray-200">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Profile</h3>
        <div className="sm:col-span-6">
          <FormItem
            label="Name"
            error={formState.errors.groups?.[props.group]?.name?.message}
          >
            <TextInput {...register(`groups.${props.group}.name`)} />
          </FormItem>
        </div>
        <div className="sm:col-span-6">
          <FormItem
            label="About"
            error={
              formState.errors.groups?.[props.group]?.extension?.about?.message
            }
          >
            <Textarea {...register(`groups.${props.group}.extension.about`)} />
          </FormItem>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 pt-8 sm:grid-cols-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Proposers
        </h3>
        <div className="sm:col-span-6">
          <FormItem
            error={
              formState.errors.groups?.[props.group]?.permission?.proposing
                ?.message
            }
          >
            <FormProvider {...methods}>
              <BooleanSetsBlock
                name="permission.proposing"
                group={props.group}
              />
            </FormProvider>
          </FormItem>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 pt-8 sm:grid-cols-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Voters</h3>
        <div className="sm:col-span-6">
          <FormItem
            error={
              formState.errors?.groups?.[props.group]?.permission?.voting
                ?.message
            }
          >
            <FormProvider {...methods}>
              <NumberSetsBlock name="permission.voting" group={props.group} />
            </FormProvider>
          </FormItem>
        </div>
      </div>
      <div className="pt-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Rules</h3>
        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="col-span-6 sm:col-span-6 lg:col-span-2">
            <FormItem
              label="Duration of announcement"
              error={
                formState.errors?.groups?.[props.group]?.period?.announcement
                  ?.message
              }
            >
              <Controller
                control={control}
                name={`groups.${props.group}.period.announcement`}
                render={({ field: { value, onChange } }) => (
                  <DurationInput
                    value={value}
                    onChange={onChange}
                    error={
                      !!formState.errors?.groups?.[props.group]?.period
                        ?.announcement
                    }
                  />
                )}
              />
            </FormItem>
          </div>
          <div className="col-span-6 sm:col-span-6 lg:col-span-2">
            <FormItem
              label="Duration of voting"
              error={
                formState.errors?.groups?.[props.group]?.period?.voting?.message
              }
            >
              <Controller
                control={control}
                name={`groups.${props.group}.period.voting`}
                render={({ field: { value, onChange } }) => (
                  <DurationInput
                    value={value}
                    onChange={onChange}
                    error={
                      !!formState.errors?.groups?.[props.group]?.period?.voting
                    }
                  />
                )}
              />
            </FormItem>
          </div>
        </div>
      </div>
      <div className="pt-6">
        <div className="flex justify-between">
          {isNew ? (
            <div />
          ) : (
            <Button
              onClick={() => {
                remove(props.group)
                onSubmit(console.log, console.error)()
              }}
            >
              Delete
            </Button>
          )}
          <Button
            primary
            disabled={!isAdmin}
            loading={handleSubmit.status === 'pending'}
            onClick={onSubmit(handleSubmit.execute, console.error)}
          >
            {isNew ? 'Create' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  )
}
