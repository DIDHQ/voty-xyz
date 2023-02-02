import clsx from 'clsx'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'

enum DurationType {
  HOUR = 60 * 60,
  DAY = 24 * 60 * 60,
  WEEK = 7 * 24 * 60 * 60,
  MONTH = 30 * 24 * 60 * 60,
  YEAR = 364 * 24 * 60 * 60,
}

export default function DurationInput(props: {
  value: number
  onChange(value: number): void
  className?: string
}) {
  const { onChange } = props
  const [value, setValue] = useState(1)
  const [type, setType] = useState<DurationType>(DurationType.HOUR)
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.valueAsNumber)
  }, [])
  const handleTypeChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setType(parseInt(e.target.value) as DurationType)
  }, [])
  const handleBlur = useCallback(() => {
    onChange(value * type)
  }, [onChange, type, value])
  useEffect(() => {
    for (let type of [
      DurationType.YEAR,
      DurationType.MONTH,
      DurationType.WEEK,
      DurationType.DAY,
      DurationType.HOUR,
    ]) {
      if (props.value % type === 0) {
        setValue(props.value / type)
        setType(type)
        break
      }
    }
  }, [props.value])

  return (
    <div className={clsx('relative rounded-md shadow-sm', props.className)}>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className="block w-full rounded-md border-gray-300 pl-4 pr-24 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
      <div className="absolute inset-y-0 right-0 flex items-center">
        <select
          value={type}
          onChange={handleTypeChange}
          onBlur={handleBlur}
          className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value={DurationType.HOUR}>Hours</option>
          <option value={DurationType.DAY}>Days</option>
          <option value={DurationType.WEEK}>Weeks</option>
          <option value={DurationType.MONTH}>Months</option>
          <option value={DurationType.YEAR}>Years</option>
        </select>
      </div>
    </div>
  )
}
