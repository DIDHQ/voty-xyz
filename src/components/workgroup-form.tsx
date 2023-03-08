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
import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import Notification from './basic/notification'

export default function WorkgroupForm(props: {
  author: string
  initialValue?: Community
  workgroup: string
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
  const workgroupIndex = useMemo(() => {
    const index = props.initialValue?.workgroups?.findIndex(
      ({ id }) => id === props.workgroup,
    )
    if (index === undefined || index === -1) {
      return props.initialValue?.workgroups?.length || 0
    }
    return index
  }, [props.initialValue?.workgroups, props.workgroup])
  const isNewWorkgroup = useMemo(
    () => !props.initialValue?.workgroups?.[workgroupIndex],
    [props.initialValue?.workgroups, workgroupIndex],
  )
  useEffect(() => {
    reset(props.initialValue)
  }, [props.initialValue, reset])
  const signDocument = useSignDocument(
    props.author,
    `You are ${
      isNewWorkgroup ? 'creating' : 'updating'
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
        workgroups: community.workgroups?.filter(
          ({ id }) => id !== props.workgroup,
        ),
      })
      if (signed) {
        await mutateAsync(signed)
        onSuccess(true)
      }
    },
  )
  const { account } = useWallet()
  const { data: dids } = useDids(account)
  const disabled = useMemo(
    () => !(props.author && dids?.includes(props.author)),
    [dids, props.author],
  )

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
          title={isNewWorkgroup ? 'New workgroup' : 'Basic information'}
        >
          <Grid6>
            <GridItem6>
              <FormItem
                label="Name"
                error={errors.workgroups?.[workgroupIndex]?.name?.message}
              >
                <TextInput
                  {...register(`workgroups.${workgroupIndex}.name`)}
                  error={!!errors.workgroups?.[workgroupIndex]?.name?.message}
                  disabled={disabled}
                />
              </FormItem>
            </GridItem6>
            <GridItem6>
              <FormItem
                label="Introduction"
                error={
                  errors.workgroups?.[workgroupIndex]?.extension?.introduction
                    ?.message
                }
              >
                <TextInput
                  {...register(
                    `workgroups.${workgroupIndex}.extension.introduction`,
                  )}
                  error={
                    !!errors.workgroups?.[workgroupIndex]?.extension
                      ?.introduction?.message
                  }
                  disabled={disabled}
                />
              </FormItem>
            </GridItem6>
          </Grid6>
        </FormSection>
        <FormSection
          title="Proposers"
          description="Defines who has rights to propose"
        >
          <Grid6>
            <GridItem6>
              <FormItem
                error={
                  errors.workgroups?.[workgroupIndex]?.permission?.proposing
                    ?.operands?.message
                }
              >
                <FormProvider {...methods}>
                  <BooleanSetsBlock
                    name="proposing"
                    entry={props.author}
                    workgroupIndex={workgroupIndex}
                    disabled={disabled}
                  />
                </FormProvider>
              </FormItem>
            </GridItem6>
          </Grid6>
        </FormSection>
        <FormSection
          title="Voters"
          description="Defines who has power of voting"
        >
          <Grid6>
            <GridItem6>
              <FormItem
                error={
                  errors?.workgroups?.[workgroupIndex]?.permission?.voting
                    ?.operands?.message
                }
              >
                <FormProvider {...methods}>
                  <DecimalSetsBlock
                    name="voting"
                    entry={props.author}
                    workgroupIndex={workgroupIndex}
                    disabled={disabled}
                  />
                </FormProvider>
              </FormItem>
            </GridItem6>
          </Grid6>
        </FormSection>
        <FormSection title="Rules">
          <Grid6>
            <GridItem3>
              <FormItem
                label="Duration of announcement"
                error={
                  errors?.workgroups?.[workgroupIndex]?.duration?.announcement
                    ?.message
                }
              >
                <Controller
                  control={control}
                  name={`workgroups.${workgroupIndex}.duration.announcement`}
                  render={({ field: { value, onChange } }) => (
                    <DurationInput
                      value={value}
                      onChange={onChange}
                      disabled={disabled}
                      error={
                        !!errors?.workgroups?.[workgroupIndex]?.duration
                          ?.announcement
                      }
                    />
                  )}
                />
              </FormItem>
            </GridItem3>
            <GridItem3>
              <FormItem
                label="Duration of voting"
                error={
                  errors?.workgroups?.[workgroupIndex]?.duration?.voting
                    ?.message
                }
              >
                <Controller
                  control={control}
                  name={`workgroups.${workgroupIndex}.duration.voting`}
                  render={({ field: { value, onChange } }) => (
                    <DurationInput
                      value={value}
                      onChange={onChange}
                      disabled={disabled}
                      error={
                        !!errors?.workgroups?.[workgroupIndex]?.duration?.voting
                      }
                    />
                  )}
                />
              </FormItem>
            </GridItem3>
            <GridItem6>
              <FormItem
                label="Terms and conditions"
                description={
                  <PreviewMarkdown>
                    {watch(
                      `workgroups.${workgroupIndex}.extension.terms_and_conditions`,
                    )}
                  </PreviewMarkdown>
                }
                error={
                  errors?.workgroups?.[workgroupIndex]?.extension
                    ?.terms_and_conditions?.message
                }
              >
                <Textarea
                  disabled={disabled}
                  {...register(
                    `workgroups.${workgroupIndex}.extension.terms_and_conditions`,
                  )}
                  error={
                    !!errors?.workgroups?.[workgroupIndex]?.extension
                      ?.terms_and_conditions?.message
                  }
                />
              </FormItem>
            </GridItem6>
          </Grid6>
        </FormSection>
        {disabled ? null : (
          <FormFooter>
            <Button
              primary
              icon={isNewWorkgroup ? PlusIcon : ArrowPathIcon}
              loading={handleSubmit.isLoading}
              onClick={onSubmit(
                (value) => handleSubmit.mutate(value),
                console.error,
              )}
            >
              {isNewWorkgroup ? 'Create' : 'Update'}
            </Button>
            {isNewWorkgroup ? null : (
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
        )}
      </Form>
    </>
  )
}
