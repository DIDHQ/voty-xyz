import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { ArchiveBoxIcon, EyeIcon } from '@heroicons/react/20/solid'
import { useMutation } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'

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
import { Group, groupSchema } from '../utils/schemas/group'
import { previewGroupAtom } from '../utils/atoms'
import { Preview } from '../utils/types'

export default function GroupForm(props: {
  communityId: string
  initialValue: Group | null
  onArchive?: () => void
  preview: Preview
  className?: string
}) {
  const { onArchive } = props
  const router = useRouter()
  const { data } = trpc.group.getById.useQuery(
    { communityId: props.communityId, id: props.initialValue?.id },
    { enabled: !!props.communityId && !!props.initialValue?.id },
  )
  const { data: community } = trpc.community.getById.useQuery(
    { id: props.communityId },
    { enabled: !!props.communityId },
  )
  const [previewGroup, setPreviewGroup] = useAtom(previewGroupAtom)
  const group = previewGroup || props.initialValue || data || undefined
  const methods = useForm<Group>({
    resolver: zodResolver(groupSchema),
  })
  const {
    control,
    register,
    reset,
    formState: { errors },
    handleSubmit: onSubmit,
  } = methods
  useEffect(() => {
    reset(group)
  }, [group, reset])
  const isNewGroup = !props.onArchive
  const signDocument = useSignDocument(
    props.communityId,
    `You are archiving workgroup on Voty\n\nhash:\n{sha256}`,
  )
  const { mutateAsync } = trpc.group.archive.useMutation()
  const handleArchive = useMutation<void, Error, Group>(async (group) => {
    const signed = await signDocument(group)
    await mutateAsync(signed)
  })
  const isManager = useIsManager(props.communityId)
  const disabled = !isManager
  useEffect(() => {
    if (handleArchive.isSuccess) {
      onArchive?.()
    }
  }, [handleArchive.isSuccess, onArchive])

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
              <FormItem label="Workgroup name" error={errors.name?.message}>
                <TextInput
                  {...register('name')}
                  placeholder="e.g. Marketing Team"
                  error={!!errors.name?.message}
                  disabled={disabled}
                />
              </FormItem>
            </GridItem6>
            <GridItem6>
              <FormItem
                label="Introduction"
                optional
                description="The purpose of this workgroup"
                error={errors.extension?.introduction?.message}
              >
                <TextInput
                  {...register('extension.introduction')}
                  error={!!errors.extension?.introduction?.message}
                  disabled={disabled}
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
              <FormItem error={errors.permission?.proposing?.operands?.message}>
                <FormProvider {...methods}>
                  <BooleanSetsBlock
                    name="proposing"
                    communityId={props.communityId}
                    disabled={disabled}
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
              <FormItem error={errors.permission?.voting?.operands?.message}>
                <FormProvider {...methods}>
                  <DecimalSetsBlock
                    name="voting"
                    communityId={props.communityId}
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
                label="Announcing phase"
                error={errors.duration?.announcing?.message}
              >
                <Controller
                  control={control}
                  name="duration.announcing"
                  render={({ field: { ref, value, onChange } }) => (
                    <PhaseInput
                      inputRef={ref}
                      value={value}
                      onChange={onChange}
                      disabled={disabled}
                      error={!!errors.duration?.announcing}
                    />
                  )}
                />
              </FormItem>
            </GridItem3>
            <GridItem3>
              <FormItem
                label="Voting phase"
                error={errors.duration?.voting?.message}
              >
                <Controller
                  control={control}
                  name="duration.voting"
                  render={({ field: { ref, value, onChange } }) => (
                    <PhaseInput
                      inputRef={ref}
                      value={value}
                      onChange={onChange}
                      disabled={disabled}
                      error={!!errors.duration?.voting}
                    />
                  )}
                />
              </FormItem>
            </GridItem3>
            <GridItem6>
              <FormItem
                label="Criteria for approval"
                description="Markdown is supported"
                error={errors.extension?.terms_and_conditions?.message}
              >
                <Textarea
                  disabled={disabled}
                  {...register('extension.terms_and_conditions')}
                  error={!!errors.extension?.terms_and_conditions?.message}
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
                setPreviewGroup({
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
