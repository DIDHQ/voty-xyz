export default function RadioGroup(props: {
  options: { value: string; name: string }[]
  value: string
  onChange(value: string): void
  className?: string
}) {
  const { onChange } = props

  return (
    <fieldset className={props.className}>
      <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-6">
        {props.options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              type="radio"
              checked={option.value === props.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor={option.value}
              className="ml-3 block text-sm text-gray-700"
            >
              {option.name}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  )
}