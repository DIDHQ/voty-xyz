import { zodResolver } from '@hookform/resolvers/zod'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useMemo } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form'

import useAsync from '../hooks/use-async'
import useResolveDid from '../hooks/use-resolve-did'
import useSignJson from '../hooks/use-sign-json'
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
  const isNew = useMemo(
    () => !props.community?.groups?.[props.group],
    [props.community.groups, props.group],
  )
  useEffect(() => {
    if (isNew) {
      append({
        name: '',
        permission: {
          proposing: {
            operator: 'or',
            operands: [],
          },
          voting: {
            operator: 'max',
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
  }, [append, isNew])
  useEffect(() => {
    if (handleSubmit.status === 'success') {
      mutate()
    }
  }, [handleSubmit.status, mutate])

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
                  name="permission.proposing"
                  group={props.group}
                  disabled={!isAdmin}
                />
              </FormProvider>
            </FormItem>
          </GridItem6>
        </Grid6>
      </FormSection>
      <FormSection
        title="Voting power"
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
                  name="permission.voting"
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
          {isNew ? 'Create' : 'Submit'}
        </Button>
        {isNew ? (
          <div />
        ) : (
          <Button
            onClick={() => {
              remove(props.group)
              onSubmit(handleSubmit.execute, console.error)()
            }}
            disabled={!isAdmin}
          >
            Archive
          </Button>
        )}
      </FormFooter>
    </Form>
  )
}
