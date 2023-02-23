import { compact } from 'lodash-es'
import { useCallback, useState } from 'react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'

import { Community } from '../utils/schemas/community'
import { FormItem } from './basic/form'
import { Grid6, GridItem3, GridItem6 } from './basic/grid'
import RadioGroup from './basic/radio-group'
import TextButton from './basic/text-button'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'

export default function BooleanSetsBlock(props: {
  name: 'proposing' | 'adding_option'
  entry: string
  workgroupIndex: number
  disabled?: boolean
}) {
  const { control } = useFormContext<Community>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `workgroups.${props.workgroupIndex}.permission.${props.name}.operands`,
  })
  const [open, setOpen] = useState<number>()

  return (
    <>
      {fields.length ? (
        <ul
          role="list"
          className="divide-y divide-gray-200 border border-gray-200"
        >
          {fields.map((operand, index) => (
            <BooleanUnitBlock
              key={operand.id}
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
          onClick={() => {
            append({
              function: 'prefixes_dot_suffix_exact_match',
              arguments: [props.entry, ['']],
            })
            setOpen(fields.length)
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
  name: 'proposing' | 'adding_option'
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

  return (
    <>
      <li className="flex items-center justify-between py-3 px-4 text-sm">
        <div className="flex w-0 flex-1 items-center">
          <span className="w-0 flex-1 truncate">
            {watch(
              `workgroups.${props.workgroupIndex}.permission.${props.name}.operands.${props.index}.alias`,
            ) || `Sets #${props.index + 1}`}
          </span>
        </div>
        <div className="ml-4 flex shrink-0 space-x-4">
          <TextButton onClick={handleOpen}>
            {props.open ? 'Hide' : props.disabled ? 'View' : 'Edit'}
          </TextButton>
          {props.disabled ? null : (
            <>
              <span className="text-gray-300" aria-hidden="true">
                |
              </span>
              <TextButton onClick={handleRemove}>Remove</TextButton>
            </>
          )}
        </div>
      </li>
      {props.open ? (
        <Grid6 className="bg-gray-50 p-6">
          <GridItem6>
            <FormItem
              label="Alias"
              error={
                errors.workgroups?.[props.workgroupIndex]?.permission?.[
                  props.name
                ]?.operands?.[props.index]?.alias?.message
              }
            >
              <TextInput
                disabled={props.disabled}
                {...register(
                  `workgroups.${props.workgroupIndex}.permission.${props.name}.operands.${props.index}.alias`,
                )}
                error={
                  !!errors.workgroups?.[props.workgroupIndex]?.permission?.[
                    props.name
                  ]?.operands?.[props.index]?.alias?.message
                }
                placeholder={`Sets #${props.index + 1}`}
              />
            </FormItem>
          </GridItem6>
          <GridItem3>
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
          </GridItem3>
          <GridItem3>
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
          </GridItem3>
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
                        const array = compact(e.target.value.split(/[\t\n, ]/))
                        onChange(array.length ? array : [''])
                      }}
                      onBlur={(e) => {
                        const suffix = watch(
                          `workgroups.${props.workgroupIndex}.permission.${props.name}.operands.${props.index}.arguments.0`,
                        )
                        const regex = new RegExp(
                          `\\.${suffix.replaceAll('.', '\\.')}\$`,
                        )
                        onChange(
                          e.target.value
                            .split('\n')
                            .map((line) => line.replace(regex, '')),
                        )
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
