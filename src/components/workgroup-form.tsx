import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import dynamic from 'next/dynamic'
import {
  DocumentArrowUpIcon,
  DocumentPlusIcon,
} from '@heroicons/react/20/solid'

import { Community, communitySchema } from '../utils/schemas/community'
import { Authorized } from '../utils/schemas/authorship'
import DurationInput from './basic/duration-input'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import BooleanSetsBlock from './boolean-sets-block'
import NumberSetsBlock from './number-sets-block'
import { Form, FormFooter, FormSection, FormItem } from './basic/form'
import { Grid6, GridItem2, GridItem6 } from './basic/grid'

const SigningCommunityButton = dynamic(
  () => import('./signing/signing-community-button'),
  { ssr: false },
)

const defaultAnnouncementDuration = 3600

const defaultVotingDuration = 86400

export default function WorkgroupForm(props: {
  community: Authorized<Community>
  workgroup: string
  onSuccess: () => void
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
    formState: { errors },
  } = methods
  const { append } = useFieldArray({
    control,
    name: 'workgroups',
  })
  useEffect(() => {
    reset(props.community)
  }, [props.community, reset])
  const workgroupIndex = useMemo(() => {
    const index = props.community?.workgroups?.findIndex(
      (g) => g.extension.id === props.workgroup,
    )
    if (index === undefined) {
      return props.community?.workgroups?.length || 0
    }
    return index
  }, [props.community?.workgroups, props.workgroup])
  const isNewWorkgroup = useMemo(
    () =>
      !props.community?.workgroups?.find(
        (g) => g.extension.id === props.workgroup,
      ),
    [props.community.workgroups, props.workgroup],
  )
  useEffect(() => {
    if (isNewWorkgroup) {
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
        duration: {
          announcement: defaultAnnouncementDuration,
          voting: defaultVotingDuration,
        },
        extension: {
          id: props.workgroup,
          terms_and_conditions: '',
        },
      })
    }
  }, [append, isNewWorkgroup, props.workgroup])

  return (
    <Form className={props.className}>
      <FormSection
        title={isNewWorkgroup ? 'New workgroup' : 'Profile'}
        description="Basic information of the group."
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
              label="About"
              description="Styling with Markdown is supported"
              error={
                errors.workgroups?.[workgroupIndex]?.extension?.about?.message
              }
            >
              <Textarea
                {...register(`workgroups.${workgroupIndex}.extension.about`)}
                error={
                  !!errors.workgroups?.[workgroupIndex]?.extension?.about
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
        description="Filters for proposal validation."
      >
        <Grid6>
          <GridItem6>
            <FormItem
              error={
                errors.workgroups?.[workgroupIndex]?.permission?.proposing
                  ? JSON.stringify(
                      errors.workgroups?.[workgroupIndex]?.permission
                        ?.proposing,
                    )
                  : undefined
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
      <FormSection
        title="Voters"
        description="Voting power is calculated as maximum."
      >
        <Grid6>
          <GridItem6>
            <FormItem
              error={
                errors?.workgroups?.[workgroupIndex]?.permission?.voting
                  ? JSON.stringify(
                      errors?.workgroups?.[workgroupIndex]?.permission?.voting,
                    )
                  : undefined
              }
            >
              <FormProvider {...methods}>
                <NumberSetsBlock
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
      <FormSection title="Rules" description="Schedule, terms and conditions.">
        <Grid6>
          <GridItem2>
            <FormItem
              label="Duration of announcement"
              error={
                errors?.workgroups?.[workgroupIndex]?.duration?.announcement
                  ?.message
              }
            >
              <Controller
                defaultValue={defaultAnnouncementDuration}
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
          </GridItem2>
          <GridItem2>
            <FormItem
              label="Duration of voting"
              error={
                errors?.workgroups?.[workgroupIndex]?.duration?.voting?.message
              }
            >
              <Controller
                defaultValue={defaultVotingDuration}
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
          </GridItem2>
          <GridItem6>
            <FormItem
              label="Terms and conditions"
              description="Styling with Markdown is supported"
              error={
                errors?.workgroups?.[workgroupIndex]?.extension
                  ?.terms_and_conditions?.message
              }
            >
              <Textarea
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
      <FormFooter>
        <FormProvider {...methods}>
          <SigningCommunityButton
            did={props.community.authorship.author}
            icon={isNewWorkgroup ? DocumentPlusIcon : DocumentArrowUpIcon}
            onSuccess={onSuccess}
            disabled={props.disabled}
          >
            {isNewWorkgroup ? 'Create' : 'Update'}
          </SigningCommunityButton>
        </FormProvider>
      </FormFooter>
    </Form>
  )
}
