import { compact } from 'lodash-es'
import { useCallback } from 'react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'

import { Community } from '../utils/schemas/community'
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
  const { watch, control } = useFormContext<Community>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `groups.${props.groupIndex}.permission.${props.name}.operands`,
  })
  const operands = watch(
    `groups.${props.groupIndex}.permission.${props.name}.operands`,
    fields,
  )

  return (
    <>
      {operands.length ? (
        <ul role="list" className="space-y-4">
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
              length={operands.length}
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
          }}
          className="mt-4"
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
  onRemove(index: number): void
  disabled?: boolean
}) {
  const {
    control,
    watch,
    register,
    formState: { errors },
  } = useFormContext<Community>()
  const { onRemove } = props
  const handleRemove = useCallback(() => {
    onRemove(props.index)
  }, [onRemove, props.index])
  const suffix =
    watch(
      `groups.${props.groupIndex}.permission.${props.name}.operands.${props.index}.arguments.0`,
    ) || ''
  const regex = new RegExp(`\\.${suffix.replaceAll('.', '\\.')}\$`)

  return (
    <li className="overflow-hidden rounded-md border border-gray-200">
      <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-3 text-sm">
        <span className="w-0 flex-1 truncate">
          {watch(
            `groups.${props.groupIndex}.permission.${props.name}.operands.${props.index}.name`,
          ) || `Group ${props.index + 1}`}
        </span>
        {props.disabled || props.length === 1 ? null : (
          <TextButton
            secondary
            onClick={handleRemove}
            className="ml-4 flex shrink-0"
          >
            Remove
          </TextButton>
        )}
      </div>
      <Grid6 className="px-6 py-4">
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
                      Array.isArray(value) ? (value as string[]).join('\n') : ''
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
    </li>
  )
}
