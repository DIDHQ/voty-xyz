import clsx from 'clsx'
import { ChangeEvent, useCallback } from 'react'

export default function DurationInput(props: {
  value: number
  onChange(value: number): void
  className?: string
}) {
  const { onChange } = props
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.valueAsNumber)
    },
    [onChange],
  )

  return (
    <div className={clsx('relative rounded-md shadow-sm', props.className)}>
      <input
        type="number"
        value={props.value}
        onChange={handleChange}
        className="block w-full rounded-md border-gray-300 pl-4 pr-24 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
      <div className="absolute inset-y-0 right-0 flex items-center">
        <select className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
          <option>Hours</option>
          <option>Weeks</option>
          <option>Days</option>
          <option>Months</option>
          <option>Years</option>
        </select>
      </div>
    </div>
  )
}
