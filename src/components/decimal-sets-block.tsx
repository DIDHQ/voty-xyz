import { compact } from 'remeda'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'

import { Group } from '../utils/schemas/v1/group'
import { FormItem } from './basic/form'
import RadioGroup from './basic/radio-group'
import TextButton from './basic/text-button'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import Button from './basic/button'

export default function DecimalSetsBlock(props: {
  name: 'voting'
  communityId: string
  disabled?: boolean
}) {
  const { control } = useFormContext<Group>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `permission.${props.name}.operands`,
  })
  const [open, setOpen] = useState<number | undefined>(0)

  return (
    <>
      {fields.length ? (
        <ul 
          className="mb-4 divide-y divide-base overflow-hidden rounded-xl border border-base">
          {fields.map((operand, index) => (
            <DecimalUnitBlock
              key={operand.id}
              name={props.name}
              communityId={props.communityId}
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
              name: '',
              function: 'prefixes_dot_suffix_fixed_power',
              arguments: [props.communityId, [], '1'],
            })
            setOpen(fields.length)
          }}>
          Add
        </Button>
      )}
    </>
  )
}

function DecimalUnitBlock(props: {
  name: 'voting'
  communityId: string
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
  } = useFormContext<Group>()
  const { setOpen, onRemove } = props
  const handleOpen = useCallback(() => {
    setOpen(props.index)
  }, [setOpen, props.index])
  const handleClose = useCallback(async () => {
    if (await trigger(`permission.${props.name}.operands.${props.index}`)) {
      setOpen(undefined)
    }
  }, [props.index, props.name, setOpen, trigger])
  const handleRemove = useCallback(() => {
    setOpen(undefined)
    onRemove(props.index)
  }, [onRemove, props.index, setOpen])
  useEffect(() => {
    if (errors.permission?.[props.name]?.operands?.[props.index]) {
      setOpen(props.index)
    }
  }, [props.index, props.name, setOpen, errors.permission])
  const suffix =
    watch(
      `permission.${props.name}.operands.${props.index}.arguments.0`,
    )?.replace(/\.bit$/, '') ?? ''
  const regex = new RegExp(`\\.${suffix.replaceAll('.', '\\.')}\$`)

  return (
    <li 
      className={props.open ? 'bg-base' : undefined}>
      {!props.open ? (
        <div 
          className="flex items-center justify-between gap-6 px-4 py-3 text-sm md:px-6">
          <span 
            className="min-w-0 flex-1 truncate text-strong">
            {watch(`permission.${props.name}.operands.${props.index}.name`)}
          </span>
          
          <div 
            className="flex shrink-0 space-x-6">
            <TextButton 
              primary 
              onClick={handleOpen}>
              {props.disabled ? 'View' : 'Edit'}
            </TextButton>
            {/* {props.open ? (
              props.disabled ? (
                <TextButton
                  disabled={!props.disabled}
                  onClick={() => setOpen(undefined)}>
                  {props.disabled ? 'Hide' : 'Editing'}
                </TextButton>
              ) : null
            ) : (
              <TextButton 
                primary 
                onClick={handleOpen}>
                {props.disabled ? 'View' : 'Edit'}
              </TextButton>
            )} */}
          </div>
        </div>
      ) : (
        <div 
          className="grid grid-cols-1 gap-6 px-4 py-6 md:px-6 md:py-8">
          <FormItem
            label="Voter group name"
            error={
              errors.permission?.[props.name]?.operands?.[props.index]?.name
                ?.message
            }>
            <TextInput
              disabled={props.disabled}
              {...register(
                `permission.${props.name}.operands.${props.index}.name`,
              )}
              error={
                !!errors.permission?.[props.name]?.operands?.[props.index]
                  ?.name?.message
              }
              placeholder={`e.g. Core members`}
            />
          </FormItem>
          
          <FormItem
            label="Voting power"
            description="Each SubDID in this voter group has an equal voting power."
            error={
              errors.permission?.[props.name]?.operands?.[props.index]
                ?.arguments?.[2]?.message
            }>
            <TextInput
              disabled={props.disabled}
              {...register(
                `permission.${props.name}.operands.${props.index}.arguments.2`,
              )}
              error={
                !!errors.permission?.[props.name]?.operands?.[props.index]
                  ?.arguments?.[2]?.message
              }
            />
          </FormItem>

          <FormItem 
            label="Voter group members"
            labelClassName="mb-3">
            <Controller
              control={control}
              name={`permission.${props.name}.operands.${props.index}.arguments.1`}
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

          {watch(`permission.${props.name}.operands.${props.index}.arguments.1`)
            ?.length ? (
            <FormItem
              error={
                errors.permission?.[props.name]?.operands?.[props.index]
                  ?.arguments?.[1]?.message ||
                errors.permission?.[props.name]?.operands?.[props.index]
                  ?.arguments?.[1]?.[0]?.message
              }>
              <Controller
                control={control}
                name={`permission.${props.name}.operands.${props.index}.arguments.1`}
                render={({ field: { ref, value, onChange } }) => (
                  <Textarea
                    ref={ref}
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
                          .map((line) =>
                            line.replace(regex, '').trim().toLowerCase(),
                          ),
                      )
                      onChange(array.length ? array : [''])
                    }}
                    error={
                      !!errors.permission?.[props.name]?.operands?.[
                        props.index
                      ]?.arguments?.[1]?.message ||
                      !!errors.permission?.[props.name]?.operands?.[
                        props.index
                      ]?.arguments?.[1]?.[0]?.message
                    }
                  />
                )}
              />
            </FormItem>
          ) : null}
          
          {props.disabled ? null : (
            <div
              className="flex items-center justify-end gap-6">
              {props.length > 1 ? (
                <TextButton 
                  onClick={handleRemove}>
                  Remove
                </TextButton>
              ) : null}
              
              <Button 
                primary 
                onClick={handleClose}>
                {props.disabled ? 'Hide' : 'Done'}
              </Button>
            </div>
          )}
        </div>
      )}
    </li>
  )
}
