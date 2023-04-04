import clsx from 'clsx'
import { InputHTMLAttributes, ReactNode } from 'react'

export function Form(props: {
  title: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={clsx('space-y-16', props.className)}>
      <h2 className="text-center text-3xl font-semibold leading-6 text-gray-900">
        {props.title}
      </h2>
      {props.children}
    </div>
  )
}

export function FormSection(props: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={props.className}>
      <h3 className="text-xl font-semibold leading-6 text-gray-900">
        {props.title}
      </h3>
      <p className="mb-6 mt-2 text-sm text-gray-500">{props.description}</p>
      {props.children}
    </div>
  )
}

export function FormFooter(props: { children: ReactNode }) {
  return (
    <div className="flex flex-row-reverse justify-between">
      {props.children}
    </div>
  )
}

export function FormItem(
  props: {
    label?: string
    description?: ReactNode
    error?: string
  } & InputHTMLAttributes<HTMLInputElement>,
) {
  const { children, className, ...restProps } = props

  return (
    <div {...restProps}>
      {props.label ? (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {props.label}
        </label>
      ) : null}
      {props.children}
      {props.error ? (
        <p className="mt-2 text-sm text-red-600">{props.error}</p>
      ) : null}
      {props.description ? (
        <p className="mt-2 text-sm text-gray-500">{props.description}</p>
      ) : null}
    </div>
  )
}
