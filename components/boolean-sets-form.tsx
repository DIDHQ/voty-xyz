import { useEffect } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form'

import { BooleanSets, BooleanUnit } from '../src/schemas'
import Button from './basic/button'
import Select from './basic/select'
import TextInput from './basic/text-input'

export default function BooleanSetsForm(props: {
  value?: BooleanSets
  onChange(value: BooleanSets): void
}) {
  const methods = useForm<BooleanSets>({ defaultValues: props.value })
  const { reset, handleSubmit, watch } = methods
  useEffect(() => {
    reset(props.value)
  }, [props.value, reset])

  return (
    <>
      <FormProvider {...methods}>
        <BooleanSetsBlock path="" />
      </FormProvider>
      <Button primary onClick={handleSubmit(props.onChange, console.error)}>
        Confirm
      </Button>
      <pre>{JSON.stringify(watch(), null, 2)}</pre>
    </>
  )
}

function BooleanSetsBlock<T extends string>(props: { path: T }) {
  const { control } = useFormContext<{
    operator: 'and' | 'or' | 'not'
    operands: (BooleanSets | BooleanUnit)[]
  }>()
  const { fields, append } = useFieldArray({ control, name: 'operands' })

  return (
    <>
      <Controller
        control={control}
        name="operator"
        render={({ field: { value, onChange } }) => (
          <Select
            options={['and', 'or', 'not']}
            value={value}
            onChange={onChange}
          />
        )}
      />
      {fields.map((operand, index) =>
        'function' in operand ? (
          <BooleanUnitBlock
            key={operand.function + index}
            path={`${props.path}.${index}`}
          />
        ) : 'operator' in operand ? (
          <BooleanSetsBlock
            key={operand.operator + index}
            path={`${props.path}.${index}`}
          />
        ) : null,
      )}
      <Button onClick={() => append({ function: '', arguments: [] })}>
        Append Function
      </Button>
      <Button onClick={() => append({ operator: 'and', operands: [] })}>
        Append Operator
      </Button>
    </>
  )
}

function BooleanUnitBlock<T extends string>(props: { path: T }) {
  const { register } = useFormContext<BooleanSets>()

  return (
    <>
      <TextInput {...register(`${props.path}.function` as any)} />
    </>
  )
}
