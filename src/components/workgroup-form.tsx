import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  PlusIcon,
} from '@heroicons/react/20/solid'

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

const defaultDuration = 86400

export default function WorkgroupForm(props: {
  initialValue?: Community
  entry: string
  workgroup: string
  onSubmit: (value: Community) => void
  isLoading: boolean
  onArchive?: (value: Community) => void
  isArchiving?: boolean
  disabled?: boolean
  className?: string
}) {
  const methods = useForm<Community>({
    resolver: zodResolver(communitySchema),
  })
  const {
    control,
    register,
    reset,
    watch,
    formState: { errors },
    handleSubmit,
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
                  entry={props.entry}
                  workgroupIndex={workgroupIndex}
                  disabled={props.disabled}
                />
              </FormProvider>
            </FormItem>
          </GridItem6>
        </Grid6>
      </FormSection>
      <FormSection title="Voters" description="Defines who has power of voting">
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
                  entry={props.entry}
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
          <Button
            primary
            icon={isNewWorkgroup ? PlusIcon : ArrowPathIcon}
            loading={props.isLoading}
            onClick={handleSubmit(props.onSubmit)}
          >
            {isNewWorkgroup ? 'Create' : 'Update'}
          </Button>
          {isNewWorkgroup || !props.onArchive ? null : (
            <Button
              icon={ArchiveBoxIcon}
              loading={props.isArchiving}
              onClick={handleSubmit(props.onArchive)}
            >
              Archive
            </Button>
          )}
        </FormFooter>
      )}
    </Form>
  )
}
