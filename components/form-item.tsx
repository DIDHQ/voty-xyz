import { ReactNode } from 'react'
import clsx from 'clsx'

export default function FormItem(props: {
  label: string
  children: ReactNode
  direction?: 'horizontal' | 'vertical'
  gap?: number
  className?: string
  required?: boolean
  isError?: boolean
  errorMessage?: string
}) {
  const { className, isError, errorMessage } = props
  const cls = clsx({
    'form-control flex': true,
    'flex-row': props.direction === 'horizontal',
    [`gap-${props.gap}`]: props.gap,
  })

  return (
    <div className={clsx(cls, className)}>
      <label className="label whitespace-nowrap block">
        {props.label}
        {props.required && <span className="ml-1 text-warning">*</span>}
      </label>
      {props.children}
      {isError ? <p className="mt-2 text-error">{errorMessage}</p> : null}
    </div>
  )
}
