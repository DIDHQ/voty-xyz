import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { EyeIcon } from '@heroicons/react/20/solid'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'

import PhaseInput from './basic/phase-input'
import TextInput from './basic/text-input'
import { Form, FormFooter, FormSection, FormItem } from './basic/form'
import { Grid6, GridItem2, GridItem3, GridItem6 } from './basic/grid'
import Button from './basic/button'
import { trpc } from '../utils/trpc'
import useIsManager from '../hooks/use-is-manager'
import { Grant, grantSchema } from '../utils/schemas/grant'
import { previewGrantAtom } from '../utils/atoms'
import { Preview } from '../utils/types'
import Textarea from './basic/textarea'

export default function GrantForm(props: {
  communityId: string
  initialValue: Partial<Grant> | null
  preview: Preview
  className?: string
}) {
  const router = useRouter()
  const { data: community } = trpc.community.getById.useQuery(
    { id: props.communityId },
    { enabled: !!props.communityId },
  )
  const [previewGrant, setPreviewGrant] = useAtom(previewGrantAtom)
  const grant = previewGrant || props.initialValue || undefined
  const methods = useForm<Grant>({
    resolver: zodResolver(grantSchema),
  })
  const {
    control,
    register,
    reset,
    formState: { errors },
    handleSubmit: onSubmit,
  } = methods
  useEffect(() => {
    reset(grant)
  }, [grant, reset])
  const isManager = useIsManager(props.communityId)
  const disabled = !isManager

  return (
    <Form
      title={`Create grant${community?.name ? ` of ${community.name}` : ''}`}
      className={props.className}
    >
      <FormSection title="Basic information">
        <Grid6>
          <GridItem6>
            <FormItem label="Grant name" error={errors.name?.message}>
              <TextInput
                {...register('name')}
                placeholder="e.g. Hackathon"
                error={!!errors.name?.message}
                disabled={disabled}
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem
              label="Introduction"
              optional
              description="The purpose of this grant. Markdown is supported"
              error={errors.extension?.introduction?.message}
            >
              <Textarea
                {...register('extension.introduction')}
                error={!!errors.extension?.introduction?.message}
                disabled={disabled}
              />
            </FormItem>
          </GridItem6>
        </Grid6>
      </FormSection>
      <FormSection title="Rules">
        <Grid6>
          <GridItem2>
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
          </GridItem2>
          <GridItem2>
            <FormItem
              label="Proposing phase"
              error={errors.duration?.proposing?.message}
            >
              <Controller
                control={control}
                name="duration.proposing"
                render={({ field: { ref, value, onChange } }) => (
                  <PhaseInput
                    inputRef={ref}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    error={!!errors.duration?.proposing}
                  />
                )}
              />
            </FormItem>
          </GridItem2>
          <GridItem2>
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
          </GridItem2>
          <GridItem3>
            <FormItem
              label="Funding"
              error={
                errors?.extension?.funding?.[0]?.[0]?.message ||
                errors?.extension?.funding?.[0]?.[1]?.message
              }
            >
              <div className="flex w-full items-center space-x-2">
                <TextInput
                  disabled={disabled}
                  {...register('extension.funding.0.0')}
                  error={!!errors?.extension?.funding?.[0]?.[0]}
                  placeholder="prize"
                  className="w-0 flex-1"
                />{' '}
                <span className="text-gray-400">X</span>
                <Controller
                  control={control}
                  name="extension.funding.0.1"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      disabled={disabled}
                      type="number"
                      value={value || ''}
                      onChange={(e) => onChange(e.target.valueAsNumber)}
                      error={!!errors?.extension?.funding?.[0]?.[1]}
                      placeholder="count"
                      className="shrink-0 basis-16"
                    />
                  )}
                />
              </div>
            </FormItem>
          </GridItem3>
        </Grid6>
      </FormSection>
      {isManager ? (
        <FormFooter>
          <Button
            primary
            icon={EyeIcon}
            onClick={onSubmit((value) => {
              setPreviewGrant({
                ...value,
                preview: props.preview,
              })
              router.push(props.preview.to)
            }, console.error)}
          >
            Preview
          </Button>
        </FormFooter>
      ) : null}
    </Form>
  )
}
