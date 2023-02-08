import { useCallback } from 'react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'

import { Community } from '../src/schemas'
import Button from './basic/button'
import Select from './basic/select'
import Slide from './basic/slide'
import TextInput from './basic/text-input'
import JsonInput from './json-input'

export default function NumberSetsBlock(props: {
  name: 'permission.voting'
  group: number
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
          className="mb-4 divide-y divide-gray-200 rounded-md border border-gray-200"
        >
          {fields.map((operand, index) => (
            <NumberUnitBlock
              key={operand.id}
              name={props.name}
              group={props.group}
              index={index}
              onRemove={remove}
            />
          ))}
        </ul>
      ) : null}
      <Button onClick={() => append({ function: '', arguments: [] })}>
        Add
      </Button>
    </>
  )
}

function NumberUnitBlock(props: {
  index: number
  name: 'permission.voting'
  group: number
  onRemove(index: number): void
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
          )}
        </span>
      </div>
      <div className="ml-4 flex shrink-0 space-x-4">
        <Slide
          title="Config"
          trigger={({ handleOpen }) => (
            <button
              type="button"
              onClick={handleOpen}
              className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Edit
            </button>
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
        <span className="text-gray-300" aria-hidden="true">
          |
        </span>
        <button
          type="button"
          onClick={handleRemove}
          className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Remove
        </button>
      </div>
    </li>
  )
}
