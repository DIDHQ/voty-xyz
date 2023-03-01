import { useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import dynamic from 'next/dynamic'
import { ArrowPathIcon, PlusIcon } from '@heroicons/react/20/solid'

import { Community, communitySchema } from '../utils/schemas/community'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import { Form, FormFooter, FormSection, FormItem } from './basic/form'
import { Grid6, GridItem2, GridItem6 } from './basic/grid'
import PreviewMarkdown from './preview-markdown'
import clsx from 'clsx'

const AvatarInput = dynamic(() => import('./basic/avatar-input'), {
  ssr: false,
})

const SigningCommunityButton = dynamic(
  () => import('./signing/signing-community-button'),
  { ssr: false },
)

export default function CommunityForm(props: {
  entry: string
  community?: Community
  onSuccess: () => void
  disabled?: boolean
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
  } = methods
  useEffect(() => {
    reset(props.community || undefined)
  }, [props.community, reset])
  const isNewCommunity = !props.community

  return (
    <Form className={clsx('pt-8', props.className)}>
      <FormSection
        title={isNewCommunity ? 'New community' : 'Basic Information'}
        description="logo, name, slogan & about"
      >
        <Grid6>
          <GridItem6>
            <FormItem label="Logo" error={errors.extension?.logo?.message}>
              <Controller
                control={control}
                name="extension.logo"
                render={({ field: { value, onChange } }) => (
                  <AvatarInput
                    name={props.entry}
                    value={value}
                    onChange={onChange}
                    disabled={props.disabled}
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
                disabled={props.disabled}
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem label="Slogan" error={errors.extension?.slogan?.message}>
              <TextInput
                {...register('extension.slogan')}
                error={!!errors.extension?.slogan?.message}
                disabled={props.disabled}
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
                disabled={props.disabled}
              />
            </FormItem>
          </GridItem6>
        </Grid6>
      </FormSection>
      <FormSection
        title="Links"
        description="website, twitter, discord & github"
      >
        <Grid6>
          <GridItem6>
            <FormItem
              label="Website"
              error={errors.extension?.website?.message}
            >
              <TextInput
                {...register('extension.website')}
                error={!!errors.extension?.website?.message}
                disabled={props.disabled}
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
                disabled={props.disabled}
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
                disabled={props.disabled}
              />
            </FormItem>
          </GridItem2>
          <GridItem2>
            <FormItem label="GitHub" error={errors.extension?.github?.message}>
              <TextInput
                {...register('extension.github')}
                onBlur={(e) =>
                  setValue(
                    'extension.github',
                    e.target.value.replace(/^.*github\.com\//, ''),
                  )
                }
                error={!!errors.extension?.github?.message}
                disabled={props.disabled}
              />
            </FormItem>
          </GridItem2>
        </Grid6>
      </FormSection>
      {props.disabled ? null : (
        <FormFooter>
          <FormProvider {...methods}>
            <SigningCommunityButton
              did={props.entry}
              icon={isNewCommunity ? PlusIcon : ArrowPathIcon}
              onSuccess={onSuccess}
            >
              {isNewCommunity ? 'Create' : 'Update'}
            </SigningCommunityButton>
          </FormProvider>
        </FormFooter>
      )}
    </Form>
  )
}
