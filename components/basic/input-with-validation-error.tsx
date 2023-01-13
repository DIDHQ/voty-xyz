import clsx from 'clsx'
import { InputHTMLAttributes, useId } from 'react'

export default function InputWithValidationError(
  props: {
    label: string
    error?: string
  } & InputHTMLAttributes<HTMLInputElement>,
) {
  const id = useId()
  const { children, className, ...restProps } = props

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {props.label}
      </label>
      <div className="mt-1">
        <input
          name={id}
          id={id}
          aria-invalid={props.error ? 'true' : 'false'}
          {...restProps}
          className={clsx(
            'block w-full rounded-md shadow-sm sm:text-sm',
            props.error
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500'
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
            className,
          )}
        />
      </div>
      {props.error ? (
        <p className="mt-2 text-sm text-red-600">{props.error}</p>
      ) : null}
    </div>
  )
}
