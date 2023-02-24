export default function RadioGroup(props: {
  options: { value: string; name: string }[]
  disabled?: boolean
  value: string
  onChange(value: string): void
  className?: string
}) {
  const { onChange } = props

  return (
    <fieldset className={props.className}>
      {/* <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-6"> */}
      <div className="flex items-center space-y-0 space-x-6">
        {props.options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              type="radio"
              disabled={props.disabled}
              checked={option.value === props.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed"
            />
            <label
              htmlFor={option.value}
              onClick={() => onChange(option.value)}
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
