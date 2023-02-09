import { useCallback, useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import useAsync from '../hooks/use-async'
import { Community, communitySchema } from '../src/schemas'
import AvatarInput from './basic/avatar-input'
import useResolveDid from '../hooks/use-resolve-did'
import useSignJson from '../hooks/use-sign-json'
import useWallet from '../hooks/use-wallet'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import Button from './basic/button'
import { useEntryConfig, useUpload } from '../hooks/use-api'
import { Form, FormFooter, FormSection, FormItem } from './basic/form'
import { Grid6, GridItem2, GridItem6 } from './basic/grid'

export default function CommunityForm(props: {
  entry: string
  community?: Community
  className?: string
}) {
  const {
    control,
    register,
    handleSubmit: onSubmit,
    reset,
    formState: { errors },
  } = useForm<Community>({
    resolver: zodResolver(communitySchema),
  })
  const { mutate } = useEntryConfig(props.entry)
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
  useEffect(() => {
    if (handleSubmit.status === 'success') {
      mutate()
    }
  }, [handleSubmit.status, mutate])

  return (
    <Form className={props.className}>
      <FormSection
        title="Profile"
        description="Basic information of the community."
      >
        <Grid6>
          <GridItem6>
            <FormItem label="Name" error={errors.name?.message}>
              <TextInput
                error={!!errors.name?.message}
                {...register('name')}
                disabled={!isAdmin}
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem label="About" error={errors.extension?.about?.message}>
              <Textarea
                error={!!errors.extension?.about?.message}
                {...register('extension.about')}
                disabled={!isAdmin}
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem label="Avatar" error={errors.extension?.avatar?.message}>
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
          </GridItem6>
          <GridItem6>
            <FormItem
              label="Website"
              error={errors.extension?.website?.message}
            >
              <TextInput
                error={!!errors.extension?.website?.message}
                {...register('extension.website')}
                disabled={!isAdmin}
              />
            </FormItem>
          </GridItem6>
        </Grid6>
      </FormSection>
      <FormSection
        title="Social accounts"
        description="Social relationship of the community."
      >
        <Grid6>
          <GridItem2>
            <FormItem label="Twitter">
              <TextInput
                {...register('extension.twitter')}
                disabled={!isAdmin}
              />
            </FormItem>
          </GridItem2>
          <GridItem2>
            <FormItem label="Discord">
              <TextInput
                {...register('extension.discord')}
                disabled={!isAdmin}
              />
            </FormItem>
          </GridItem2>
          <GridItem2>
            <FormItem label="GitHub">
              <TextInput
                {...register('extension.github')}
                disabled={!isAdmin}
              />
            </FormItem>
          </GridItem2>
        </Grid6>
      </FormSection>
      <FormFooter>
        <Button
          primary
          disabled={!isAdmin}
          loading={handleSubmit.status === 'pending'}
          onClick={onSubmit(handleSubmit.execute, console.error)}
        >
          {props.community ? 'Submit' : 'Create'}
        </Button>
      </FormFooter>
    </Form>
  )
}
