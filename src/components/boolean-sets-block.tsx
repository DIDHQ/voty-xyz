import { compact } from 'lodash-es'
import {
  Controller,
  FieldError,
  FieldErrorsImpl,
  Merge,
  useFormContext,
} from 'react-hook-form'

import { Community } from '../utils/schemas/community'
import { Group } from '../utils/schemas/group'
import Textarea from './basic/textarea'

export default function BooleanSetsBlock(props: {
  name: 'proposing'
  entry: string
  groupIndex: number
  disabled?: boolean
}) {
  return (
    <BooleanUnitBlock
      name={props.name}
      entry={props.entry}
      groupIndex={props.groupIndex}
      index={0}
      disabled={props.disabled}
    />
  )
}

function BooleanUnitBlock(props: {
  name: 'proposing'
  entry: string
  groupIndex: number
  index: number
  disabled?: boolean
}) {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<Community>()
  const groupErrors = errors.groups?.[props.groupIndex] as Merge<
    FieldError,
    FieldErrorsImpl<NonNullable<Group>>
  >
  const suffix =
    watch(
      `groups.${props.groupIndex}.permission.${props.name}.operands.${props.index}.arguments.0`,
    ) ?? ''
  const regex = new RegExp(`\\.${suffix.replaceAll('.', '\\.')}\$`)

  return (
    <Controller
      control={control}
      name={`groups.${props.groupIndex}.permission.${props.name}.operands.${props.index}.arguments.1`}
      render={({ field: { ref, value, onChange } }) => (
        <Textarea
          ref={ref}
          autoCorrect="false"
          autoCapitalize="false"
          autoComplete="false"
          disabled={props.disabled}
          placeholder={`e.g.\nsatoshi.${suffix}\nvitalik.${suffix}`}
          shadow={`.${suffix}`}
          value={Array.isArray(value) ? (value as string[]).join('\n') : ''}
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
            !!groupErrors?.permission?.[props.name]?.operands?.[props.index]
              ?.arguments?.[1]?.message ||
            !!groupErrors?.permission?.[props.name]?.operands?.[props.index]
              ?.arguments?.[1]?.[0]?.message
          }
        />
      )}
    />
  )
}
