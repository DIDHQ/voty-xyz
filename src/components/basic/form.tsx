import clsx from 'clsx'
import { InputHTMLAttributes, ReactNode } from 'react'

export function Form(props: {
  title: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={clsx('space-y-12', props.className)}>
      <h2 className="text-center text-3xl font-semibold leading-6 text-gray-900">
        {props.title}
      </h2>
      {props.children}
    </div>
  )
}

export function FormSection(props: {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={props.className}>
      {props.title ? (
        <h3 className="text-xl font-semibold leading-6 text-gray-900">
          {props.title}
        </h3>
      ) : null}
      {props.description ? (
        <p className="mt-1 mb-6 text-sm text-gray-500">{props.description}</p>
      ) : null}
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
        <label className="block text-sm font-medium text-gray-700">
          {props.label}
        </label>
      ) : null}
      <div className={props.label ? 'mt-1' : undefined}>{props.children}</div>
      {props.error ? (
        <p className="mt-1 text-sm text-red-600">{props.error}</p>
      ) : null}
      {props.description ? (
        <p className="mt-1 text-sm text-gray-500">{props.description}</p>
      ) : null}
    </div>
  )
}
