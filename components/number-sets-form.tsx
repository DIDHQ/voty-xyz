import { Fragment, useEffect } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form'

import { NumberSets } from '../src/schemas'
import Button from './basic/button'
import Select from './basic/select'
import JsonInput from './json-input'

export default function NumberSetsForm(props: {
  value?: NumberSets
  onChange(value: NumberSets): void
}) {
  const methods = useForm<NumberSets>({
    defaultValues: {
      operator: 'sum',
      operands: [{ function: '', arguments: [] }],
    },
  })
  const { reset, handleSubmit, watch } = methods
  useEffect(() => {
    reset(props.value)
  }, [props.value, reset])

  return (
    <>
      <FormProvider {...methods}>
        <NumberSetsBlock />
      </FormProvider>
      <Button primary onClick={handleSubmit(props.onChange, console.error)}>
        Confirm
      </Button>
      <pre>{JSON.stringify(watch(), null, 2)}</pre>
    </>
  )
}

function NumberSetsBlock() {
  const { control } = useFormContext<NumberSets>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'operands',
  })

  return (
    <>
      {fields.map((operand, index) => (
        <Fragment key={operand.id}>
          <NumberUnitBlock index={index} />
          <Button onClick={() => remove(index)}>-</Button>
        </Fragment>
      ))}
      <Button
        onClick={() =>
          append({
            function: '',
            arguments: [],
          })
        }
      >
        Append Operator
      </Button>
    </>
  )
}

function NumberUnitBlock(props: { index: number }) {
  const { control } = useFormContext<NumberSets>()

  return (
    <>
      <Controller
        control={control}
        name={`operands.${props.index}.function`}
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
        name={`operands.${props.index}.arguments`}
        render={({ field: { value, onChange } }) => (
          <JsonInput value={value} onChange={onChange} />
        )}
      />
    </>
  )
}
