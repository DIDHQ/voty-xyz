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

export default function BooleanSetsBlock(props: {
  name: 'proposing'
  entry: string
  workgroupIndex: number
  disabled?: boolean
}) {
  const { watch, control } = useFormContext<Community>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `workgroups.${props.workgroupIndex}.permission.${props.name}.operands`,
  })
  const [open, setOpen] = useState<number | undefined>(0)
  const operands = watch(
    `workgroups.${props.workgroupIndex}.permission.${props.name}.operands`,
    fields,
  )

  return (
    <>
      {operands.length ? (
        <ul
          role="list"
          className="divide-y divide-gray-200 overflow-hidden rounded border border-gray-200"
        >
          {operands.map((operand, index) => (
            <BooleanUnitBlock
              key={
                'id' in operand && typeof operand.id === 'string'
                  ? operand.id
                  : index
              }
              name={props.name}
              entry={props.entry}
              workgroupIndex={props.workgroupIndex}
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
              function: 'prefixes_dot_suffix_exact_match',
              arguments: [props.entry, ['']],
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

function BooleanUnitBlock(props: {
  name: 'proposing'
  entry: string
  workgroupIndex: number
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
      errors.workgroups?.[props.workgroupIndex]?.permission?.[props.name]
        ?.operands?.[props.index]
    ) {
      setOpen(props.index)
    }
  }, [
    errors.workgroups,
    props.index,
    props.name,
    props.workgroupIndex,
    setOpen,
  ])

  return (
    <>
      <li
        className={clsx(
          'flex items-center justify-between py-3 px-4 text-sm',
          props.open ? 'bg-gray-50' : undefined,
        )}
      >
        <div className="flex w-0 flex-1 items-center">
          <span className="w-0 flex-1 truncate">
            {watch(
              `workgroups.${props.workgroupIndex}.permission.${props.name}.operands.${props.index}.name`,
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
              label="Name"
              error={
                errors.workgroups?.[props.workgroupIndex]?.permission?.[
                  props.name
                ]?.operands?.[props.index]?.name?.message
              }
            >
              <TextInput
                disabled={props.disabled}
                {...register(
                  `workgroups.${props.workgroupIndex}.permission.${props.name}.operands.${props.index}.name`,
                )}
                error={
                  !!errors.workgroups?.[props.workgroupIndex]?.permission?.[
                    props.name
                  ]?.operands?.[props.index]?.name?.message
                }
                placeholder={`Filter ${props.index + 1}`}
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem
              label="Base on"
              error={
                errors.workgroups?.[props.workgroupIndex]?.permission?.[
                  props.name
                ]?.operands?.[props.index]?.arguments?.[0]?.message
              }
            >
              <Controller
                control={control}
                name={`workgroups.${props.workgroupIndex}.permission.${props.name}.operands.${props.index}.arguments.0`}
                render={({ field: { value, onChange } }) => (
                  <RadioGroup
                    disabled={props.disabled}
                    options={[
                      { value: props.entry, name: 'SubDID' },
                      { value: 'bit', name: '.bit' },
                    ]}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem
              label="Filter"
              error={
                errors.workgroups?.[props.workgroupIndex]?.permission?.[
                  props.name
                ]?.operands?.[props.index]?.arguments?.[1]?.message
              }
            >
              <Controller
                control={control}
                name={`workgroups.${props.workgroupIndex}.permission.${props.name}.operands.${props.index}.arguments.1`}
                render={({ field: { value, onChange } }) => (
                  <RadioGroup
                    disabled={props.disabled}
                    options={[
                      { value: 'allowlist', name: 'Allowlist' },
                      { value: 'all', name: 'All' },
                    ]}
                    value={value.length ? 'allowlist' : 'all'}
                    onChange={(v) => onChange(v === 'allowlist' ? [''] : [])}
                  />
                )}
              />
            </FormItem>
          </GridItem6>
          {watch(
            `workgroups.${props.workgroupIndex}.permission.${props.name}.operands.${props.index}.arguments.1`,
          )?.length ? (
            <GridItem6>
              <FormItem
                label="Allowlist"
                error={
                  errors.workgroups?.[props.workgroupIndex]?.permission?.[
                    props.name
                  ]?.operands?.[props.index]?.arguments?.[1]?.[0]?.message
                }
              >
                <Controller
                  control={control}
                  name={`workgroups.${props.workgroupIndex}.permission.${props.name}.operands.${props.index}.arguments.1`}
                  render={({ field: { value, onChange } }) => (
                    <Textarea
                      autoCorrect="false"
                      autoCapitalize="false"
                      autoComplete="false"
                      disabled={props.disabled}
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
                        const suffix = watch(
                          `workgroups.${props.workgroupIndex}.permission.${props.name}.operands.${props.index}.arguments.0`,
                        )
                        const regex = new RegExp(
                          `\\.${suffix.replaceAll('.', '\\.')}\$`,
                        )
                        const array = compact(
                          e.target.value
                            .split('\n')
                            .map((line) => line.replace(regex, '').trim()),
                        )
                        onChange(array.length ? array : [''])
                      }}
                      error={
                        !!errors.workgroups?.[props.workgroupIndex]
                          ?.permission?.[props.name]?.operands?.[props.index]
                          ?.arguments?.[1]?.[0]?.message
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
