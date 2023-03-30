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
import { ArchiveBoxIcon, EyeIcon } from '@heroicons/react/20/solid'
import { useMutation } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'

import { Community, communitySchema } from '../utils/schemas/community'
import DurationInput from './basic/duration-input'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import BooleanSetsBlock from './boolean-sets-block'
import DecimalSetsBlock from './decimal-sets-block'
import { Form, FormFooter, FormSection, FormItem } from './basic/form'
import { Grid6, GridItem3, GridItem6 } from './basic/grid'
import Button from './basic/button'
import useSignDocument from '../hooks/use-sign-document'
import { trpc } from '../utils/trpc'
import Notification from './basic/notification'
import useIsManager from '../hooks/use-is-manager'
import { Workgroup } from '../utils/schemas/group'
import { previewCommunityAtom } from '../utils/atoms'
import { Preview } from '../utils/types'

export default function WorkgroupForm(props: {
  author: string
  initialValue?: Community
  group?: string
  onArchive?: () => void
  preview: Preview
  className?: string
}) {
  const { onArchive } = props
  const router = useRouter()
  const [previewCommunity, setPreviewCommunity] = useAtom(previewCommunityAtom)
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
    reset(previewCommunity || props.initialValue)
  }, [previewCommunity, props.initialValue, reset])
  const isNewGroup = !props.onArchive
  const signDocument = useSignDocument(
    props.author,
    `You are archiving workgroup on Voty\n\nhash:\n{sha256}`,
  )
  const { mutateAsync } = trpc.community.create.useMutation()
  const handleArchive = useMutation<void, Error, Community>(
    async (community) => {
      const signed = await signDocument({
        ...community,
        groups: community.groups?.filter(({ id }) => id !== props.group),
      })
      if (signed) {
        await mutateAsync(signed)
        onArchive?.()
      }
    },
  )
  const isManager = useIsManager(props.author)
  const groupErrors = errors.groups?.[groupIndex] as Merge<
    FieldError,
    FieldErrorsImpl<NonNullable<Workgroup>>
  >

  return (
    <>
      <Notification show={handleArchive.isError}>
        {handleArchive.error?.message}
      </Notification>
      <Form
        title={`${isNewGroup ? 'New' : 'Edit'} workgroup of ${props.author}`}
        className={props.className}
      >
        <FormSection>
          <Grid6>
            <GridItem6>
              <FormItem
                label="Workgroup name"
                error={groupErrors?.name?.message}
              >
                <TextInput
                  {...register(`groups.${groupIndex}.name`)}
                  placeholder="e.g. Marketing Team"
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
                  placeholder="e.g. A group of marketing specialists responsible for planning, creating, and monitoring marketing activities"
                  error={!!groupErrors?.extension?.introduction?.message}
                  disabled={!isManager}
                />
              </FormItem>
            </GridItem6>
          </Grid6>
        </FormSection>
        <FormSection
          title="Proposers"
          description="SubDIDs who can initiate proposals in this workgroup"
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
          title="Voters"
          description="SubDIDs who can vote in this workgroup. You can create multiple voter group"
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
        <FormSection title="Rules">
          <Grid6>
            <GridItem3>
              <FormItem
                label="Proposal publicity phase"
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
            </GridItem3>
            <GridItem3>
              <FormItem
                label="Voting phase"
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
            </GridItem3>
            <GridItem6>
              <FormItem
                label="The criteria for proposal approval"
                description="Markdown is supported"
                error={groupErrors?.extension?.terms_and_conditions?.message}
              >
                <Textarea
                  disabled={!isManager}
                  {...register(
                    `groups.${groupIndex}.extension.terms_and_conditions`,
                  )}
                  error={
                    !!groupErrors?.extension?.terms_and_conditions?.message
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
              icon={EyeIcon}
              onClick={onSubmit((value) => {
                setPreviewCommunity({ ...value, preview: props.preview })
                router.push(props.preview.to)
              }, console.error)}
            >
              Preview
            </Button>
            {isNewGroup ? null : (
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
