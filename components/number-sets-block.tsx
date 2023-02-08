import { useCallback } from 'react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'

import { Community } from '../src/schemas'
import Select from './basic/select'
import Slide from './basic/slide'
import TextButton from './basic/text-button'
import TextInput from './basic/text-input'
import JsonInput from './json-input'

export default function NumberSetsBlock(props: {
  name: 'permission.voting'
  group: number
  disabled?: boolean
}) {
  const { control } = useFormContext<Community>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `groups.${props.group}.${props.name}.operands`,
  })

  return (
    <>
      {fields.length ? (
        <ul
          role="list"
          className="mb-4 divide-y divide-gray-200 rounded-md border"
        >
          {fields.map((operand, index) => (
            <NumberUnitBlock
              key={operand.id}
              name={props.name}
              group={props.group}
              index={index}
              onRemove={remove}
              disabled={props.disabled}
            />
          ))}
        </ul>
      ) : null}
      {props.disabled ? null : (
        <TextButton onClick={() => append({ function: '', arguments: [] })}>
          Add
        </TextButton>
      )}
    </>
  )
}

function NumberUnitBlock(props: {
  index: number
  name: 'permission.voting'
  group: number
  onRemove(index: number): void
  disabled?: boolean
}) {
  const { control, watch, register } = useFormContext<Community>()
  const { onRemove } = props
  const handleRemove = useCallback(() => {
    onRemove(props.index)
  }, [onRemove, props.index])
  return (
    <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
      <div className="flex w-0 flex-1 items-center">
        <span className="ml-2 w-0 flex-1 truncate">
          {watch(
            `groups.${props.group}.${props.name}.operands.${props.index}.name`,
          ) || `Sets #${props.index + 1}`}
        </span>
      </div>
      <div className="ml-4 flex shrink-0 space-x-4">
        <Slide
          title="Config"
          trigger={({ handleOpen }) => (
            <TextButton onClick={handleOpen}>
              {props.disabled ? 'View' : 'Edit'}
            </TextButton>
          )}
        >
          {({ handleClose }) => (
            <>
              <TextInput
                {...register(
                  `groups.${props.group}.${props.name}.operands.${props.index}.name`,
                )}
              />
              <Controller
                control={control}
                name={`groups.${props.group}.${props.name}.operands.${props.index}.function`}
                render={({ field: { value, onChange } }) => (
                  <Select
                    options={['static_power', 'erc20_balance']}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name={`groups.${props.group}.${props.name}.operands.${props.index}.arguments`}
                render={({ field: { value, onChange } }) => (
                  <JsonInput value={value} onChange={onChange} />
                )}
              />
            </>
          )}
        </Slide>
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
  )
}
