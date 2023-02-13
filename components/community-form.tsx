import { useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'

import useAsync from '../hooks/use-async'
import { Community, communitySchema } from '../src/schemas'
import AvatarInput from './basic/avatar-input'
import useDidIsMatch from '../hooks/use-did-is-match'
import useSignDocument from '../hooks/use-sign-document'
import useWallet from '../hooks/use-wallet'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import Button from './basic/button'
import { useCommunity, useUpload } from '../hooks/use-api'
import { Form, FormFooter, FormSection, FormItem } from './basic/form'
import { Grid6, GridItem2, GridItem6 } from './basic/grid'
import Notification from './basic/notification'

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
  const { mutate } = useCommunity(props.entry)
  useEffect(() => {
    reset(props.community)
  }, [props.community, reset])
  const { account } = useWallet()
  const handleSignDocument = useSignDocument(props.entry)
  const handleUpload = useUpload()
  const { data: isAdmin } = useDidIsMatch(props.entry, account)
  const handleSubmit = useAsync(
    useCallback(
      async (community: Community) => {
        const signed = await handleSignDocument(community)
        if (!signed) {
          throw new Error('signing failed')
        }
        return handleUpload(signed)
      },
      [handleUpload, handleSignDocument],
    ),
  )
  const router = useRouter()
  useEffect(() => {
    if (handleSubmit.status === 'success') {
      mutate()
      router.push(`/${props.entry}`)
    }
  }, [handleSubmit.status, mutate, props.entry, router])

  return (
    <>
      <Notification show={handleSubmit.status === 'error'}>
        {handleSubmit.error?.message}
      </Notification>
      <Form className={props.className}>
        <FormSection
          title="Profile"
          description="Basic information of the community."
        >
          <Grid6>
            <GridItem6>
              <FormItem label="Name" error={errors.name?.message}>
                <TextInput
                  {...register('name')}
                  error={!!errors.name?.message}
                  disabled={!isAdmin}
                />
              </FormItem>
            </GridItem6>
            <GridItem6>
              <FormItem
                label="About"
                description="Styling with Markdown is supported"
                error={errors.extension?.about?.message}
              >
                <Textarea
                  {...register('extension.about')}
                  error={!!errors.extension?.about?.message}
                  disabled={!isAdmin}
                />
              </FormItem>
            </GridItem6>
            <GridItem6>
              <FormItem
                label="Avatar"
                error={errors.extension?.avatar?.message}
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
            </GridItem6>
            <GridItem6>
              <FormItem
                label="Website"
                error={errors.extension?.website?.message}
              >
                <TextInput
                  {...register('extension.website')}
                  error={!!errors.extension?.website?.message}
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
              <FormItem
                label="Twitter"
                error={errors.extension?.twitter?.message}
              >
                <TextInput
                  {...register('extension.twitter')}
                  error={!!errors.extension?.twitter?.message}
                  disabled={!isAdmin}
                />
              </FormItem>
            </GridItem2>
            <GridItem2>
              <FormItem
                label="Discord"
                error={errors.extension?.discord?.message}
              >
                <TextInput
                  {...register('extension.discord')}
                  error={!!errors.extension?.discord?.message}
                  disabled={!isAdmin}
                />
              </FormItem>
            </GridItem2>
            <GridItem2>
              <FormItem
                label="GitHub"
                error={errors.extension?.github?.message}
              >
                <TextInput
                  {...register('extension.github')}
                  error={!!errors.extension?.github?.message}
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
    </>
  )
}
