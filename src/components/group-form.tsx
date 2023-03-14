import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  PlusIcon,
} from '@heroicons/react/20/solid'
import { useMutation } from '@tanstack/react-query'

import { Community, communitySchema } from '../utils/schemas/community'
import DurationInput from './basic/duration-input'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import BooleanSetsBlock from './boolean-sets-block'
import DecimalSetsBlock from './decimal-sets-block'
import { Form, FormFooter, FormSection, FormItem } from './basic/form'
import { Grid6, GridItem3, GridItem6 } from './basic/grid'
import PreviewMarkdown from './preview-markdown'
import Button from './basic/button'
import useSignDocument from '../hooks/use-sign-document'
import { trpc } from '../utils/trpc'
import Notification from './basic/notification'
import useIsManager from '../hooks/use-is-manager'

export default function GroupForm(props: {
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
    watch,
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
    } workgroup on Voty\n\nhash:\n{sha256}`,
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
          title={`${props.isNewGroup ? 'New' : 'Edit'} workgroup of ${
            props.author
          }`}
        >
          <Grid6>
            <GridItem6>
              <FormItem
                label="Name"
                error={errors.groups?.[groupIndex]?.name?.message}
              >
                <TextInput
                  {...register(`groups.${groupIndex}.name`)}
                  error={!!errors.groups?.[groupIndex]?.name?.message}
                  disabled={!isManager}
                />
              </FormItem>
            </GridItem6>
            <GridItem6>
              <FormItem
                label="Introduction"
                error={
                  errors.groups?.[groupIndex]?.extension?.introduction?.message
                }
              >
                <TextInput
                  {...register(`groups.${groupIndex}.extension.introduction`)}
                  error={
                    !!errors.groups?.[groupIndex]?.extension?.introduction
                      ?.message
                  }
                  disabled={!isManager}
                />
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
                  errors.groups?.[groupIndex]?.permission?.proposing?.operands
                    ?.message
                }
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
          title="Voters"
          description="The following DIDs are eligible to vote"
        >
          <Grid6>
            <GridItem6>
              <FormItem
                error={
                  errors?.groups?.[groupIndex]?.permission?.voting?.operands
                    ?.message
                }
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
            <GridItem3>
              <FormItem
                label="Duration of pending before voting"
                error={
                  errors?.groups?.[groupIndex]?.duration?.announcement?.message
                }
              >
                <Controller
                  control={control}
                  name={`groups.${groupIndex}.duration.announcement`}
                  render={({ field: { value, onChange } }) => (
                    <DurationInput
                      value={value}
                      onChange={onChange}
                      disabled={!isManager}
                      error={
                        !!errors?.groups?.[groupIndex]?.duration?.announcement
                      }
                    />
                  )}
                />
              </FormItem>
            </GridItem3>
            <GridItem3>
              <FormItem
                label="Duration of voting"
                error={errors?.groups?.[groupIndex]?.duration?.voting?.message}
              >
                <Controller
                  control={control}
                  name={`groups.${groupIndex}.duration.voting`}
                  render={({ field: { value, onChange } }) => (
                    <DurationInput
                      value={value}
                      onChange={onChange}
                      disabled={!isManager}
                      error={!!errors?.groups?.[groupIndex]?.duration?.voting}
                    />
                  )}
                />
              </FormItem>
            </GridItem3>
          </Grid6>
        </FormSection>
        <FormSection
          title="Terms and conditions"
          description="Defines the final state of proposal"
        >
          <Grid6>
            <GridItem6>
              <FormItem
                description={
                  <PreviewMarkdown>
                    {watch(
                      `groups.${groupIndex}.extension.terms_and_conditions`,
                    )}
                  </PreviewMarkdown>
                }
                error={
                  errors?.groups?.[groupIndex]?.extension?.terms_and_conditions
                    ?.message
                }
              >
                <Textarea
                  disabled={!isManager}
                  {...register(
                    `groups.${groupIndex}.extension.terms_and_conditions`,
                  )}
                  error={
                    !!errors?.groups?.[groupIndex]?.extension
                      ?.terms_and_conditions?.message
                  }
                />
              </FormItem>
            </GridItem6>
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
