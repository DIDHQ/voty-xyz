import { useCallback, useState } from 'react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'

import { Community } from '../src/schemas'
import { FormItem } from './basic/form'
import RadioGroup from './basic/radio-group'
import TextButton from './basic/text-button'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'

export default function BooleanSetsBlock(props: {
  name: 'proposing' | 'adding_option'
  group: number
  disabled?: boolean
}) {
  const { control } = useFormContext<Community>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `groups.${props.group}.permission.${props.name}.operands`,
  })
  const [open, setOpen] = useState<number>()

  return (
    <>
      {fields.length ? (
        <ul
          role="list"
          className="mb-4 divide-y divide-gray-200 rounded-md border border-gray-200"
        >
          {fields.map((operand, index) => (
            <BooleanUnitBlock
              key={operand.id}
              name={props.name}
              group={props.group}
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
        <TextButton onClick={() => append({ function: 'all', arguments: [] })}>
          Add
        </TextButton>
      )}
    </>
  )
}

function BooleanUnitBlock(props: {
  name: 'proposing' | 'adding_option'
  group: number
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
    setValue,
    formState: { errors },
  } = useFormContext<Community>()
  const { setOpen, onRemove } = props
  const handleOpen = useCallback(() => {
    setOpen(props.open ? undefined : props.index)
  }, [setOpen, props.open, props.index])
  const handleRemove = useCallback(() => {
    onRemove(props.index)
  }, [onRemove, props.index])
  const isAll =
    watch(
      `groups.${props.group}.permission.${props.name}.operands.${props.index}.function`,
    ) === 'all'

  return (
    <>
      <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
        <div className="flex w-0 flex-1 items-center">
          <span className="ml-2 w-0 flex-1 truncate">
            {watch(
              `groups.${props.group}.permission.${props.name}.operands.${props.index}.alias`,
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
        <div className="space-y-4 bg-gray-50 p-6">
          <FormItem
            label="Alias"
            error={
              errors.groups?.[props.group]?.permission?.[props.name]
                ?.operands?.[props.index]?.alias?.message
            }
          >
            <TextInput
              {...register(
                `groups.${props.group}.permission.${props.name}.operands.${props.index}.alias`,
              )}
              error={
                !!errors.groups?.[props.group]?.permission?.[props.name]
                  ?.operands?.[props.index]?.alias?.message
              }
              placeholder={`Sets #${props.index + 1}`}
            />
          </FormItem>
          <FormItem
            label="Filter"
            error={
              errors.groups?.[props.group]?.permission?.[props.name]
                ?.operands?.[props.index]?.function?.message
            }
          >
            <Controller
              control={control}
              name={`groups.${props.group}.permission.${props.name}.operands.${props.index}.function`}
              render={({ field: { value, onChange } }) => (
                <RadioGroup
                  options={[
                    {
                      id: 'sub_did',
                      name: 'SubDID',
                      description:
                        'SubDID of specified DIDs can create new proposal',
                    },
                    {
                      id: 'did',
                      name: 'DID',
                      description: 'Specified DIDs can create new proposal',
                    },
                    {
                      id: 'all',
                      name: 'All',
                      description: 'Everyone can create new proposal',
                    },
                  ]}
                  value={value}
                  onChange={(v) => {
                    if (value === 'all') {
                      setValue(
                        `groups.${props.group}.permission.${props.name}.operands.${props.index}.arguments`,
                        [],
                      )
                    }
                    onChange(v)
                  }}
                />
              )}
            />
          </FormItem>
          {isAll ? null : (
            <FormItem
              label="Whitelist"
              error={
                errors.groups?.[props.group]?.permission?.[props.name]
                  ?.operands?.[props.index]?.arguments?.message
              }
            >
              <Controller
                control={control}
                name={`groups.${props.group}.permission.${props.name}.operands.${props.index}.arguments.0`}
                render={({ field: { value, onChange } }) => (
                  <Textarea
                    value={
                      Array.isArray(value) ? (value as string[]).join('\n') : ''
                    }
                    onChange={(e) => onChange(e.target.value.split('\n'))}
                    placeholder={'e.g.\nregex.bit\n...'}
                  />
                )}
              />
            </FormItem>
          )}
        </div>
      ) : null}
    </>
  )
}
