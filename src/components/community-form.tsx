import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import dynamic from 'next/dynamic'
import clsx from 'clsx'
import { EyeIcon } from '@heroicons/react/20/solid'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'

import { Community, communitySchema } from '../utils/schemas/community'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import { Form, FormFooter, FormSection, FormItem } from './basic/form'
import { Grid6, GridItem2, GridItem6 } from './basic/grid'
import Button from './basic/button'
import useIsManager from '../hooks/use-is-manager'
import { previewCommunityAtom } from '../utils/atoms'
import { Preview } from '../utils/types'

const AvatarInput = dynamic(() => import('./basic/avatar-input'), {
  ssr: false,
})

export default function CommunityForm(props: {
  author: string
  initialValue?: Community
  preview: Preview
  className?: string
}) {
  const router = useRouter()
  const [previewCommunity, setPreviewCommunity] = useAtom(previewCommunityAtom)
  const methods = useForm<Community>({
    resolver: zodResolver(communitySchema),
  })
  const {
    control,
    register,
    reset,
    setValue,
    formState: { errors },
    handleSubmit: onSubmit,
  } = methods
  useEffect(() => {
    reset(previewCommunity || props.initialValue || undefined)
  }, [previewCommunity, props.initialValue, reset])
  const isNewCommunity = !props.initialValue
  const isManager = useIsManager(props.author)

  return (
    <Form
      title={`${isNewCommunity ? 'New' : 'Edit'} community of ${props.author}`}
      className={clsx('pt-8', props.className)}
    >
      <FormSection>
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
            <FormItem label="Slogan" error={errors.extension?.slogan?.message}>
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
              description="Markdown is supported"
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
            icon={EyeIcon}
            onClick={onSubmit((value) => {
              setPreviewCommunity({ ...value, preview: props.preview })
              router.push(props.preview.to)
            }, console.error)}
          >
            Preview
          </Button>
        </FormFooter>
      ) : null}
    </Form>
  )
}
