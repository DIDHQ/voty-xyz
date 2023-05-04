import { compact } from 'lodash-es'
import { Controller, useFormContext } from 'react-hook-form'

import { Group } from '../utils/schemas/v1/group'
import Textarea from './basic/textarea'

export default function BooleanSetsBlock(props: {
  name: 'proposing'
  communityId: string
  disabled?: boolean
}) {
  return (
    <BooleanUnitBlock
      name={props.name}
      communityId={props.communityId}
      index={0}
      disabled={props.disabled}
    />
  )
}

function BooleanUnitBlock(props: {
  name: 'proposing'
  communityId: string
  index: number
  disabled?: boolean
}) {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<Group>()

  const suffix =
    watch(`permission.${props.name}.operands.${props.index}.arguments.0`) ?? ''
  const regex = new RegExp(`\\.${suffix.replaceAll('.', '\\.')}\$`)

  return (
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
            !!errors?.permission?.[props.name]?.operands?.[props.index]
              ?.arguments?.[1]?.message ||
            !!errors?.permission?.[props.name]?.operands?.[props.index]
              ?.arguments?.[1]?.[0]?.message
          }
        />
      )}
    />
  )
}
