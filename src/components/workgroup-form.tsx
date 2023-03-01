import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import dynamic from 'next/dynamic'
import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  PlusIcon,
} from '@heroicons/react/20/solid'

import { Community, communitySchema } from '../utils/schemas/community'
import { Authorized } from '../utils/schemas/authorship'
import DurationInput from './basic/duration-input'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import BooleanSetsBlock from './boolean-sets-block'
import DecimalSetsBlock from './decimal-sets-block'
import { Form, FormFooter, FormSection, FormItem } from './basic/form'
import { Grid6, GridItem3, GridItem6 } from './basic/grid'
import PreviewMarkdown from './preview-markdown'

const SigningCommunityButton = dynamic(
  () => import('./signing/signing-community-button'),
  { ssr: false },
)

const defaultDuration = 86400

export default function WorkgroupForm(props: {
  community: Authorized<Community>
  workgroup: string
  onSuccess: (workgroup?: string) => void
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
    formState: { errors },
  } = methods
  const { update } = useFieldArray({ control, name: 'workgroups' })
  useEffect(() => {
    reset(props.community)
  }, [props.community, reset])
  const workgroupIndex = useMemo(() => {
    const index = props.community?.workgroups?.findIndex(
      ({ id }) => id === props.workgroup,
    )
    if (index === undefined || index === -1) {
      return props.community?.workgroups?.length || 0
    }
    return index
  }, [props.community?.workgroups, props.workgroup])
  const isNewWorkgroup = useMemo(
    () => !props.community?.workgroups?.[workgroupIndex],
    [props.community?.workgroups, workgroupIndex],
  )
  useEffect(() => {
    if (isNewWorkgroup) {
      update(workgroupIndex, {
        id: props.workgroup,
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
        duration: {
          announcement: defaultDuration,
          voting: defaultDuration,
        },
        extension: {
          terms_and_conditions: '',
        },
      })
    }
  }, [isNewWorkgroup, props.workgroup, update, workgroupIndex])
  const handleArchiveSuccess = useCallback(() => {
    onSuccess()
  }, [onSuccess])
  const handleSuccess = useCallback(() => {
    onSuccess(props.workgroup)
  }, [onSuccess, props.workgroup])

  return (
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
                disabled={props.disabled}
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
                  !!errors.workgroups?.[workgroupIndex]?.extension?.introduction
                    ?.message
                }
                disabled={props.disabled}
              />
            </FormItem>
          </GridItem6>
        </Grid6>
      </FormSection>
      <FormSection title="Proposers">
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
                  entry={props.community.authorship.author}
                  workgroupIndex={workgroupIndex}
                  disabled={props.disabled}
                />
              </FormProvider>
            </FormItem>
          </GridItem6>
        </Grid6>
      </FormSection>
      <FormSection title="Voters">
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
                  entry={props.community.authorship.author}
                  workgroupIndex={workgroupIndex}
                  disabled={props.disabled}
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
                defaultValue={defaultDuration}
                control={control}
                name={`workgroups.${workgroupIndex}.duration.announcement`}
                render={({ field: { value, onChange } }) => (
                  <DurationInput
                    value={value}
                    onChange={onChange}
                    disabled={props.disabled}
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
                errors?.workgroups?.[workgroupIndex]?.duration?.voting?.message
              }
            >
              <Controller
                defaultValue={defaultDuration}
                control={control}
                name={`workgroups.${workgroupIndex}.duration.voting`}
                render={({ field: { value, onChange } }) => (
                  <DurationInput
                    value={value}
                    onChange={onChange}
                    disabled={props.disabled}
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
                disabled={props.disabled}
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
      {props.disabled ? null : (
        <FormFooter>
          <FormProvider {...methods}>
            <SigningCommunityButton
              did={props.community.authorship.author}
              icon={isNewWorkgroup ? PlusIcon : ArrowPathIcon}
              onSuccess={handleSuccess}
            >
              {isNewWorkgroup ? 'Create' : 'Update'}
            </SigningCommunityButton>
          </FormProvider>
          {isNewWorkgroup ? null : (
            <FormProvider {...methods}>
              <SigningCommunityButton
                archive={props.workgroup}
                did={props.community.authorship.author}
                icon={ArchiveBoxIcon}
                onSuccess={handleArchiveSuccess}
              >
                Archive
              </SigningCommunityButton>
            </FormProvider>
          )}
        </FormFooter>
      )}
    </Form>
  )
}
