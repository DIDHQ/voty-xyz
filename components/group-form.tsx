import { zodResolver } from '@hookform/resolvers/zod'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useMemo } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import useDidIsMatch from '../hooks/use-did-is-match'
import useWallet from '../hooks/use-wallet'
import { Community, communitySchema } from '../src/schemas'
import DurationInput from './basic/duration-input'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import BooleanSetsBlock from './boolean-sets-block'
import NumberSetsBlock from './number-sets-block'
import { useCommunity } from '../hooks/use-api'
import { Form, FormFooter, FormSection, FormItem } from './basic/form'
import { Grid6, GridItem3, GridItem6 } from './basic/grid'

const SigningButton = dynamic(() => import('./signing-button'), { ssr: false })

const defaultAnnouncementPeriod = 3600

const defaultVotingPeriod = 86400

export default function GroupForm(props: {
  entry: string
  community: Community
  group: number
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
  const { append } = useFieldArray({
    control,
    name: 'groups',
  })
  useEffect(() => {
    reset(props.community)
  }, [props.community, reset])
  const { account } = useWallet()
  const { data: isAdmin } = useDidIsMatch(props.entry, account)
  const isNewGroup = useMemo(
    () => !props.community?.groups?.[props.group],
    [props.community.groups, props.group],
  )
  useEffect(() => {
    if (isNewGroup) {
      append({
        name: '',
        permission: {
          proposing: {
            operation: 'or',
            operands: [],
          },
          voting: {
            operation: 'max',
            operands: [],
          },
        },
        period: {
          announcement: defaultAnnouncementPeriod,
          voting: defaultVotingPeriod,
        },
        extension: {
          id: nanoid(),
        },
      })
    }
  }, [append, isNewGroup])
  const router = useRouter()
  const handleSubmitSuccess = useCallback(() => {
    mutate()
    router.push(`/${props.entry}/${props.group}`)
  }, [mutate, props.entry, props.group, router])

  return (
    <Form className={props.className}>
      <FormSection
        title="Profile"
        description="Basic information of the group."
      >
        <Grid6>
          <GridItem6>
            <FormItem
              label="Name"
              error={errors.groups?.[props.group]?.name?.message}
            >
              <TextInput
                {...register(`groups.${props.group}.name`)}
                error={!!errors.groups?.[props.group]?.name?.message}
                disabled={!isAdmin}
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem
              label="About"
              description="Styling with Markdown is supported"
              error={errors.groups?.[props.group]?.extension?.about?.message}
            >
              <Textarea
                {...register(`groups.${props.group}.extension.about`)}
                error={
                  !!errors.groups?.[props.group]?.extension?.about?.message
                }
                disabled={!isAdmin}
              />
            </FormItem>
          </GridItem6>
        </Grid6>
      </FormSection>
      <FormSection
        title="Proposers"
        description="Filters for proposal validation."
      >
        <Grid6>
          <GridItem6>
            <FormItem
              error={
                errors.groups?.[props.group]?.permission?.proposing
                  ? JSON.stringify(
                      errors.groups?.[props.group]?.permission?.proposing,
                    )
                  : undefined
              }
            >
              <FormProvider {...methods}>
                <BooleanSetsBlock
                  name="proposing"
                  entry={props.entry}
                  group={props.group}
                  disabled={!isAdmin}
                />
              </FormProvider>
            </FormItem>
          </GridItem6>
        </Grid6>
      </FormSection>
      <FormSection
        title="Voters"
        description="Voting power is calculated as maximum."
      >
        <Grid6>
          <GridItem6>
            <FormItem
              error={
                errors?.groups?.[props.group]?.permission?.voting
                  ? JSON.stringify(
                      errors?.groups?.[props.group]?.permission?.voting,
                    )
                  : undefined
              }
            >
              <FormProvider {...methods}>
                <NumberSetsBlock
                  name="voting"
                  entry={props.entry}
                  group={props.group}
                  disabled={!isAdmin}
                />
              </FormProvider>
            </FormItem>
          </GridItem6>
        </Grid6>
      </FormSection>
      <FormSection title="Rules" description="Proposal timing.">
        <Grid6>
          <GridItem3>
            <FormItem
              label="Duration of announcement"
              error={
                errors?.groups?.[props.group]?.period?.announcement?.message
              }
            >
              <Controller
                defaultValue={defaultAnnouncementPeriod}
                control={control}
                name={`groups.${props.group}.period.announcement`}
                render={({ field: { value, onChange } }) => (
                  <DurationInput
                    value={value}
                    onChange={onChange}
                    disabled={!isAdmin}
                    error={
                      !!errors?.groups?.[props.group]?.period?.announcement
                    }
                  />
                )}
              />
            </FormItem>
          </GridItem3>
          <GridItem3>
            <FormItem
              label="Duration of voting"
              error={errors?.groups?.[props.group]?.period?.voting?.message}
            >
              <Controller
                defaultValue={defaultVotingPeriod}
                control={control}
                name={`groups.${props.group}.period.voting`}
                render={({ field: { value, onChange } }) => (
                  <DurationInput
                    value={value}
                    onChange={onChange}
                    disabled={!isAdmin}
                    error={!!errors?.groups?.[props.group]?.period?.voting}
                  />
                )}
              />
            </FormItem>
          </GridItem3>
        </Grid6>
      </FormSection>
      <FormFooter>
        <FormProvider {...methods}>
          <SigningButton
            did={props.entry}
            onSuccess={handleSubmitSuccess}
            disabled={!isAdmin}
          >
            Submit
          </SigningButton>
        </FormProvider>
      </FormFooter>
    </Form>
  )
}
