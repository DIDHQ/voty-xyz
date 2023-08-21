import { clsx } from 'clsx'
import { ChangeEvent, Ref, useCallback, useEffect, useState } from 'react'

enum PhaseType {
  MINUTE = 60,
  HOUR = 60 * 60,
  DAY = 24 * 60 * 60,
}

const types = [PhaseType.DAY, PhaseType.HOUR, PhaseType.MINUTE]

export default function DurationInput(props: {
  inputRef: Ref<HTMLInputElement>
  value?: number
  onChange(value: number): void
  error?: boolean
  disabled?: boolean
  className?: string
}) {
  const { onChange } = props
  const [value, setValue] = useState(0)
  const [type, setType] = useState<PhaseType>(PhaseType.HOUR)
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.valueAsNumber)
  }, [])
  const handleTypeChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setType(parseInt(e.target.value) as PhaseType)
  }, [])
  const handleBlur = useCallback(() => {
    onChange(value * type)
  }, [onChange, type, value])
  useEffect(() => {
    if (!props.value) {
      setValue(0)
      setType(PhaseType.HOUR)
      return
    }
    for (const type of types) {
      if (props.value % type === 0) {
        setValue(props.value / type)
        setType(type)
        break
      }
    }
  }, [props.value])

  return (
    <div 
      className={clsx('relative', props.className)}>
      <input
        ref={props.inputRef}
        type="number"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={props.disabled}
        aria-invalid={props.error ? 'true' : 'false'}
        className={clsx(
          'block w-full rounded-xl border py-[11px] pr-24 text-sm text-strong transition placeholder:text-subtle focus:ring-0 disabled:cursor-not-allowed disabled:bg-subtle disabled:text-subtle',
          props.error
            ? 'border-red-300 focus:border-red-500'
            : 'border-base focus:border-strong'
        )}
      />
      
      <div 
        className="absolute inset-y-0 right-0 flex items-center">
        <select
          value={type}
          onChange={handleTypeChange}
          onBlur={handleBlur}
          disabled={props.disabled}
          className="h-full rounded-xl border-transparent bg-transparent py-0 pl-2 pr-8 text-sm text-subtle focus:border-transparent focus:ring-0 disabled:cursor-not-allowed">
          <option value={PhaseType.MINUTE}>Minutes</option>
          <option value={PhaseType.HOUR}>Hours</option>
          <option value={PhaseType.DAY}>Days</option>
        </select>
      </div>
    </div>
  )
}
