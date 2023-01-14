import { InputHTMLAttributes } from 'react'

export default function FormItem(
  props: {
    label?: string
    description?: string
    error?: string
  } & InputHTMLAttributes<HTMLInputElement>,
) {
  const { children, className, ...restProps } = props

  return (
    <div {...restProps}>
      {props.label ? (
        <label className="block text-sm font-medium text-gray-700">
          {props.label}
        </label>
      ) : null}
      <div className="mt-1">{props.children}</div>
      {props.error ? (
        <p className="mt-2 text-sm text-red-600">{props.error}</p>
      ) : props.description ? (
        <p className="mt-2 text-sm text-gray-500">{props.description}</p>
      ) : null}
    </div>
  )
}
