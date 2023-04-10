import clsx from 'clsx'
import { compact } from 'lodash-es'
import { useCallback, useEffect, useState } from 'react'
import {
  Controller,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Community } from '../utils/schemas/community'
import { decimalUnitSchema, DecimalUnit } from '../utils/schemas/sets'
import { FormItem } from './basic/form'
import { Grid6, GridItem6 } from './basic/grid'
import RadioGroup from './basic/radio-group'
import TextButton from './basic/text-button'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import Button from './basic/button'

export default function DecimalSetsBlock(props: {
  name: 'voting'
  entry: string
  groupIndex: number
  disabled?: boolean
}) {
  const { control } = useFormContext<Community>()
  const { fields, append, update, remove } = useFieldArray({
    control,
    name: `groups.${props.groupIndex}.permission.${props.name}.operands`,
  })
  const [open, setOpen] = useState<number | undefined>(0)

  return (
    <>
      {fields.length ? (
        <ul
          role="list"
          className="mb-4 divide-y divide-gray-200 overflow-hidden rounded-md border border-gray-200"
        >
          {fields.map((operand, index) => (
            <DecimalUnitBlock
              key={operand.id}
              index={index}
              open={open === index}
              setOpen={setOpen}
              value={operand}
              onChange={(v) => update(index, v)}
              onRemove={remove}
              disabled={props.disabled}
            />
          ))}
        </ul>
      ) : null}
      {props.disabled ? null : (
        <Button
          onClick={() => {
            append({
              function: 'prefixes_dot_suffix_fixed_power',
              arguments: [props.entry, [''], '1'],
            })
            setOpen(fields.length)
          }}
        >
          Add
        </Button>
      )}
    </>
  )
}

function DecimalUnitBlock(props: {
  index: number
  open: boolean
  setOpen(index?: number): void
  value: DecimalUnit
  onChange(value: DecimalUnit): void
  onRemove(index: number): void
  disabled?: boolean
}) {
  const {
    control,
    watch,
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm<DecimalUnit>({ resolver: zodResolver(decimalUnitSchema) })
  useEffect(() => {
    reset(props.value)
  }, [props.value, reset])
  const { setOpen, onRemove } = props
  const handleOpen = useCallback(() => {
    setOpen(props.open ? undefined : props.index)
  }, [setOpen, props.open, props.index])
  const handleRemove = useCallback(() => {
    setOpen(undefined)
    onRemove(props.index)
  }, [onRemove, props.index, setOpen])
  const suffix = watch('arguments.0') ?? ''
  const regex = new RegExp(`\\.${suffix.replaceAll('.', '\\.')}\$`)

  return (
    <>
      {props.open ? (
        <Grid6 className="px-6 py-4">
          <GridItem6>
            <FormItem label="Voter group name" error={errors.name?.message}>
              <TextInput
                disabled={props.disabled}
                {...register('name')}
                error={!!errors.name?.message}
                placeholder={`Group ${props.index + 1}`}
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem
              label="Voting power"
              description="Each SubDID in this voter group has an equal voting power"
              error={errors.arguments?.[2]?.message}
            >
              <TextInput
                disabled={props.disabled}
                {...register('arguments.2')}
                error={!!errors.arguments?.[2]?.message}
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem label="Voter group members">
              <Controller
                control={control}
                name="arguments.1"
                render={({ field: { value, onChange } }) => (
                  <RadioGroup
                    disabled={props.disabled}
                    options={[
                      {
                        value: 'all',
                        name: `All of ${suffix}'s SubDIDs`,
                      },
                      {
                        value: 'allowlist',
                        name: `Some of ${suffix}'s SubDIDs`,
                      },
                    ]}
                    value={value?.length ? 'allowlist' : 'all'}
                    onChange={(v) => onChange(v === 'allowlist' ? [''] : [])}
                  />
                )}
              />
            </FormItem>
          </GridItem6>
          {watch('arguments.1')?.length ? (
            <GridItem6>
              <FormItem
                error={
                  errors.arguments?.[1]?.message ||
                  errors.arguments?.[1]?.[0]?.message
                }
              >
                <Controller
                  control={control}
                  name="arguments.1"
                  render={({ field: { value, onChange } }) => (
                    <Textarea
                      autoCorrect="false"
                      autoCapitalize="false"
                      autoComplete="false"
                      disabled={props.disabled}
                      placeholder={`e.g.\nsatoshi.${suffix}\nvitalik.${suffix}`}
                      shadow={`.${suffix}`}
                      value={
                        Array.isArray(value)
                          ? (value as string[]).join('\n')
                          : ''
                      }
                      onChange={(e) => {
                        const array = e.target.value.split(/[\t\n, ]/)
                        onChange(array.length ? array : [''])
                      }}
                      onBlur={(e) => {
                        const array = compact(
                          e.target.value
                            .split('\n')
                            .map((line) => line.replace(regex, '').trim()),
                        )
                        onChange(array.length ? array : [''])
                      }}
                      error={
                        !!errors.arguments?.[1]?.message ||
                        !!errors.arguments?.[1]?.[0]?.message
                      }
                    />
                  )}
                />
              </FormItem>
            </GridItem6>
          ) : null}
        </Grid6>
      ) : null}
      <li
        className={clsx(
          'flex items-center justify-between px-6 py-4 text-sm',
          props.open ? 'bg-gray-50' : undefined,
        )}
      >
        <div className="flex w-0 flex-1 items-center">
          <span className="w-0 flex-1 truncate">
            {watch('name') || `Group ${props.index + 1}`}
          </span>
        </div>
        <div className="ml-6 flex shrink-0 space-x-6">
          {props.disabled || !props.open ? null : (
            <TextButton onClick={handleRemove}>Remove</TextButton>
          )}
          {props.open ? (
            <Button
              primary
              onClick={handleSubmit((value) => {
                props.onChange(value)
                setOpen(undefined)
              })}
            >
              {props.disabled ? 'Hide' : 'Done'}
            </Button>
          ) : (
            <Button onClick={handleOpen}>
              {props.disabled ? 'View' : 'Edit'}
            </Button>
          )}
        </div>
      </li>
    </>
  )
}
