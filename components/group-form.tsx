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

import useAsync from '../hooks/use-async'
import useDidIsMatch from '../hooks/use-did-is-match'
import useSignDocument from '../hooks/use-sign-document'
import useWallet from '../hooks/use-wallet'
import { Community, communitySchema } from '../src/schemas'
import Button from './basic/button'
import DurationInput from './basic/duration-input'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import BooleanSetsBlock from './boolean-sets-block'
import NumberSetsBlock from './number-sets-block'
import { useEntryConfig, useUpload } from '../hooks/use-api'
import { Form, FormFooter, FormSection, FormItem } from './basic/form'
import { Grid6, GridItem3, GridItem6 } from './basic/grid'
import Notification from './basic/notification'

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
    handleSubmit: onSubmit,
    reset,
    formState: { errors },
  } = methods
  const { mutate } = useEntryConfig(props.entry)
  const { append, remove } = useFieldArray({
    control,
    name: 'groups',
  })
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
  const handleArchive = useAsync(
    useCallback(
      async (community: Community) => {
        remove(props.group)
        const signed = await handleSignDocument(community)
        if (!signed) {
          throw new Error('signing failed')
        }
        return handleUpload(signed)
      },
      [remove, props.group, handleSignDocument, handleUpload],
    ),
  )
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
  useEffect(() => {
    if (handleSubmit.status === 'success') {
      mutate()
      router.push(`/${props.entry}/${props.group}`)
    }
  }, [handleSubmit.status, mutate, props.entry, props.group, router])
  useEffect(() => {
    if (handleArchive.status === 'success') {
      mutate()
      router.push(`/${props.entry}`)
    }
  }, [handleArchive.status, mutate, props.entry, router])

  return (
    <>
      <Notification show={handleSubmit.status === 'error'}>
        {handleSubmit.error?.message}
      </Notification>
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
          <Button
            primary
            disabled={!isAdmin}
            loading={handleSubmit.status === 'pending'}
            onClick={onSubmit(handleSubmit.execute, console.error)}
          >
            {isNewGroup ? 'Create' : 'Submit'}
          </Button>
          {isNewGroup ? (
            <div />
          ) : (
            <Button
              disabled={!isAdmin}
              loading={handleArchive.status === 'pending'}
              onClick={onSubmit(handleArchive.execute, console.error)}
            >
              Archive
            </Button>
          )}
        </FormFooter>
      </Form>
    </>
  )
}
