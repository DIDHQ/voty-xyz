import { ChangeEvent, useCallback, useMemo } from 'react'
import { Input } from 'react-daisyui'

export default function NumericInput(props: {
  value: number
  onChange(value: number): void
}) {
  const value = useMemo(
    () => (isNaN(props.value) ? '' : props.value.toString()),
    [props.value],
  )
  const { onChange } = props
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const output = parseInt(e.target.value, 10)
      onChange(isNaN(output) ? 0 : output)
    },
    [onChange],
  )

  return <Input type="number" value={value} onChange={handleChange} />
}
