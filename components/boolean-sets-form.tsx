import { useCallback, useEffect } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form'

import { BooleanSets } from '../src/schemas'
import Button from './basic/button'
import Select from './basic/select'
import Slide from './basic/slide'
import JsonInput from './json-input'

export default function BooleanSetsForm(props: {
  value?: BooleanSets
  onChange(value: BooleanSets): void
}) {
  const methods = useForm<BooleanSets>({
    defaultValues: {
      operator: 'or',
      operands: [{ function: '', arguments: [] }],
    },
  })
  const { reset, handleSubmit } = methods
  useEffect(() => {
    reset(props.value)
  }, [props.value, reset])

  return (
    <div onBlur={handleSubmit(props.onChange, console.error)}>
      <FormProvider {...methods}>
        <BooleanSetsBlock />
      </FormProvider>
    </div>
  )
}

function BooleanSetsBlock() {
  const { control } = useFormContext<BooleanSets>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'operands',
  })

  return (
    <>
      <ul
        role="list"
        className="divide-y divide-gray-200 rounded-md border border-gray-200"
      >
        {fields.map((operand, index) => (
          <BooleanUnitBlock key={operand.id} index={index} onRemove={remove} />
        ))}
      </ul>
      <Button
        onClick={() => append({ function: '', arguments: [] })}
        className="mt-4"
      >
        Add
      </Button>
    </>
  )
}

function BooleanUnitBlock(props: {
  index: number
  onRemove(index: number): void
}) {
  const { control, watch } = useFormContext<BooleanSets>()
  const { onRemove } = props
  const handleRemove = useCallback(() => {
    onRemove(props.index)
  }, [onRemove, props.index])

  return (
    <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
      <div className="flex w-0 flex-1 items-center">
        <span className="ml-2 w-0 flex-1 truncate">
          {watch(`operands.${props.index}.name`)}
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
              <Controller
                control={control}
                name={`operands.${props.index}.function`}
                render={({ field: { value, onChange } }) => (
                  <Select
                    options={['is_did', 'is_sub_did_of', 'owns_erc721']}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name={`operands.${props.index}.arguments`}
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
