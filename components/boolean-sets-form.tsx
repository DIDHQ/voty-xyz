import { useEffect } from 'react'
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
import TextInput from './basic/text-input'

export default function BooleanSetsForm(props: {
  value?: BooleanSets
  onChange(value: BooleanSets): void
}) {
  const methods = useForm<BooleanSets>()
  const { reset, handleSubmit, watch } = methods
  useEffect(() => {
    reset(props.value)
  }, [props.value, reset])

  return (
    <>
      <FormProvider {...methods}>
        <BooleanSetsAndBlock />
      </FormProvider>
      <Button primary onClick={handleSubmit(props.onChange, console.error)}>
        Confirm
      </Button>
      <pre>{JSON.stringify(watch(), null, 2)}</pre>
    </>
  )
}

function BooleanSetsAndBlock() {
  const { control } = useFormContext<BooleanSets>()
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
      {fields.map((operand, index) => (
        <BooleanSetsOrBlock key={operand.operator + index} index={index} />
      ))}
      <Button onClick={() => append({ operator: 'and', operands: [] })}>
        Append Operator
      </Button>
    </>
  )
}

function BooleanSetsOrBlock(props: { index: number }) {
  const { control } = useFormContext<BooleanSets>()
  const { fields, append } = useFieldArray({
    control,
    name: `operands.${props.index}.operands`,
  })

  return (
    <>
      <Controller
        control={control}
        name={`operands.${props.index}.operator`}
        render={({ field: { value, onChange } }) => (
          <Select
            options={['and', 'or', 'not']}
            value={value}
            onChange={onChange}
          />
        )}
      />
      {fields.map((operand, index) => (
        <BooleanUnitBlock
          key={operand.function + index}
          i={props.index}
          index={index}
        />
      ))}
      <Button onClick={() => append({ function: '', arguments: [] })}>
        Append Function
      </Button>
    </>
  )
}

function BooleanUnitBlock(props: { i: number; index: number }) {
  const { register } = useFormContext<BooleanSets>()

  return (
    <>
      <TextInput
        {...register(`operands.${props.i}.operands.${props.index}.function`)}
      />
    </>
  )
}
