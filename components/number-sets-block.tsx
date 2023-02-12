import { useCallback, useState } from 'react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'

import { Community } from '../src/schemas'
import { FormItem } from './basic/form'
import RadioGroup from './basic/radio-group'
import TextButton from './basic/text-button'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'

const defaultPower = 1

export default function NumberSetsBlock(props: {
  name: 'voting'
  entry: string
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
            <NumberUnitBlock
              key={operand.id}
              name={props.name}
              entry={props.entry}
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
        <TextButton
          onClick={() =>
            append({
              function: 'prefixes_dot_suffix_fixed_power',
              arguments: [defaultPower, [''], props.entry],
            })
          }
        >
          Add
        </TextButton>
      )}
    </>
  )
}

function NumberUnitBlock(props: {
  name: 'voting'
  entry: string
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
            label="Base on"
            error={
              errors.groups?.[props.group]?.permission?.[props.name]
                ?.operands?.[props.index]?.arguments?.[2]?.message
            }
          >
            <Controller
              control={control}
              name={`groups.${props.group}.permission.${props.name}.operands.${props.index}.arguments.2`}
              render={({ field: { value, onChange } }) => (
                <RadioGroup
                  options={[
                    { value: props.entry, name: 'SubDID' },
                    { value: 'bit', name: '.bit' },
                    { value: 'eth', name: 'ENS' },
                  ]}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </FormItem>
          <FormItem
            label="Filter"
            error={
              errors.groups?.[props.group]?.permission?.[props.name]
                ?.operands?.[props.index]?.arguments?.[1]?.message
            }
          >
            <Controller
              control={control}
              name={`groups.${props.group}.permission.${props.name}.operands.${props.index}.arguments.1`}
              render={({ field: { value, onChange } }) => (
                <RadioGroup
                  options={[
                    { value: 'whitelist', name: 'Whitelist' },
                    { value: 'all', name: 'All' },
                  ]}
                  value={value.length ? 'whitelist' : 'all'}
                  onChange={(v) => onChange(v === 'whitelist' ? [''] : [])}
                />
              )}
            />
          </FormItem>
          {watch(
            `groups.${props.group}.permission.${props.name}.operands.${props.index}.arguments.1`,
          )?.length ? (
            <Controller
              control={control}
              name={`groups.${props.group}.permission.${props.name}.operands.${props.index}.arguments.1`}
              render={({ field: { value, onChange } }) => (
                <Textarea
                  value={
                    Array.isArray(value) ? (value as string[]).join('\n') : ''
                  }
                  onChange={(e) => onChange(e.target.value.split('\n'))}
                  placeholder={'e.g.\nregex.bit\n...'}
                  error={
                    !!errors.groups?.[props.group]?.permission?.[props.name]
                      ?.operands?.[props.index]?.arguments?.[1]?.message
                  }
                />
              )}
            />
          ) : null}
          <FormItem
            label="Power"
            error={
              errors.groups?.[props.group]?.permission?.[props.name]
                ?.operands?.[props.index]?.arguments?.[0]?.message
            }
          >
            <Controller
              defaultValue={defaultPower}
              control={control}
              name={`groups.${props.group}.permission.${props.name}.operands.${props.index}.arguments.0`}
              render={({ field: { value, onChange } }) => (
                <TextInput
                  type="number"
                  value={value}
                  onChange={(e) => {
                    onChange(e.target.valueAsNumber)
                  }}
                  error={
                    !!errors.groups?.[props.group]?.permission?.[props.name]
                      ?.operands?.[props.index]?.arguments?.[0]?.message
                  }
                />
              )}
            />
          </FormItem>
        </div>
      ) : null}
    </>
  )
}
