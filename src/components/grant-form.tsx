import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import {
  Controller,
  FieldError,
  FieldErrorsImpl,
  FormProvider,
  Merge,
  useForm,
} from 'react-hook-form'
import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  PlusIcon,
} from '@heroicons/react/20/solid'
import { useMutation } from '@tanstack/react-query'

import { Community, communitySchema } from '../utils/schemas/community'
import DurationInput from './basic/duration-input'
import TextInput from './basic/text-input'
import BooleanSetsBlock from './boolean-sets-block'
import DecimalSetsBlock from './decimal-sets-block'
import { Form, FormFooter, FormSection, FormItem } from './basic/form'
import { Grid6, GridItem2, GridItem6 } from './basic/grid'
import Button from './basic/button'
import useSignDocument from '../hooks/use-sign-document'
import { trpc } from '../utils/trpc'
import Notification from './basic/notification'
import useIsManager from '../hooks/use-is-manager'
import { Grant } from '../utils/schemas/group'

export default function GrantForm(props: {
  author: string
  initialValue?: Community
  group?: string
  isNewGroup?: boolean
  onSuccess: (isArchive: boolean) => void
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
    formState: { errors },
    handleSubmit: onSubmit,
  } = methods
  const groupIndex = useMemo(() => {
    const index = props.initialValue?.groups?.findIndex(
      ({ id }) => id === props.group,
    )
    if (index === undefined || index === -1) {
      return props.initialValue?.groups?.length || 0
    }
    return index
  }, [props.initialValue?.groups, props.group])
  useEffect(() => {
    reset(props.initialValue)
  }, [props.initialValue, reset])
  const signDocument = useSignDocument(
    props.author,
    `You are ${
      props.isNewGroup ? 'creating' : 'updating'
    } grant on Voty\n\nhash:\n{sha256}`,
  )
  const { mutateAsync } = trpc.community.create.useMutation()
  const handleSubmit = useMutation<void, Error, Community>(
    async (community) => {
      const signed = await signDocument(community)
      if (signed) {
        await mutateAsync(signed)
        onSuccess(false)
      }
    },
  )
  const handleArchive = useMutation<void, Error, Community>(
    async (community) => {
      const signed = await signDocument({
        ...community,
        groups: community.groups?.filter(({ id }) => id !== props.group),
      })
      if (signed) {
        await mutateAsync(signed)
        onSuccess(true)
      }
    },
  )
  const isManager = useIsManager(props.author)
  const groupErrors = errors.groups?.[groupIndex] as Merge<
    FieldError,
    FieldErrorsImpl<NonNullable<Grant>>
  >

  return (
    <>
      <Notification show={handleSubmit.isError}>
        {handleSubmit.error?.message}
      </Notification>
      <Notification show={handleArchive.isError}>
        {handleArchive.error?.message}
      </Notification>
      <Form className={props.className}>
        <FormSection
          title={`${props.isNewGroup ? 'New' : 'Edit'} grant of ${
            props.author
          }`}
        >
          <Grid6>
            <GridItem6>
              <FormItem label="Name" error={groupErrors?.name?.message}>
                <TextInput
                  {...register(`groups.${groupIndex}.name`)}
                  error={!!groupErrors?.name?.message}
                  disabled={!isManager}
                />
              </FormItem>
            </GridItem6>
            <GridItem6>
              <FormItem
                label="Introduction"
                error={groupErrors?.extension?.introduction?.message}
              >
                <TextInput
                  {...register(`groups.${groupIndex}.extension.introduction`)}
                  error={!!groupErrors?.extension?.introduction?.message}
                  disabled={!isManager}
                />
              </FormItem>
            </GridItem6>
          </Grid6>
        </FormSection>
        <FormSection
          title="Investors"
          description="The following DIDs are eligible to create funding round"
        >
          <Grid6>
            <GridItem6>
              <FormItem
                error={groupErrors?.permission?.proposing?.operands?.message}
              >
                <FormProvider {...methods}>
                  <BooleanSetsBlock
                    name="proposing"
                    entry={props.author}
                    groupIndex={groupIndex}
                    disabled={!isManager}
                  />
                </FormProvider>
              </FormItem>
            </GridItem6>
          </Grid6>
        </FormSection>
        <FormSection
          title="Proposers"
          description="The following DIDs are eligible to propose"
        >
          <Grid6>
            <GridItem6>
              <FormItem
                error={
                  groupErrors?.permission?.adding_option?.operands?.message
                }
              >
                <FormProvider {...methods}>
                  <BooleanSetsBlock
                    name="adding_option"
                    entry={props.author}
                    groupIndex={groupIndex}
                    disabled={!isManager}
                  />
                </FormProvider>
              </FormItem>
            </GridItem6>
          </Grid6>
        </FormSection>
        <FormSection
          title="Voters"
          description="The following DIDs are eligible to vote"
        >
          <Grid6>
            <GridItem6>
              <FormItem
                error={groupErrors?.permission?.voting?.operands?.message}
              >
                <FormProvider {...methods}>
                  <DecimalSetsBlock
                    name="voting"
                    entry={props.author}
                    groupIndex={groupIndex}
                    disabled={!isManager}
                  />
                </FormProvider>
              </FormItem>
            </GridItem6>
          </Grid6>
        </FormSection>
        <FormSection title="Schedule">
          <Grid6>
            <GridItem2>
              <FormItem
                label="Duration of pending before proposing"
                error={groupErrors?.duration?.pending?.message}
              >
                <Controller
                  control={control}
                  name={`groups.${groupIndex}.duration.pending`}
                  render={({ field: { value, onChange } }) => (
                    <DurationInput
                      value={value}
                      onChange={onChange}
                      disabled={!isManager}
                      error={!!groupErrors?.duration?.pending}
                    />
                  )}
                />
              </FormItem>
            </GridItem2>
            <GridItem2>
              <FormItem
                label="Duration of proposing before voting"
                error={groupErrors?.duration?.adding_option?.message}
              >
                <Controller
                  control={control}
                  name={`groups.${groupIndex}.duration.adding_option`}
                  render={({ field: { value, onChange } }) => (
                    <DurationInput
                      value={value}
                      onChange={onChange}
                      disabled={!isManager}
                      error={!!groupErrors?.duration?.adding_option}
                    />
                  )}
                />
              </FormItem>
            </GridItem2>
            <GridItem2>
              <FormItem
                label="Duration of voting"
                error={groupErrors?.duration?.voting?.message}
              >
                <Controller
                  control={control}
                  name={`groups.${groupIndex}.duration.voting`}
                  render={({ field: { value, onChange } }) => (
                    <DurationInput
                      value={value}
                      onChange={onChange}
                      disabled={!isManager}
                      error={!!groupErrors?.duration?.voting}
                    />
                  )}
                />
              </FormItem>
            </GridItem2>
          </Grid6>
        </FormSection>
        <FormSection title="Funding" description="Defines the prize of winner">
          <Grid6>
            <GridItem2>
              <FormItem
                error={
                  groupErrors?.extension?.funding?.[0]?.[0]?.message ||
                  groupErrors?.extension?.funding?.[0]?.[1]?.message
                }
              >
                <div className="flex items-center space-x-2">
                  <TextInput
                    disabled={!isManager}
                    {...register(`groups.${groupIndex}.extension.funding.0.0`)}
                    error={!!groupErrors?.extension?.funding?.[0]?.[0]}
                    placeholder="name"
                    className="w-0 flex-1"
                  />
                  <span className="text-gray-400">X</span>
                  <Controller
                    control={control}
                    name={`groups.${groupIndex}.extension.funding.0.1`}
                    render={({ field: { value, onChange } }) => (
                      <TextInput
                        disabled={!isManager}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.valueAsNumber)}
                        error={!!groupErrors?.duration?.voting}
                        placeholder="count"
                        className="shrink-0 basis-16"
                      />
                    )}
                  />
                </div>
              </FormItem>
            </GridItem2>
          </Grid6>
        </FormSection>
        {isManager ? (
          <FormFooter>
            <Button
              primary
              icon={props.isNewGroup ? PlusIcon : ArrowPathIcon}
              loading={handleSubmit.isLoading}
              onClick={onSubmit(
                (value) => handleSubmit.mutate(value),
                console.error,
              )}
            >
              {props.isNewGroup ? 'Create' : 'Update'}
            </Button>
            {props.isNewGroup ? null : (
              <Button
                icon={ArchiveBoxIcon}
                loading={handleArchive.isLoading}
                onClick={onSubmit(
                  (value) => handleArchive.mutate(value),
                  console.error,
                )}
              >
                Archive
              </Button>
            )}
          </FormFooter>
        ) : null}
      </Form>
    </>
  )
}
