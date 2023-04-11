import { compact } from 'lodash-es'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'

import { Community } from '../utils/schemas/community'
import { FormFooter, FormItem } from './basic/form'
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
  const { fields, append, remove } = useFieldArray({
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
              name={props.name}
              entry={props.entry}
              groupIndex={props.groupIndex}
              index={index}
              length={fields.length}
              open={open === index}
              setOpen={setOpen}
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
              arguments: [props.entry, [], '1'],
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
  name: 'voting'
  entry: string
  groupIndex: number
  index: number
  length: number
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
    trigger,
  } = useFormContext<Community>()
  const { setOpen, onRemove } = props
  const handleOpen = useCallback(() => {
    setOpen(props.index)
  }, [setOpen, props.index])
  const handleClose = useCallback(async () => {
    if (
      await trigger(
        `groups.${props.groupIndex}.permission.${props.name}.operands.${props.index}`,
      )
    ) {
      setOpen(undefined)
    }
  }, [props.groupIndex, props.index, props.name, setOpen, trigger])
  const handleRemove = useCallback(() => {
    setOpen(undefined)
    onRemove(props.index)
  }, [onRemove, props.index, setOpen])
  useEffect(() => {
    if (
      errors.groups?.[props.groupIndex]?.permission?.[props.name]?.operands?.[
        props.index
      ]
    ) {
      setOpen(props.index)
    }
  }, [errors.groups, props.index, props.name, props.groupIndex, setOpen])
  const suffix = watch(
    `groups.${props.groupIndex}.permission.${props.name}.operands.${props.index}.arguments.0`,
  )
  const regex = new RegExp(`\\.${suffix.replaceAll('.', '\\.')}\$`)

  return (
    <li className={props.open ? 'bg-gray-50' : undefined}>
      <div className="flex items-center justify-between px-6 py-4 text-sm">
        <span className="w-0 flex-1 truncate font-semibold">
          {watch(
            `groups.${props.groupIndex}.permission.${props.name}.operands.${props.index}.name`,
          ) || `Group ${props.index + 1}`}
        </span>
        <div className="ml-6 flex shrink-0 space-x-6">
          {props.open ? (
            props.disabled ? (
              <TextButton
                disabled={!props.disabled}
                onClick={() => setOpen(undefined)}
              >
                {props.disabled ? 'Hide' : 'Editing'}
              </TextButton>
            ) : null
          ) : (
            <TextButton primary onClick={handleOpen}>
              {props.disabled ? 'View' : 'Edit'}
            </TextButton>
          )}
        </div>
      </div>
      {props.open ? (
        <Grid6 className="px-6 pb-4 pt-2">
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
                placeholder={`Group ${props.index + 1}`}
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
                        value: 'all',
                        name: `All of ${suffix}'s SubDIDs`,
                      },
                      {
                        value: 'allowlist',
                        name: `Some of ${suffix}'s SubDIDs`,
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
          {props.disabled ? null : (
            <GridItem6>
              <div className="flex items-center justify-end">
                {props.length > 1 ? (
                  <TextButton onClick={handleRemove} className="mr-6">
                    Remove
                  </TextButton>
                ) : null}
                <Button primary onClick={handleClose}>
                  {props.disabled ? 'Hide' : 'Done'}
                </Button>
              </div>
            </GridItem6>
          )}
        </Grid6>
      ) : null}
    </li>
  )
}
