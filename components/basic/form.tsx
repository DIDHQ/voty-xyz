import clsx from 'clsx'
import { InputHTMLAttributes, ReactNode } from 'react'

export function Form(props: { className?: string; children: ReactNode }) {
  return (
    <div
      className={clsx('space-y-8 divide-y divide-gray-200', props.className)}
    >
      {props.children}
    </div>
  )
}

export function FormSection(props: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div>
      <h3 className="mt-8 text-lg font-medium leading-6 text-gray-900">
        {props.title}
      </h3>
      <p className="mt-1 mb-6 text-sm text-gray-500">{props.description}</p>
      {props.children}
    </div>
  )
}

export function FormFooter(props: { children: ReactNode }) {
  return (
    <div className="flex flex-row-reverse justify-between pt-6">
      {props.children}
    </div>
  )
}

export function FormItem(
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
      <div className={props.label ? 'mt-1' : undefined}>{props.children}</div>
      {props.error ? (
        <p className="mt-2 text-sm text-red-600">{props.error}</p>
      ) : props.description ? (
        <p className="mt-2 text-sm text-gray-500">{props.description}</p>
      ) : null}
    </div>
  )
}
