import { ReactNode } from 'react'
import clsx from 'clsx'

export default function FormItem(props: {
  label: string
  children: ReactNode
  direction?: 'horizontal' | 'vertical'
  gap?: number
  className?: string
  error?: string
}) {
  const { className } = props
  const cls = clsx({
    'form-control flex': true,
    'flex-row': props.direction === 'horizontal',
    [`gap-${props.gap}`]: props.gap,
  })

  return (
    <div className={clsx(cls, className)}>
      <label className="label whitespace-nowrap block">{props.label}</label>
      {props.children}
      {props.error ? <p className="mt-2 text-error">{props.error}</p> : null}
    </div>
  )
}
