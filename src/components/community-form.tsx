import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import dynamic from 'next/dynamic'
import clsx from 'clsx'
import { EyeIcon } from '@heroicons/react/20/solid'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'

import { Community, communitySchema } from '../utils/schemas/v1/community'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import { Form, FormFooter, FormSection, FormItem } from './basic/form'
import { Grid6, GridItem2, GridItem6 } from './basic/grid'
import Button from './basic/button'
import useIsManager from '../hooks/use-is-manager'
import { previewCommunityAtom } from '../utils/atoms'
import { Preview } from '../utils/types'
import { domain } from '../utils/constants'

const AvatarInput = dynamic(() => import('./basic/avatar-input'), {
  ssr: false,
})

export default function CommunityForm(props: {
  communityId: string
  initialValue: Community | null
  preview: Preview
  className?: string
}) {
  const router = useRouter()
  const [previewCommunity, setPreviewCommunity] = useAtom(previewCommunityAtom)
  const community = previewCommunity || props.initialValue || undefined
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
    reset(community)
    setValue('id', props.communityId)
  }, [reset, community, setValue, props.communityId])
  const isNewCommunity = !props.initialValue
  const isManager = useIsManager(props.communityId)

  return (
    <Form
      title={
        isNewCommunity
          ? 'Import your community'
          : `Edit community of ${props.communityId}`
      }
      className={clsx('pt-8', props.className)}
    >
      <FormSection title="Basic information">
        <Grid6>
          <GridItem6>
            <FormItem label="Community entry link">
              <TextInput
                placeholder={`${domain}/${props.communityId}`}
                disabled
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem label="Logo" error={errors?.logo?.message}>
              <Controller
                control={control}
                name="logo"
                render={({ field: { ref, value, onChange } }) => (
                  <AvatarInput
                    inputRef={ref}
                    value={value}
                    onChange={onChange}
                    disabled={!isManager}
                  />
                )}
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem label="Community name" error={errors.name?.message}>
              <TextInput
                {...register('name')}
                placeholder="e.g. Bankless DAO"
                error={!!errors.name?.message}
                disabled={!isManager}
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem label="Slogan" error={errors?.slogan?.message}>
              <TextInput
                {...register('slogan')}
                placeholder="e.g. Media and Social DAO onboarding 1 billion people to crypto"
                error={!!errors?.slogan?.message}
                disabled={!isManager}
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem
              label="About"
              description="Provide a detailed description of your community to leave a lasting impression on people. Markdown is supported"
              error={errors?.about?.message}
            >
              <Textarea
                {...register('about')}
                error={!!errors?.about?.message}
                disabled={!isManager}
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem
              label="How to join"
              optional
              description="Provide a guide on how to join this community for people"
              error={errors?.how_to_join?.message}
            >
              <Textarea
                {...register('how_to_join')}
                placeholder="e.g. Holding a SubDID is the only credential for being a community member"
                error={!!errors?.how_to_join?.message}
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
              optional
              error={errors.links?.website?.message}
            >
              <TextInput
                {...register('links.website')}
                error={!!errors.links?.website?.message}
                disabled={!isManager}
              />
            </FormItem>
          </GridItem6>
          <GridItem2>
            <FormItem
              label="Twitter"
              optional
              error={errors.links?.twitter?.message}
            >
              <TextInput
                {...register('links.twitter')}
                onBlur={(e) =>
                  setValue(
                    'links.twitter',
                    e.target.value.replace(/^.*twitter\.com\//, ''),
                  )
                }
                error={!!errors.links?.twitter?.message}
                disabled={!isManager}
              />
            </FormItem>
          </GridItem2>
          <GridItem2>
            <FormItem
              label="Discord"
              optional
              error={errors.links?.discord?.message}
            >
              <TextInput
                {...register('links.discord')}
                onBlur={(e) =>
                  setValue(
                    'links.discord',
                    e.target.value
                      .replace(/^.*discord\.gg\//, '')
                      .replace(/^.*discord\.com\/invite\//, ''),
                  )
                }
                error={!!errors.links?.discord?.message}
                disabled={!isManager}
              />
            </FormItem>
          </GridItem2>
          <GridItem2>
            <FormItem
              label="GitHub"
              optional
              error={errors.links?.github?.message}
            >
              <TextInput
                {...register('links.github')}
                onBlur={(e) =>
                  setValue(
                    'links.github',
                    e.target.value.replace(/^.*github\.com\//, ''),
                  )
                }
                error={!!errors.links?.github?.message}
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
