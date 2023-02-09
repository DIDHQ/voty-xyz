export default function RadioGroup(props: {
  options: {
    id: string
    name: string
    description: string
  }[]
  value: string
  onChange(value: string): void
}) {
  const { onChange } = props

  return (
    <fieldset>
      <div className="space-y-4">
        {props.options.map((option) => (
          <div key={option.id} className="relative flex items-start">
            <div className="flex h-5 items-center">
              <input
                aria-describedby={`${option.id}-description`}
                type="radio"
                checked={option.id === props.value}
                onChange={() => onChange(option.id)}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-gray-700">{option.name}</label>
              <p className="text-gray-500">{option.description}</p>
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  )
}
