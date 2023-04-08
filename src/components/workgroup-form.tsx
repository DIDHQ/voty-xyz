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
import PhaseInput from './basic/phase-input'
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
import { Group } from '../utils/schemas/group'
import { previewCommunityAtom } from '../utils/atoms'
import { Preview } from '../utils/types'

export default function WorkgroupForm(props: {
  author: string
  initialValue: Community | null
  group: string
  onArchive?: () => void
  preview: Preview & { group: string }
  className?: string
}) {
  const { onArchive } = props
  const router = useRouter()
  const { data } = trpc.community.getByEntry.useQuery({
    entry: props.author,
  })
  const [previewCommunity, setPreviewCommunity] = useAtom(previewCommunityAtom)
  const community = previewCommunity || data
  const methods = useForm<Community>({
    resolver: zodResolver(communitySchema),
  })
  const {
    control,
    register,
    reset,
    setValue,
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
    reset(community || props.initialValue || undefined)
    if (props.group) {
      setValue(`groups.${groupIndex}.id`, props.group)
    }
  }, [groupIndex, community, props.group, props.initialValue, reset, setValue])
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
      await mutateAsync(signed)
      onArchive?.()
    },
  )
  const isManager = useIsManager(props.author)
  const groupErrors = errors.groups?.[groupIndex] as Merge<
    FieldError,
    FieldErrorsImpl<NonNullable<Group>>
  >

  return (
    <>
      <Notification type="error" show={handleArchive.isError}>
        {handleArchive.error?.message}
      </Notification>
      <Form
        title={`${isNewGroup ? 'Create' : 'Edit'} workgroup${
          community?.name ? ` of ${community.name}` : ''
        }`}
        className={props.className}
      >
        <FormSection title="Basic information">
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
                description="The propose of this workgroup"
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
          description="SubDIDs who can vote in this workgroup. You can create multiple voter groups with different voting power assigned to each group"
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
                label="Announcing phase"
                error={groupErrors?.phase?.announcing?.message}
              >
                <Controller
                  control={control}
                  name={`groups.${groupIndex}.phase.announcing`}
                  render={({ field: { value, onChange } }) => (
                    <PhaseInput
                      value={value}
                      onChange={onChange}
                      disabled={!isManager}
                      error={!!groupErrors?.phase?.announcing}
                    />
                  )}
                />
              </FormItem>
            </GridItem3>
            <GridItem3>
              <FormItem
                label="Voting phase"
                error={groupErrors?.phase?.voting?.message}
              >
                <Controller
                  control={control}
                  name={`groups.${groupIndex}.phase.voting`}
                  render={({ field: { value, onChange } }) => (
                    <PhaseInput
                      value={value}
                      onChange={onChange}
                      disabled={!isManager}
                      error={!!groupErrors?.phase?.voting}
                    />
                  )}
                />
              </FormItem>
            </GridItem3>
            <GridItem6>
              <FormItem
                label="Criteria for approval"
                description="Markdown is supported"
                error={groupErrors?.extension?.criteria_for_approval?.message}
              >
                <Textarea
                  disabled={!isManager}
                  {...register(
                    `groups.${groupIndex}.extension.criteria_for_approval`,
                  )}
                  error={
                    !!groupErrors?.extension?.criteria_for_approval?.message
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
                setPreviewCommunity({
                  ...value,
                  preview: props.preview,
                })
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
