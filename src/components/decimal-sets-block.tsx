import clsx from 'clsx'
import { compact } from 'lodash-es'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'

import { Community } from '../utils/schemas/community'
import { FormItem } from './basic/form'
import { Grid6, GridItem6 } from './basic/grid'
import RadioGroup from './basic/radio-group'
import TextButton from './basic/text-button'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'

export default function DecimalSetsBlock(props: {
  name: 'voting'
  entry: string
  groupIndex: number
  disabled?: boolean
}) {
  const { watch, control } = useFormContext<Community>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `groups.${props.groupIndex}.permission.${props.name}.operands`,
  })
  const [open, setOpen] = useState<number | undefined>(0)
  const operands = watch(
    `groups.${props.groupIndex}.permission.${props.name}.operands`,
    fields,
  )

  return (
    <>
      {operands.length ? (
        <ul
          role="list"
          className="divide-y divide-gray-200 overflow-hidden rounded-md border border-gray-200"
        >
          {operands.map((operand, index) => (
            <DecimalUnitBlock
              key={
                'id' in operand && typeof operand.id === 'string'
                  ? operand.id
                  : index
              }
              name={props.name}
              entry={props.entry}
              groupIndex={props.groupIndex}
              index={index}
              open={open === index}
              setOpen={setOpen}
              onRemove={remove}
              disabled={props.disabled}
            />
          ))}
        </ul>
      ) : null}
      {props.disabled ? null : (
        <TextButton
          secondary
          onClick={() => {
            append({
              function: 'prefixes_dot_suffix_fixed_power',
              arguments: [props.entry, [''], '1'],
            })
            setOpen(operands.length)
          }}
          className="mt-1"
        >
          Add
        </TextButton>
      )}
    </>
  )
}

function DecimalUnitBlock(props: {
  name: 'voting'
  entry: string
  groupIndex: number
  index: number
  open: boolean
  setOpen(index?: number): void
  onRemove(index: number): void
  disabled?: boolean
}) {
  const {
    control,
    watch,
    register,
    formState: { errors },
  } = useFormContext<Community>()
  const { setOpen, onRemove } = props
  const handleOpen = useCallback(() => {
    setOpen(props.open ? undefined : props.index)
  }, [setOpen, props.open, props.index])
  const handleRemove = useCallback(() => {
    onRemove(props.index)
  }, [onRemove, props.index])
  useEffect(() => {
    if (
      errors.groups?.[props.groupIndex]?.permission?.[props.name]?.operands?.[
        props.index
      ]
    ) {
      setOpen(props.index)
    }
  }, [errors.groups, props.index, props.name, props.groupIndex, setOpen])
  const suffix =
    watch(
      `groups.${props.groupIndex}.permission.${props.name}.operands.${props.index}.arguments.0`,
    ) || ''
  const regex = new RegExp(`\\.${suffix.replaceAll('.', '\\.')}\$`)

  return (
    <>
      <li
        className={clsx(
          'flex items-center justify-between px-4 py-3 text-sm',
          props.open ? 'bg-gray-50' : undefined,
        )}
      >
        <div className="flex w-0 flex-1 items-center">
          <span className="w-0 flex-1 truncate">
            {watch(
              `groups.${props.groupIndex}.permission.${props.name}.operands.${props.index}.name`,
            ) || `Filter ${props.index + 1}`}
          </span>
        </div>
        <div className="ml-4 flex shrink-0 space-x-4">
          <TextButton secondary onClick={handleOpen}>
            {props.open ? 'Hide' : props.disabled ? 'View' : 'Edit'}
          </TextButton>
          {props.disabled ? null : (
            <>
              <span className="text-gray-300" aria-hidden="true">
                |
              </span>
              <TextButton secondary onClick={handleRemove}>
                Remove
              </TextButton>
            </>
          )}
        </div>
      </li>
      {props.open ? (
        <Grid6 className="p-6">
          <GridItem6>
            <FormItem
              label="Voter group name"
              error={
                errors.groups?.[props.groupIndex]?.permission?.[props.name]
                  ?.operands?.[props.index]?.name?.message
              }
            >
              <TextInput
                disabled={props.disabled}
                {...register(
                  `groups.${props.groupIndex}.permission.${props.name}.operands.${props.index}.name`,
                )}
                error={
                  !!errors.groups?.[props.groupIndex]?.permission?.[props.name]
                    ?.operands?.[props.index]?.name?.message
                }
                placeholder={`Filter ${props.index + 1}`}
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem
              label="Voting power"
              description="Each SubDID in this voter group has an equal voting power"
              error={
                errors.groups?.[props.groupIndex]?.permission?.[props.name]
                  ?.operands?.[props.index]?.arguments?.[2]?.message
              }
            >
              <TextInput
                disabled={props.disabled}
                {...register(
                  `groups.${props.groupIndex}.permission.${props.name}.operands.${props.index}.arguments.2`,
                )}
                error={
                  !!errors.groups?.[props.groupIndex]?.permission?.[props.name]
                    ?.operands?.[props.index]?.arguments?.[2]?.message
                }
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem label="Voter group members">
              <Controller
                control={control}
                name={`groups.${props.groupIndex}.permission.${props.name}.operands.${props.index}.arguments.1`}
                render={({ field: { value, onChange } }) => (
                  <RadioGroup
                    disabled={props.disabled}
                    options={[
                      {
                        value: 'allowlist',
                        name: `Some of ${suffix}'s SubDIDs`,
                      },
                      {
                        value: 'all',
                        name: `All of ${suffix}'s SubDIDs`,
                      },
                    ]}
                    value={value.length ? 'allowlist' : 'all'}
                    onChange={(v) => onChange(v === 'allowlist' ? [''] : [])}
                  />
                )}
              />
            </FormItem>
          </GridItem6>
          {watch(
            `groups.${props.groupIndex}.permission.${props.name}.operands.${props.index}.arguments.1`,
          )?.length ? (
            <GridItem6>
              <FormItem
                error={
                  errors.groups?.[props.groupIndex]?.permission?.[props.name]
                    ?.operands?.[props.index]?.arguments?.[1]?.message ||
                  errors.groups?.[props.groupIndex]?.permission?.[props.name]
                    ?.operands?.[props.index]?.arguments?.[1]?.[0]?.message
                }
              >
                <Controller
                  control={control}
                  name={`groups.${props.groupIndex}.permission.${props.name}.operands.${props.index}.arguments.1`}
                  render={({ field: { value, onChange } }) => (
                    <Textarea
                      autoCorrect="false"
                      autoCapitalize="false"
                      autoComplete="false"
                      disabled={props.disabled}
                      placeholder={`e.g.\nsatoshi.${suffix}\nvitalik.${suffix}`}
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
                        !!errors.groups?.[props.groupIndex]?.permission?.[
                          props.name
                        ]?.operands?.[props.index]?.arguments?.[1]?.message ||
                        !!errors.groups?.[props.groupIndex]?.permission?.[
                          props.name
                        ]?.operands?.[props.index]?.arguments?.[1]?.[0]?.message
                      }
                    />
                  )}
                />
              </FormItem>
            </GridItem6>
          ) : null}
        </Grid6>
      ) : null}
    </>
  )
}
