import clsx from 'clsx'
import { ReactNode } from 'react'

export function Form(props: { className?: string; children: ReactNode }) {
  return (
    <div
      className={clsx('space-y-6 divide-y divide-gray-200', props.className)}
    >
      {props.children}
    </div>
  )
}

export function FormSection(props: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="my-6 text-lg font-medium leading-6 text-gray-900">
        {props.title}
      </h3>
      {props.children}
    </div>
  )
}

export function FormFooter(props: { children: ReactNode }) {
  return <div className="flex justify-between pt-6">{props.children}</div>
}
