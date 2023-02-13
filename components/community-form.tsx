import { useCallback, useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import { Community, communitySchema } from '../src/schemas'
import AvatarInput from './basic/avatar-input'
import useDidIsMatch from '../hooks/use-did-is-match'
import useWallet from '../hooks/use-wallet'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import { useCommunity } from '../hooks/use-api'
import { Form, FormFooter, FormSection, FormItem } from './basic/form'
import { Grid6, GridItem2, GridItem6 } from './basic/grid'

const SigningButton = dynamic(() => import('../components/signing-button'), {
  ssr: false,
})

export default function CommunityForm(props: {
  entry: string
  community?: Community
  className?: string
}) {
  const methods = useForm<Community>({
    resolver: zodResolver(communitySchema),
  })
  const {
    control,
    register,
    reset,
    formState: { errors },
  } = methods
  const { mutate } = useCommunity(props.entry)
  useEffect(() => {
    reset(props.community)
  }, [props.community, reset])
  const { account } = useWallet()
  const { data: isAdmin } = useDidIsMatch(props.entry, account)
  const router = useRouter()
  const handleSuccess = useCallback(() => {
    mutate()
    router.push(`/${props.entry}`)
  }, [mutate, props.entry, router])

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
            <FormItem label="GitHub" error={errors.extension?.github?.message}>
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
        <FormProvider {...methods}>
          <SigningButton
            did={props.entry}
            onSuccess={handleSuccess}
            disabled={!isAdmin}
          >
            {props.community ? 'Submit' : 'Create'}
          </SigningButton>
        </FormProvider>
      </FormFooter>
    </Form>
  )
}
