import { useCallback, useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import useAsync from '../hooks/use-async'
import { Community, communitySchema } from '../src/schemas'
import AvatarInput from './basic/avatar-input'
import FormItem from './basic/form-item'
import useResolveDid from '../hooks/use-resolve-did'
import useSignJson from '../hooks/use-sign-json'
import useWallet from '../hooks/use-wallet'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import Button from './basic/button'
import { useUpload } from '../hooks/use-api'

export default function CommunityForm(props: {
  entry: string
  community?: Community
}) {
  const {
    control,
    register,
    handleSubmit: onSubmit,
    reset,
    formState,
  } = useForm<Community>({
    resolver: zodResolver(communitySchema),
  })
  useEffect(() => {
    reset(props.community)
  }, [props.community, reset])
  const { account } = useWallet()
  const handleSignJson = useSignJson(props.entry)
  const handleUpload = useUpload()
  const { data: resolved } = useResolveDid(props.entry, account?.coinType)
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

  return (
    <div className="space-y-8 divide-y divide-gray-200 pl-6">
      <div className="pt-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Profile</h3>
        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-6">
            <FormItem label="Name" error={formState.errors.name?.message}>
              <TextInput
                error={!!formState.errors.name?.message}
                {...register('name')}
                disabled={!isAdmin}
              />
            </FormItem>
          </div>
          <div className="sm:col-span-6">
            <FormItem
              label="About"
              error={formState.errors.extension?.about?.message}
            >
              <Textarea
                error={!!formState.errors.extension?.about?.message}
                {...register('extension.about')}
                disabled={!isAdmin}
              />
            </FormItem>
          </div>
          <div className="sm:col-span-6">
            <FormItem
              label="Avatar"
              error={formState.errors.extension?.avatar?.message}
            >
              <Controller
                control={control}
                name="extension.avatar"
                render={({ field: { value, onChange } }) => (
                  <AvatarInput
                    name={props.entry}
                    value={value}
                    onChange={onChange}
                    disabled={!isAdmin}
                  />
                )}
              />
            </FormItem>
          </div>
          <div className="sm:col-span-6">
            <FormItem
              label="Website"
              error={formState.errors.extension?.website?.message}
            >
              <TextInput
                error={!!formState.errors.extension?.website?.message}
                {...register('extension.website')}
                disabled={!isAdmin}
              />
            </FormItem>
          </div>
        </div>
      </div>
      <div className="pt-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Social accounts
        </h3>
        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="col-span-6 sm:col-span-6 lg:col-span-2">
            <FormItem label="Twitter">
              <TextInput
                {...register('extension.twitter')}
                disabled={!isAdmin}
              />
            </FormItem>
          </div>
          <div className="col-span-6 sm:col-span-6 lg:col-span-2">
            <FormItem label="Discord">
              <TextInput
                {...register('extension.discord')}
                disabled={!isAdmin}
              />
            </FormItem>
          </div>
          <div className="col-span-6 sm:col-span-6 lg:col-span-2">
            <FormItem label="GitHub">
              <TextInput
                {...register('extension.github')}
                disabled={!isAdmin}
              />
            </FormItem>
          </div>
        </div>
      </div>
      <div className="pt-5">
        <div className="flex justify-end">
          <Button
            primary
            disabled={!isAdmin}
            loading={handleSubmit.status === 'pending'}
            onClick={onSubmit(handleSubmit.execute, console.error)}
          >
            {props.community ? 'Submit' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  )
}
