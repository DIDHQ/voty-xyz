import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import dynamic from 'next/dynamic'
import clsx from 'clsx'
import { ArrowPathIcon, PlusIcon } from '@heroicons/react/20/solid'
import { useMutation } from '@tanstack/react-query'

import { Community, communitySchema } from '../utils/schemas/community'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import { Form, FormFooter, FormSection, FormItem } from './basic/form'
import { Grid6, GridItem2, GridItem6 } from './basic/grid'
import PreviewMarkdown from './preview-markdown'
import Button from './basic/button'
import useSignDocument from '../hooks/use-sign-document'
import { trpc } from '../utils/trpc'
import Notification from './basic/notification'
import useIsManager from '../hooks/use-is-manager'

const AvatarInput = dynamic(() => import('./basic/avatar-input'), {
  ssr: false,
})

export default function CommunityForm(props: {
  author?: string
  initialValue?: Community
  onSuccess: () => void
  className?: string
}) {
  const { onSuccess } = props
  const methods = useForm<Community>({
    resolver: zodResolver(communitySchema),
  })
  const {
    control,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
    handleSubmit: onSubmit,
  } = methods
  useEffect(() => {
    reset(props.initialValue || undefined)
  }, [props.initialValue, reset])
  const isNewCommunity = !props.initialValue
  const signDocument = useSignDocument(
    props.author,
    `You are ${
      isNewCommunity ? 'creating' : 'updating'
    } community on Voty\n\nhash:\n{sha256}`,
  )
  const { mutateAsync } = trpc.community.create.useMutation()
  const handleSubmit = useMutation<void, Error, Community>(
    async (community) => {
      const signed = await signDocument(community)
      if (signed) {
        await mutateAsync(signed)
        onSuccess()
      }
    },
  )
  const isManager = useIsManager(props.author)

  return (
    <>
      <Notification show={handleSubmit.isError}>
        {handleSubmit.error?.message}
      </Notification>
      <Form className={clsx('pt-8', props.className)}>
        <FormSection
          title={`${isNewCommunity ? 'New' : 'Edit'} community of ${
            props.author
          }`}
        >
          <Grid6>
            <GridItem6>
              <FormItem label="Logo" error={errors.extension?.logo?.message}>
                <Controller
                  control={control}
                  name="extension.logo"
                  render={({ field: { value, onChange } }) => (
                    <AvatarInput
                      value={value}
                      onChange={onChange}
                      disabled={!isManager}
                    />
                  )}
                />
              </FormItem>
            </GridItem6>
            <GridItem6>
              <FormItem label="Name" error={errors.name?.message}>
                <TextInput
                  {...register('name')}
                  error={!!errors.name?.message}
                  disabled={!isManager}
                />
              </FormItem>
            </GridItem6>
            <GridItem6>
              <FormItem
                label="Slogan"
                error={errors.extension?.slogan?.message}
              >
                <TextInput
                  {...register('extension.slogan')}
                  error={!!errors.extension?.slogan?.message}
                  disabled={!isManager}
                />
              </FormItem>
            </GridItem6>
            <GridItem6>
              <FormItem
                label="About"
                description={
                  <PreviewMarkdown>{watch('extension.about')}</PreviewMarkdown>
                }
                error={errors.extension?.about?.message}
              >
                <Textarea
                  {...register('extension.about')}
                  error={!!errors.extension?.about?.message}
                  disabled={!isManager}
                />
              </FormItem>
            </GridItem6>
          </Grid6>
        </FormSection>
        <FormSection title="Links">
          <Grid6>
            <GridItem6>
              <FormItem
                label="Website"
                error={errors.extension?.website?.message}
              >
                <TextInput
                  {...register('extension.website')}
                  error={!!errors.extension?.website?.message}
                  disabled={!isManager}
                />
              </FormItem>
            </GridItem6>
            <GridItem2>
              <FormItem
                label="Twitter"
                error={errors.extension?.twitter?.message}
              >
                <TextInput
                  {...register('extension.twitter')}
                  onBlur={(e) =>
                    setValue(
                      'extension.twitter',
                      e.target.value.replace(/^.*twitter\.com\//, ''),
                    )
                  }
                  error={!!errors.extension?.twitter?.message}
                  disabled={!isManager}
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
                  onBlur={(e) =>
                    setValue(
                      'extension.discord',
                      e.target.value
                        .replace(/^.*discord\.gg\//, '')
                        .replace(/^.*discord\.com\/invite\//, ''),
                    )
                  }
                  error={!!errors.extension?.discord?.message}
                  disabled={!isManager}
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
                  onBlur={(e) =>
                    setValue(
                      'extension.github',
                      e.target.value.replace(/^.*github\.com\//, ''),
                    )
                  }
                  error={!!errors.extension?.github?.message}
                  disabled={!isManager}
                />
              </FormItem>
            </GridItem2>
          </Grid6>
        </FormSection>
        {isManager ? (
          <FormFooter>
            <Button
              primary
              icon={isNewCommunity ? PlusIcon : ArrowPathIcon}
              loading={handleSubmit.isLoading}
              onClick={onSubmit(
                (value) => handleSubmit.mutate(value),
                console.error,
              )}
            >
              {isNewCommunity ? 'Create' : 'Update'}
            </Button>
          </FormFooter>
        ) : null}
      </Form>
    </>
  )
}
